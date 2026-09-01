// Utility to get remaining amount for the usage limit

import { Prisma } from "@prisma/client";

export function remainingAmount(cap: Prisma.Decimal, used: Prisma.Decimal): Prisma.Decimal {
   const remaining = cap.minus(used)
   return remaining.isNegative() ? new Prisma.Decimal(0) : remaining
}

export function isTransferAllowed(cap: Prisma.Decimal, used: Prisma.Decimal, amount: Prisma.Decimal): boolean {
   return used.plus(amount).lessThanOrEqualTo(cap)
}