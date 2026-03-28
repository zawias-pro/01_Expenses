import { getOrCreateCategoryId } from '../categoryUtils.ts'

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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const keyword = parts[0]!.trim()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const categoryName = parts[1]!.trim()
      if (keyword && categoryName) {
        // Use getOrCreateCategoryId to ensure same name gets same ID within this parse
        const categoryId = getOrCreateCategoryId(categoryName, metadata)
        if (!(categoryId in rules)) {
          rules[categoryId] = []
          metadata[categoryId] = categoryName
        }
        rules[categoryId]?.push(keyword)
      }
    }
  }
  return { rules, metadata }
}

export { parseRules }
