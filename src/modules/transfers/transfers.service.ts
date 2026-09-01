import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransferDto } from "./dto/create-transfer.dto";
import { TransferResponseDto } from "./dto/transfer-response.dto";
import { Prisma, TransactionStatus } from "@prisma/client";
import { isTransferAllowed, remainingAmount } from "../limits/utils/remaining";
import { updateUsageBasedOnWindowLimits } from "../limits/utils/limitWindows";
import { LimitExceededException } from "../limits/utils/limit-exceeded.exception";
import { PaginatedTransactionsDto } from "./dto/paginated-transactions.dto";

@Injectable()
export class TransfersService {
    constructor (private readonly prisma: PrismaService) {}

    async send(dto: CreateTransferDto): Promise<TransferResponseDto> {
        if (dto.senderId === dto.recipientId) throw new BadRequestException('Sender and recipient must be different users')
        
        const amount = new Prisma.Decimal(dto.amount)
        if (amount.lessThanOrEqualTo(0)) throw new BadRequestException('Amount must be greater than 0')

        const sender = await this.prisma.user.findUnique({
            where: { id: dto.senderId }
        })

        if (!sender) throw new NotFoundException(`User ${dto.senderId} not found`)

        const recipient = await this.prisma.user.findUnique({
            where: { id: dto.recipientId }
        })

        if (!recipient) throw new NotFoundException(`User ${dto.recipientId} not found`)
        
        return this.prisma.$transaction(async (tx) => {
            // Serialize queries for sending of funds and usage
            await tx.$queryRaw(
                Prisma.sql`SELECT 1 FROM "app"."wallets" WHERE "user_id" = ${dto.senderId}::uuid FOR UPDATE`
            )

            await tx.$queryRaw(
                Prisma.sql`SELECT 1 FROM "limits"."user_limit_usage" WHERE "user_id" = ${dto.senderId}::uuid FOR UPDATE`
            )

            // Get the Policy for Send Money
            const policy = await tx.limitPolicy.findUnique({
                where: { code: 'SEND_MONEY' }
            })

            // Find the senders wallet and sender limit usage
            const senderWallet = await tx.wallet.findUnique({
                where: { userId: dto.senderId }
            })

            const senderLimitUsage = await tx.limitUsage.findUnique({
                where: { userId: dto.senderId }
            })

            // Find the recipient wallet
            const recipientWallet = await tx.wallet.findUnique({
                where: { userId: dto.recipientId }
            })

   

            // Handling negative scenarios first before doing the transfer logic
            if (!senderWallet || !recipientWallet) throw new NotFoundException('Wallet is missing')
            if (!senderLimitUsage) throw new NotFoundException('Sender limit usage missing')
            if (!policy) throw new NotFoundException('SEND_MONEY policy is not configured')
            if (senderWallet.balance.lessThan(amount)) throw new ConflictException('Insufficient funds')

            // Initialized here since we are sure that the senderLimitUsage is not null
            const senderLimitWindow = updateUsageBasedOnWindowLimits(senderLimitUsage, new Date())
            if (!isTransferAllowed(policy.dailyCap, senderLimitWindow.dailyUsed, amount)) throw new LimitExceededException('DAILY', remainingAmount(policy.dailyCap, senderLimitWindow.dailyUsed).toFixed(2))
            if (!isTransferAllowed(policy.monthlyCap, senderLimitWindow.monthlyUsed, amount)) throw new LimitExceededException('MONTHLY', remainingAmount(policy.monthlyCap, senderLimitWindow.monthlyUsed).toFixed(2))
            
            // Update wallets for sender and recipient
            await tx.wallet.update({
                where: { userId: dto.senderId },
                data: { balance: senderWallet.balance.minus(amount) }
            })

            await tx.wallet.update({
                where: { userId: dto.recipientId },
                data: { balance: { increment: amount }}
            })

            // Update the limit usage for the sender
            await tx.limitUsage.update({
                where: { userId: dto.senderId },
                data: {
                    dailyUsed: senderLimitWindow.dailyUsed.plus(amount),
                    monthlyUsed: senderLimitWindow.monthlyUsed.plus(amount),
                    dailyPeriodStart: senderLimitWindow.dailyPeriodStart,
                    monthlyPeriodStart: senderLimitWindow.monthlyPeriodStart
                }
            })

            // Create transaction for audit trail 
            const transaction = await tx.transaction.create({
                data: {
                    senderId: dto.senderId,
                    recipientId: dto.recipientId,
                    amount,
                    status: TransactionStatus.COMPLETED,
                    note: dto.note
                }
            })

            return this.mapToResponse(transaction)
        })
    }

    async listByUserId(userId: string, page = 1, pageSize = 20): Promise<PaginatedTransactionsDto> {
        const user = await this.prisma.user.findUnique({ where: { id: userId }})
        if (!user) throw new NotFoundException(`User ${userId} not found`)
        
        const query = {
            OR: [{ senderId: userId}, { recipientId: userId }]
        }

        const [total, rows] = await Promise.all([
            this.prisma.transaction.count({ where: query }),
            this.prisma.transaction.findMany({
                where: query,
                orderBy: { createdAt: 'desc'},
                skip: (page - 1) * pageSize,
                take: pageSize
            })
        ])

        return {
            items: rows.map((row) => ({
                ...this.mapToResponse(row),
                transactionItem: row.senderId === userId ? 'SENT' : 'RECEIVED'
            })),
            page,
            pageSize,
            total
        }
    }

    private mapToResponse(transfer: {
        id: string;
        senderId: string;
        recipientId: string;
        amount: Prisma.Decimal;
        status: string;
        note: string | null;
        createdAt: Date;
    }): TransferResponseDto {
        return {
            id: transfer.id,
            senderId: transfer.senderId,
            recipientId: transfer.recipientId,
            amount: transfer.amount.toFixed(2),
            status: transfer.status,
            note: transfer.note,
            createdAt: transfer.createdAt
        }
    }
}