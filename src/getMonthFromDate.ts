const getMonthFromDate = (dateStr: string): number => {
  const date = new Date(dateStr);
  return date.getMonth() + 1;
};

export { getMonthFromDate };
