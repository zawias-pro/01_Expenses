/**
 * Example:
 * Input: "-1 234,56 PLN"
 * Output: -1234.56
 */
const parseAmount = (amountStr: string): number => {
  const normalizedAmount = amountStr
    .replaceAll(',', '.')
    .replaceAll(/[^0-9.-]/g, '')

  const parsed = parseFloat(normalizedAmount)
  if (isNaN(parsed)) {
    throw new Error(`Invalid amount: ${amountStr}`)
  }
  return parsed
}

export { parseAmount }
