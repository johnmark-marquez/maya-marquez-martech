import { startOfDay, startOfMonth, addDays, addMonths } from 'date-fns'
import { fromZonedTime, toZonedTime, formatInTimeZone } from 'date-fns-tz'

// Use Manila timezone for consistent date and time values
// Add offset for Manila timezone (UTC+8) to the current date and time
const MANILA_TZ = 'Asia/Manila';
const MANILA_ISO = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"

export function startOfDayInManila(date: Date): Date {
  const zoned = toZonedTime(date, MANILA_TZ);
  return fromZonedTime(startOfDay(zoned), MANILA_TZ);
}

export function startOfMonthInManila(date: Date): Date {
  const zoned = toZonedTime(date, MANILA_TZ);
  return fromZonedTime(startOfMonth(zoned), MANILA_TZ);
}

export function endOfDayManila(date: Date): Date {
    const zoned = toZonedTime(date, MANILA_TZ)
    return fromZonedTime(addDays(startOfDay(zoned), 1), MANILA_TZ )
}

export function endOfMonthManila(date: Date): Date {
    const zoned = toZonedTime(date, MANILA_TZ)
    return fromZonedTime(addMonths(startOfDay(zoned), 1), MANILA_TZ )
}

export function isSameDayAsManila(a: Date, b: Date): boolean {
    return startOfDayInManila(a).getTime() === startOfDayInManila(b).getTime()
}

export function isSameMonthAsManila(a: Date, b: Date): boolean {
    return startOfMonthInManila(a).getTime() === startOfMonthInManila(b).getTime()
}

export function formatManilaIso(date: Date): string {
    return formatInTimeZone(date, MANILA_TZ, MANILA_ISO)
}