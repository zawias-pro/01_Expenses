/**
 * Example:
 * Input: 1234.56
 * Output: "1 234,56"
 */
const formatPolishNumber = (num: number): string => {
  const sign = num < 0 ? '-' : ''
  const abs = Math.abs(num)
  const fixed = abs.toFixed(2) // e.g. "1234.56"
  const [intPart, frac] = fixed.split('.')

  return `${sign}${intPart},${frac}`
}

export { formatPolishNumber }
