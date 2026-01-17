import type { CategoryMetadata } from '../categoryTypes.ts'
import { getCategoryIdFromName } from '../categoryUtils.ts'

/**
 * Example:
 * Input: "BIEDRONKA purchase", { "cat_xyz": ["biedronka"], "cat_abc": ["transfer"] }, { "cat_xyz": "grocery", "cat_abc": "transfers" }
 * Output: "cat_xyz"
 */
const classifyDescription = (
  description: string, 
  rules: Record<string, string[]>, // category ID -> keywords
  metadata: CategoryMetadata // category ID -> category name
): string => {
  const desc = description.toLowerCase()
  for (const [categoryId, keywords] of Object.entries(rules)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword.toLowerCase())) {
        return categoryId
      }
    }
  }
  // Return ID for 'others' category - look it up from metadata
  const othersId = getCategoryIdFromName('others', metadata)
  if (othersId) {
    return othersId
  }
  // Fallback: if 'others' doesn't exist, return first category ID or empty string
  // This should never happen since parseRules always creates 'others'
  const firstCategoryId = Object.keys(rules)[0]
  return firstCategoryId || ''
}

export { classifyDescription }
