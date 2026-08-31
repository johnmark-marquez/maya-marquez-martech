import { startOfDay, startOfMonth } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

// Use Manila timezone for consistent date and time values
// Add offset for Manila timezone (UTC+8) to the current date and time
const MANILA_TZ = 'Asia/Manila';

export function startOfDayInManila(date: Date): Date {
  const zoned = toZonedTime(date, MANILA_TZ);
  const dayStart = startOfDay(zoned);
  return fromZonedTime(dayStart, MANILA_TZ);
}

export function startOfMonthInManila(date: Date): Date {
  const zoned = toZonedTime(date, MANILA_TZ);
  const monthStart = new Date(zoned.getFullYear(), zoned.getMonth(), 1);
  return fromZonedTime(monthStart, MANILA_TZ);
}