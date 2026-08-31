import type { Transaction } from 'dexie'

const backfillAccountId = (tx: Transaction) =>
  tx.table('transactions').toCollection().modify((transaction: { accountId?: number | null }) => {
    if (transaction.accountId === undefined) {
      transaction.accountId = null
    }
  })

export { backfillAccountId }