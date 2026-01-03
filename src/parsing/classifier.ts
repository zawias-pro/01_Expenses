const parseRules = (content: string): Record<string, string> => {
  const rules: Record<string, string> = {}
  const lines = content.split('\n')
  for (const line of lines) {
    const parts = line.split(';')
    if (parts.length >= 2) {
      const keyword = parts[0].trim()
      const category = parts[1].trim()
      if (keyword && category) {
        rules[keyword] = category
      }
    }
  }
  return rules
}

const classifyDescription = (description: string, rules: Record<string, string>): string => {
  const desc = description.toLowerCase()
  for (const [keyword, category] of Object.entries(rules)) {
    if (desc.includes(keyword.toLowerCase())) {
      return category
    }
  }
  return 'others'
}

const getCategories = (rules: Record<string, string>): string[] => {
  const categories = new Set(Object.values(rules))
  categories.add('others') // Always include the default category
  return Array.from(categories).sort()
}

export { parseRules, classifyDescription, getCategories }
