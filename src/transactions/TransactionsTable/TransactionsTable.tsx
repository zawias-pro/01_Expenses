import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db.ts'
import type { Account } from '../../accounts/Account.ts'
import type { Category } from '../../categories/Category.ts'
import type { Transaction } from '../Transaction.ts'
import styles from './TransactionsTable.module.css'

type TableData = {
  transactions: Transaction[]
  categories: Category[]
  accounts: Account[]
}

const defaultData: TableData = { transactions: [], categories: [], accounts: [] }

const TransactionsTable = () => {
  const data = useLiveQuery(async () => {
    const [transactions, categories, accounts] = await Promise.all([
      db.transactions.toArray(),
      db.categories.toArray(),
      db.accounts.toArray(),
    ])
    return { transactions, categories, accounts }
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

  const accountName = (accountId: number | null) => {
    if (accountId === null) {
      return '-'
    }
    const account = data.accounts.find((account) => account.id === accountId)
    if (!account) {
      throw new Error(`Transaction references unknown account ${accountId}`)
    }
    return account.name
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Amount</th>
          <th>Description</th>
          <th>Category</th>
          <th>Account</th>
          <th>Imported</th>
        </tr>
      </thead>
      <tbody>
        {data.transactions.length === 0 ? (
          <tr>
            <td colSpan={5}>No transactions</td>
          </tr>
        ) : (
          data.transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.amount}</td>
              <td>{transaction.description}</td>
              <td>{categoryName(transaction.categoryId)}</td>
              <td>{accountName(transaction.accountId)}</td>
              <td>{new Date(transaction.importedAt).toLocaleString()}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

export { TransactionsTable }