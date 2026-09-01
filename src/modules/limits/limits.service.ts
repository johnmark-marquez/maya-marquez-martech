import { Injectable, NotFoundException   } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LimitWindowDto, UserLimitsResponseDto } from "./dto/user-limits-response.dto";
import { Prisma } from "@prisma/client";
import { endOfDayManila, endOfMonthManila, formatManilaIso, startOfDayInManila, startOfMonthInManila } from "../../common/manila-timezone";
import { remainingAmount } from "./utils/remaining";
import { limitWindowPassed, updateUsageBasedOnWindowLimits, UsageBuckets } from "./utils/limitWindows";

@Injectable()
export class LimitsService {
    constructor(private readonly prisma: PrismaService) {}

    async getByUserId(userId: string): Promise<UserLimitsResponseDto> {
        const user = await this.prisma.user.findUnique({ where: { id: userId }})
        if (!user) throw new NotFoundException(`User ${userId} not found`)

        return this.prisma.$transaction(async (tx) => {
            const policy = await tx.limitPolicy.findUnique({
                where: { code: 'SEND_MONEY'}
            })

            if (!policy) throw new NotFoundException('SEND_MONEY policy is not configured.')

            let userUsage = await tx.limitUsage.findUnique({ where: { userId }})
            if (!userUsage) throw new NotFoundException(`User limit usage for user ${userId} not found.`)

            const now = new Date()
            const data: Prisma.LimitUsageUpdateInput = {}

            const syncedLimitUsage = updateUsageBasedOnWindowLimits(userUsage, now)

            if (limitWindowPassed(userUsage, syncedLimitUsage)) {
                  userUsage = await tx.limitUsage.update({ 
                    where: { userId }, 
                    data: {
                        dailyUsed: syncedLimitUsage.dailyUsed,
                        monthlyUsed: syncedLimitUsage.monthlyUsed,
                        dailyPeriodStart: syncedLimitUsage.dailyPeriodStart,
                        monthlyPeriodStart: syncedLimitUsage.monthlyPeriodStart
                    }
                })
            }

            return {
                userId,
                policy: policy.code,
                daily: this.mapToLimitWindow(policy.dailyCap, userUsage.dailyUsed, startOfDayInManila(userUsage.dailyPeriodStart), endOfDayManila(userUsage.dailyPeriodStart)),
                monthly: this.mapToLimitWindow(policy.monthlyCap, userUsage.monthlyUsed, startOfMonthInManila(userUsage.monthlyPeriodStart), endOfMonthManila(userUsage.monthlyPeriodStart))
            }
        })

    }

    private mapToLimitWindow(cap: Prisma.Decimal, used: Prisma.Decimal, periodStart: Date, periodEnd: Date): LimitWindowDto {
        return {
            cap: cap.toFixed(2),
            used: used.toFixed(2),
            remaining: remainingAmount(cap, used).toFixed(2),
            periodStart: formatManilaIso(periodStart),
            periodEnd: formatManilaIso(periodEnd)
        }
    }
}