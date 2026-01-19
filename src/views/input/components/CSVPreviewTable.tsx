import type { Transaction } from '../../../parsing/types.ts'
import styles from './CSVPreviewTable.module.css'

interface CSVPreviewTableProps {
  transactions: Transaction[]
}

const CSVPreviewTable = ({ transactions }: CSVPreviewTableProps) => {
  if (transactions.length === 0) return null

  return (
    <div>
      <h3 className={styles.sectionSubheader}>Preview (first 3 rows):</h3>
      <div className={styles.previewContainer}>
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
                    className={styles.formCheckbox}
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
                  {t.isValid ? (
                    <span className={`${styles.statusBadge} ${styles.statusValid}`}>✓ Valid</span>
                  ) : (
                    <span className={`${styles.statusBadge} ${styles.statusError}`}>
                      ✗ Error: {t.validationError}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { CSVPreviewTable }
