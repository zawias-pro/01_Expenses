// Extracts month from date string (YYYY-MM-DD format)
export function getMonthFromDate(dateStr: string): number {
  const date = new Date(dateStr);
  return date.getMonth() + 1; // getMonth() returns 0-11, we want 1-12
}
