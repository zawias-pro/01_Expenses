import { useStore } from "../../store/useStore.ts"
import styles from './StatusBar.module.css'

const StatusBar = () => {
  const categories = useStore((state) => Object.values(state.categoryMetadata).length)
  const transactions = useStore((state) => state.transactions.length)

  return (
    <div className={styles['status-bar']}>
      <div>Categories: {categories}</div>
      <div>Transactions: {transactions}</div>
    </div>
  )
}

export { StatusBar }
