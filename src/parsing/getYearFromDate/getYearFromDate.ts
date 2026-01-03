/**
 * Example:
 * Input: "2025-12-15"
 * Output: 2025
 */
const getYearFromDate = (dateStr: string): number => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`)
  }
  return date.getFullYear()
}

export { getYearFromDate }
