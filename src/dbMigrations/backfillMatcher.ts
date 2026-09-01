import type { Transaction } from 'dexie'

const backfillMatcher = (tx: Transaction) =>
  tx.table('categories').toCollection().modify((category: { matcher?: string }) => {
    if (category.matcher === undefined) {
      category.matcher = ''
    }
  })

export { backfillMatcher }