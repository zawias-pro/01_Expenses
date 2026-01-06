/**
 * Example:
 * Input: { "grocery": ["walmart"], "mobile": ["vodafone"], "transfers": ["transfer"] }
 * Output: ["grocery", "mobile", "others", "transfers"]
 */
const getCategories = (rules: Record<string, string[]>): string[] => {
  const categories = new Set(Object.keys(rules))
  categories.add('others') // Always include the default category
  return Array.from(categories).sort()
}

export { getCategories }
