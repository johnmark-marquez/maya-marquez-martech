import { Prisma } from "@prisma/client";
import { isSameDayAsManila, isSameMonthAsManila, startOfDayInManila, startOfMonthInManila } from "../../../common/manila-timezone";

// Utility to check if the limits are within the date / time window for both daily and monthy limits
// Refresh the limit usages when the limit dates are over
export type UsageBuckets = {
    dailyUsed: Prisma.Decimal;
    monthlyUsed: Prisma.Decimal;
    dailyPeriodStart: Date;
    monthlyPeriodStart: Date;
}

export function updateUsageBasedOnWindowLimits(
    usage: UsageBuckets,
    now = new Date()
): UsageBuckets {
    const nextUsage:UsageBuckets = { ...usage }
    // Reset Daily Usage Limit
    if (!isSameDayAsManila(now, usage.dailyPeriodStart)) {
        nextUsage.dailyUsed = new Prisma.Decimal(0)
        nextUsage.dailyPeriodStart = startOfDayInManila(now)
    }

      // Reset Monyhly Usage Limit
    if (!isSameMonthAsManila(now, usage.dailyPeriodStart)) {
        nextUsage.monthlyUsed = new Prisma.Decimal(0)
        nextUsage.monthlyPeriodStart = startOfDayInManila(now)
    }
    return nextUsage
}

export function limitWindowPassed(before: UsageBuckets, after: UsageBuckets): boolean {
    return (
        before.dailyPeriodStart.getTime() !== after.dailyPeriodStart.getTime() || before.monthlyPeriodStart.getTime() !== after.monthlyPeriodStart.getTime()
    )
}
