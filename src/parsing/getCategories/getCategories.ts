/**
 * Example:
 * Input: { "walmart": "grocery", "vodafone": "mobile", "transfer": "transfers" }
 * Output: ["grocery", "mobile", "others", "transfers"]
 */
const getCategories = (rules: Record<string, string>): string[] => {
  const categories = new Set(Object.values(rules))
  categories.add('others') // Always include the default category
  return Array.from(categories).sort()
}

export { getCategories }
