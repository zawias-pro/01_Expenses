import type { Transaction } from 'dexie'

const revertCustomCategory = (tx: Transaction) =>
  tx.table('transactions').toCollection().modify((transaction: { customCategoryId?: number | null }) => {
    if (transaction.customCategoryId === undefined) {
      transaction.customCategoryId = null
    }
  })

export { revertCustomCategory }
