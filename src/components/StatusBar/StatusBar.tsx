import { useStore } from "../../store/useStore.ts"
import styles from './StatusBar.module.css'

const formatAmount = (amount: number) => (
  Intl.NumberFormat(undefined, {style:'currency', currency: 'PLN'}).format(amount)
)

const StatusBar = () => {
  const categories = useStore((state) => Object.values(state.categoryMetadata).length)
  const transactions = useStore((state) => state.transactions.length)
  const transactionsWithoutCategory = useStore((state) => {
    return state.transactions.filter(t=>t.category===null).length
  })
  const transactionsWithoutCategoryShare = Math.round((transactions/transactionsWithoutCategory)*100)
  const totalAmount = useStore((state) => {
    return state.transactions.reduce((acc, curr) => {
      return acc + Math.max(curr.amount, 0)
    }, 0)
  })
  const totalAmountNoCategory = useStore((state) => {
    return state.transactions.filter(t=>t.category===null).reduce((acc, curr) => {
      return acc + Math.max(curr.amount, 0)
    }, 0)
  })
  const totalAmountNoCategoryShare = Math.round((totalAmountNoCategory / totalAmount) * 100)

  return (
    <div className={styles['status-bar']}>
      <div>Categories: {categories}</div>
      <div>Transactions: {transactions}</div>
      <div>Transactions without category: {transactionsWithoutCategory} ({transactionsWithoutCategoryShare}%)</div>
      <div>
        Total amount:{' '}
        {formatAmount(totalAmount)}{' '}
        ({formatAmount(totalAmountNoCategory)} / {totalAmountNoCategoryShare}% without category)
      </div>
    </div>
  )
}

export { StatusBar }
