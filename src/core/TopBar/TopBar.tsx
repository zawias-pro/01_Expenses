import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db.ts'
import styles from './TopBar.module.css'

const TopBar = () => {
  const transactionCount = useLiveQuery(() => db.transactions.count(), [], 0)
  const categoryCount = useLiveQuery(() => db.categories.count(), [], 0)

  return (
    <header className={styles.topbar}>
      <span className={styles.count}>Transactions: {transactionCount}</span>
      <span className={styles.count}>Categories: {categoryCount}</span>
    </header>
  )
}

export { TopBar }