const globToRegex = (pattern: string) => {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^${escaped.replace(/\*/g, '.*').replace(/\?/g, '.')}$`, 'i')
}

const descriptionMatches = (description: string, pattern: string) =>
  description.toLowerCase().includes(pattern.toLowerCase()) ||
  globToRegex(pattern).test(description)

export { descriptionMatches }