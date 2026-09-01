import type { Transaction } from 'dexie'

const normalizeDescriptionSpaces = (tx: Transaction) =>
  tx.table('transactions').toCollection().modify((transaction: { description: string }) => {
    let normalized = transaction.description.trim()
    // strip surrounding quotes left from old `quoteChar: ''` imports
    if (normalized.length >= 2 && normalized.startsWith('"') && normalized.endsWith('"')) {
      normalized = normalized.slice(1, -1)
    }
    normalized = normalized.trim().replace(/\s+/g, ' ')
    if (normalized !== transaction.description) {
      transaction.description = normalized
    }
  })

export { normalizeDescriptionSpaces }
