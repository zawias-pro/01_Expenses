import type { Transaction } from 'dexie'

const backfillDate = (tx: Transaction) =>
  tx.table('transactions').toCollection().modify((transaction: { date?: number; importedAt: number }) => {
    if (transaction.date === undefined) {
      transaction.date = transaction.importedAt
    }
  })

export { backfillDate }