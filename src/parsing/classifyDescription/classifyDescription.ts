/**
 * Example:
 * Input: "BIEDRONKA purchase", { "grocery": ["biedronka"], "transfers": ["transfer"] }
 * Output: "grocery"
 */
const classifyDescription = (description: string, rules: Record<string, string[]>): string => {
  const desc = description.toLowerCase()
  for (const [category, keywords] of Object.entries(rules)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword.toLowerCase())) {
        return category
      }
    }
  }
  return 'others'
}

export { classifyDescription }
