import type { Transaction } from '../../../parsing/types.ts'
import styles from './CSVPreviewTable.module.css'
import { useStore } from '../../../store/useStore.ts'

const CSVPreviewTable = () => {
  const transactions = useStore((state) => state.transactions)

  if (transactions.length === 0) {
    return 'No data'
  }

  return (
    <table className={styles['table']}>
      <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Amount</th>
        <th>Errors</th>
      </tr>
      </thead>
      <tbody>
      {transactions.map((t: Transaction) => (
        <tr key={t.id}>
          <td>{t.date}</td>
          <td>{t.description}</td>
          <td>{t.amount}</td>
          <td>{t.validationError ?? '-'}</td>
        </tr>
      ))}
      </tbody>
    </table>
  )
}

export { CSVPreviewTable }
