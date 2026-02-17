/**
 * Extracts unique category names from rules (rules are ID -> keywords; names come from metadata in practice).
 * Example: given rules with IDs, returns sorted list of category names from metadata.
 */
const getCategories = (rules: Record<string, string[]>): string[] => {
  return Array.from(Object.keys(rules)).sort()
}

export { getCategories }
