import { generateCategoryId } from '../categoryUtils.ts'

/**
 * Example:
 * Input: "walmart;grocery\nvodafone;mobile\ntransfer;transfers"
 * Output: { "cat_xyz": ["walmart"], "cat_abc": ["vodafone"], "cat_def": ["transfer"] }
 * Returns rules with category IDs as keys (not names)
 */
const parseRules = (content: string): { rules: Record<string, string[]>, metadata: Record<string, string> } => {
  const rules: Record<string, string[]> = {}
  const metadata: Record<string, string> = {}
  const lines = content.split('\n')
  for (const line of lines) {
    const parts = line.split(';')
    if (parts.length >= 2) {
      const keyword = parts[0].trim()
      const categoryName = parts[1].trim()
      if (keyword && categoryName) {
        const categoryId = generateCategoryId(categoryName)
        if (!(categoryId in rules)) {
          rules[categoryId] = []
          metadata[categoryId] = categoryName
        }
        rules[categoryId].push(keyword)
      }
    }
  }
  // Always include 'others' category
  const othersId = generateCategoryId('others')
  if (!(othersId in rules)) {
    rules[othersId] = []
    metadata[othersId] = 'others'
  }
  return { rules, metadata }
}

export { parseRules }
