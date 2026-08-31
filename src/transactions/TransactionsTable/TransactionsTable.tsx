import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db.ts'
import type { Category } from '../../categories/Category.ts'
import type { Transaction } from '../Transaction.ts'
import styles from './TransactionsTable.module.css'

type TableData = {
  transactions: Transaction[]
  categories: Category[]
}

const defaultData: TableData = { transactions: [], categories: [] }

const TransactionsTable = () => {
  const data = useLiveQuery(async () => {
    const [transactions, categories] = await Promise.all([
      db.transactions.toArray(),
      db.categories.toArray(),
    ])
    return { transactions, categories }
  }, [], defaultData)

  const categoryName = (categoryId: number | null) => {
    if (categoryId === null) {
      return '-'
    }
    const category = data.categories.find((category) => category.id === categoryId)
    if (!category) {
      throw new Error(`Transaction references unknown category ${categoryId}`)
    }
    return category.name
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Amount</th>
          <th>Description</th>
          <th>Category</th>
          <th>Imported</th>
        </tr>
      </thead>
      <tbody>
        {data.transactions.length === 0 ? (
          <tr>
            <td colSpan={4}>No transactions</td>
          </tr>
        ) : (
          data.transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.amount}</td>
              <td>{transaction.description}</td>
              <td>{categoryName(transaction.categoryId)}</td>
              <td>{new Date(transaction.importedAt).toLocaleString()}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

export { TransactionsTable }