import { useStore } from "../../store/useStore.ts"
import styles from './StatusBar.module.css'

const formatAmount = (amount: number) => (
  Intl.NumberFormat(undefined, { style: 'currency', currency: 'PLN' }).format(amount)
)

const StatusBar = () => {
  const categories = useStore((state) => Object.values(state.categoryMetadata).length)
  const transactions = useStore((state) => state.transactions)
  const transactionsWithoutCategory = transactions.filter(t => t.category === null)
  const totalAmount = Math.abs(transactions.reduce((acc, curr) => acc + Math.min(curr.amount, 0), 0))
  const totalAmountNoCategory = Math.abs(transactionsWithoutCategory.reduce((acc, curr) => acc + Math.min(curr.amount, 0), 0))
  const transactionsWithoutCategoryShare = transactions.length === 0 ? 0 : Math.round((transactionsWithoutCategory.length / transactions.length) * 100)
  const totalAmountNoCategoryShare = totalAmount === 0 ? 0 : Math.round((totalAmountNoCategory / totalAmount) * 100)

  return (
    <div className={styles['status-bar']}>
      <div>Categories: {categories}</div>
      <div>
        Transactions: {transactions.length}{' '}
        ({transactionsWithoutCategoryShare}% without category)
      </div>
      <div>
        Total amount:{' '}
        {formatAmount(totalAmount)}{' '}
        ({totalAmountNoCategoryShare}% without category)
      </div>
    </div>
  )
}

export { StatusBar }
