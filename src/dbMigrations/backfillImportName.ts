import type { Transaction } from 'dexie'

const backfillImportName = (tx: Transaction) =>
  tx.table('transactions').toCollection().modify((transaction: { importName?: string | null }) => {
    if (transaction.importName === undefined) {
      transaction.importName = null
    }
  })

export { backfillImportName }