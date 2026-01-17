import type { Transaction } from '../../../parsing/types.ts'

interface CSVPreviewTableProps {
  transactions: Transaction[]
}

const CSVPreviewTable = ({ transactions }: CSVPreviewTableProps) => {
  if (transactions.length === 0) return null

  return (
    <div>
      <h3 className="section-subheader">Preview (first 3 rows):</h3>
      <div className="preview-container">
        <table className="table">
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
                    className="form-checkbox"
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
                    <span className="status-badge status-valid">✓ Valid</span>
                  ) : (
                    <span className="status-badge status-error">
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
