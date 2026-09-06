import type { Transaction } from 'dexie'

const addIgnored = (tx: Transaction) =>
  tx.table('transactions').toCollection().modify((transaction: { ignored?: boolean }) => {
    if (transaction.ignored === undefined) {
      transaction.ignored = false
    }
  })

export { addIgnored }
