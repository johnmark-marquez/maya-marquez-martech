import { Prisma, UserStatus } from "@prisma/client"
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common"
import { startOfDayInManila, startOfMonthInManila } from "../../common/manila-timezone"
import { PrismaService } from "../prisma/prisma.service"
import { CreateUserDto } from "./dto/create-user.dto"
import { UserResponseDto } from "./dto/user-response.dto"
import { identity } from "rxjs"

type UserWithPiiAndWallet = Prisma.UserGetPayload<{ include: { identity: true, wallet: true }}>

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateUserDto): Promise<UserResponseDto> {
        const mobile = toE164(dto.mobile)
        const balance = dto.initialBalance ?? 0.00
        const now = new Date()

        try {
            const createdUser = await this.prisma.$transaction( async (tx) => {
                const user = await tx.user.create({
                    data: { status: UserStatus.ACTIVE }
                })

                const identity = await tx.identity.create({
                    data: {
                        userId: user.id,
                        mobile,
                        displayName: dto.displayName
                    }
                })

                const wallet = await tx.wallet.create({
                    data: { 
                        userId: user.id, 
                        balance 
                    }
                })

                await tx.limitUsage.create({
                    data: {
                        userId: user.id,
                        dailyUsed: 0,
                        monthlyUsed: 0,
                        dailyPeriodStart: startOfDayInManila(now),
                        monthlyPeriodStart: startOfMonthInManila(now)
                    }
                })

                return {
                    ...user,
                    identity,
                    wallet
                }
            })
            return mapToResponse(createdUser as UserWithPiiAndWallet)
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Mobile number already registered')
            throw error
        }
    }

    async findAll(): Promise<UserResponseDto[]> {
        const users = await this.prisma.user.findMany({
            include: { identity: true, wallet: true},
            orderBy: { createdAt: 'asc'}
        })

        return users.map(mapToResponse)
    }

       async findOne(id: string): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { identity: true, wallet: true},
        })

        if (!user) throw new NotFoundException(`User ${id} not found`)

        return mapToResponse(user)
    }

}

function mapToResponse(user: UserWithPiiAndWallet) {
    if (!user.identity || !user.wallet) throw new NotFoundException(`User ${user.id} is missing PII or wallet`)
    return {
        id: user.id,
        status: user.status,
        displayName: user.identity.displayName,
        mobile: user.identity.mobile,
        balance: user.wallet.balance.toFixed(2),
        createdAt: user.createdAt
    }
}

export function toE164(mobile: string):string  {
    const trimmed = mobile.replace(/\s+/g, '')
    if (trimmed.startsWith('09') && trimmed.length === 11) return `+63${trimmed.slice(1)}`
    return trimmed
}