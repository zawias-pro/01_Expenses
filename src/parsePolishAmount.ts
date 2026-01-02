// ...existing code...

/**
 * Converts Polish number format to a JavaScript number
 * Examples: "1 234,56 PLN" -> 1234.56, "-1 234,56 PLN" -> -1234.56
 */
export function parsePolishAmount(amountStr: string): number {
  // Remove " PLN" suffix and trim
  const cleanAmount = amountStr.replace(' PLN', '').trim();

  // Handle negative numbers (start with -)
  const isNegative = cleanAmount.startsWith('-');
  const amountWithoutSign = isNegative ? cleanAmount.substring(1) : cleanAmount;

  // Replace spaces with empty string and comma with dot
  const standardFormat = amountWithoutSign.replace(/\s/g, '').replace(',', '.');

  const parsed = parseFloat(standardFormat);
  return isNegative ? -parsed : parsed;
}

