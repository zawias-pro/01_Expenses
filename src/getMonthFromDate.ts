const getMonthFromDate = (dateStr: string): number => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`)
  }
  return date.getMonth() + 1
}

export { getMonthFromDate }
