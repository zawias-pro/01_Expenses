import { generateCategoryId } from '../categoryUtils.ts'

/**
 * Example:
 * Input: "BIEDRONKA purchase", { "cat_xyz": ["biedronka"], "cat_abc": ["transfer"] }, { "cat_xyz": "grocery", "cat_abc": "transfers" }
 * Output: "cat_xyz"
 */
const classifyDescription = (
  description: string, 
  rules: Record<string, string[]> // category ID -> keywords
): string => {
  const desc = description.toLowerCase()
  for (const [categoryId, keywords] of Object.entries(rules)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword.toLowerCase())) {
        return categoryId
      }
    }
  }
  // Return ID for 'others' category
  return generateCategoryId('others')
}

export { classifyDescription }
