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

  const categoryName = (categoryId: number) =>
    data.categories.find((category) => category.id === categoryId)?.name

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Amount</th>
          <th>Description</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
        {data.transactions.length === 0 ? (
          <tr>
            <td colSpan={3}>No transactions</td>
          </tr>
        ) : (
          data.transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.amount}</td>
              <td>{transaction.description}</td>
              <td>{categoryName(transaction.categoryId)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

export { TransactionsTable }