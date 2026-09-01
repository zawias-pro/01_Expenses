import type { Transaction } from 'dexie'

const backfillCustomFields = (tx: Transaction) =>
  tx.table('transactions').toCollection().modify((transaction: { customDate?: string | null; customCategoryId?: number | null; comment?: string | null }) => {
    if (transaction.customDate === undefined) {
      transaction.customDate = null
    }
    if (transaction.customCategoryId === undefined) {
      transaction.customCategoryId = null
    }
    if (transaction.comment === undefined) {
      transaction.comment = null
    }
  })

export { backfillCustomFields }
