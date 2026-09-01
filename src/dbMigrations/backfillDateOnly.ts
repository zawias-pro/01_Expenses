import type { Transaction } from 'dexie'

const formatDateOnly = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const backfillDateOnly = (tx: Transaction) =>
  tx.table('transactions').toCollection().modify((transaction: { date?: string | number | Date }) => {
    if (typeof transaction.date === 'number') {
      transaction.date = formatDateOnly(new Date(transaction.date))
    } else if (typeof transaction.date === 'string') {
      const existing = new Date(transaction.date)
      if (!Number.isNaN(existing.getTime())) {
        transaction.date = formatDateOnly(existing)
      }
    } else if (transaction.date instanceof Date) {
      transaction.date = formatDateOnly(transaction.date)
    }
  })

export { backfillDateOnly }