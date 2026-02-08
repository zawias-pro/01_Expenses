import type { Transaction } from '../../../parsing/types.ts'
import styles from './CSVPreviewTable.module.css'

const CSVPreviewTable = ({
  transactions
}: {
  transactions: Transaction[]
}) => {
  if (transactions.length === 0) return null

  return (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Exclude</th>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={t.excluded}
                    disabled
                    readOnly
                  />
                </td>
                <td>{t.date}</td>
                <td>{t.description}</td>
                <td>{t.category}</td>
                <td>{t.amount}</td>
                <td>
                  {t.isValid ? 'ok' : 'invalid: '+t.validationError}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  )
}

export { CSVPreviewTable }
