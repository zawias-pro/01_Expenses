/**
 * Formats number for output (Polish format with spaces and comma)
 */
export function formatPolishNumber(num: number): string {
  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);
  const fixed = abs.toFixed(2); // e.g. "1234.56"
  let [intPart, frac] = fixed.split('.');
  // Insert non-breaking space as thousands separator
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  return `${sign}${intPart},${frac}`;
}
