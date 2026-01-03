/**
 * Example:
 * Input: "BIEDRONKA purchase", { "biedronka": "grocery", "transfer": "transfers" }
 * Output: "grocery"
 */
const classifyDescription = (description: string, rules: Record<string, string>): string => {
  const desc = description.toLowerCase()
  for (const [keyword, category] of Object.entries(rules)) {
    if (desc.includes(keyword.toLowerCase())) {
      return category
    }
  }
  return 'others'
}

export { classifyDescription }
