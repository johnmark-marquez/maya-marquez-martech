// Use Manila timezone for consistent date and time values
// Add offset for Manila timezone (UTC+8) to the current date and time
const MANILA_OFFSET = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

export function startOfDayInManila(date: Date): Date {
    const manilaDate = new Date(date.getTime() + MANILA_OFFSET);
    return new Date(manilaDate.getTime() - MANILA_OFFSET);
}

export function startOfMonthInManila(date: Date): Date {
    const manilaDate = new Date(date.getTime() + MANILA_OFFSET);
    const startOfMonth = new Date(manilaDate.getFullYear(), manilaDate.getMonth(), 1);
    return new Date(startOfMonth.getTime() - MANILA_OFFSET);
}