const parsePolishAmount = (amountStr: string): number => {
  const cleanAmount = amountStr.replace(' PLN', '').trim();
  const isNegative = cleanAmount.startsWith('-');
  const amountWithoutSign = isNegative ? cleanAmount.substring(1) : cleanAmount;
  const standardFormat = amountWithoutSign.replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(standardFormat);
  if (isNaN(parsed)) {
    throw new Error(`Invalid amount: ${amountStr}`);
  }
  return isNegative ? -parsed : parsed;
};

export { parsePolishAmount };
