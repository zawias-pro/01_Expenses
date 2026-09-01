import { descriptionMatches } from '../transactions/TransactionsTable/descriptionMatches.ts'

const categoryMatchesDescription = (matcher: string, description: string) =>
  matcher
    .split(';')
    .map((pattern) => pattern.trim())
    .filter((pattern) => pattern !== '')
    .some((pattern) => descriptionMatches(description, pattern))

export { categoryMatchesDescription }