import type { Transaction } from 'dexie'

const backfillDateIso = (tx: Transaction) =>
  tx.table('transactions').toCollection().modify((transaction: { date?: string | number }) => {
    if (typeof transaction.date === 'number') {
      transaction.date = new Date(transaction.date).toISOString()
    }
  })

export { backfillDateIso }