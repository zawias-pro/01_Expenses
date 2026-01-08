/**
 * Example:
 * Input: "walmart;grocery\nvodafone;mobile\ntransfer;transfers"
 * Output: { "grocery": ["walmart"], "mobile": ["vodafone"], "transfers": ["transfer"] }
 */
const parseRules = (content: string): Record<string, string[]> => {
  const rules: Record<string, string[]> = {}
  const lines = content.split('\n')
  for (const line of lines) {
    const parts = line.split(';')
    if (parts.length >= 2) {
      const keyword = parts[0].trim()
      const category = parts[1].trim()
      if (keyword && category) {
        if (!(category in rules)) {
          rules[category] = []
        }
        rules[category].push(keyword)
      }
    }
  }
  return rules
}

export { parseRules }
