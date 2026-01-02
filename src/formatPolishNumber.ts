/**
 * Formats number for output (Polish format with spaces and comma)
 */
const formatPolishNumber = (num: number): string => {
  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);
  const fixed = abs.toFixed(2); // e.g. "1234.56"
  let [intPart, frac] = fixed.split('.');
  // Thousands separator removed as per request
  return `${sign}${intPart},${frac}`;
};

export { formatPolishNumber };
