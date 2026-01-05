import { useState } from 'react'
import type { Transaction } from '../../parsing/types.ts'

const TransactionsTable = ({
   transactions,
   categories,
   onExcludedChange,
   onCategoryChange,
   onDateChange,
   onOverrideModeChange,
}: {
  transactions: Transaction[]
  categories: string[]
  onExcludedChange: (id: string, excluded: boolean) => void
  onCategoryChange: (id: string, category: string) => void
  onDateChange: (id: string, date: string) => void
  onOverrideModeChange: (id: string, overrideMode: boolean) => void
}) => {
  const [onlyShowOthers, setOnlyShowOthers] = useState(false)

  // Filter transactions based on the "only show others" filter
  const filteredTransactions = onlyShowOthers
    ? transactions.filter(t => t.category === 'others')
    : transactions

  return (
    <div className="section">
      <h2 className="section-header">Transactions Table</h2>

      <div className="filter-controls">
        <label className="filter-label">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={onlyShowOthers}
            onChange={e => { setOnlyShowOthers(e.target.checked) }}
          />
          Only show "others" category
        </label>
        {onlyShowOthers && (
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            ({filteredTransactions.length} of {transactions.length} transactions)
          </span>
        )}
      </div>

      <div className="table-container" style={{ maxHeight: '60vh' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Exclude</th>
              <th>Override</th>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(t => (
              <tr key={t.id}>
                <td>
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={t.excluded}
                    onChange={e => { onExcludedChange(t.id, e.target.checked) }}
                    disabled={!t.isValid}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={t.overrideMode}
                    onChange={e => { onOverrideModeChange(t.id, e.target.checked) }}
                    disabled={!t.isValid}
                  />
                </td>
                <td>
                  {t.overrideMode ? (
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '120px' }}
                      value={t.date}
                      onChange={e => { onDateChange(t.id, e.target.value) }}
                      disabled={!t.isValid}
                    />
                  ) : (
                    <span>{t.date}</span>
                  )}
                </td>
                <td>{t.description}</td>
                <td>
                  {t.overrideMode ? (
                    <select
                      className="form-select"
                      style={{ minWidth: '150px' }}
                      value={t.category}
                      onChange={e => { onCategoryChange(t.id, e.target.value) }}
                      disabled={!t.isValid}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  ) : (
                    <span>{t.category}</span>
                  )}
                </td>
                <td>{t.amount}</td>
                <td>
                  {t.isValid ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span className="status-badge status-valid">✓ Valid</span>
                      {t.overridden && (
                        <span className="status-badge status-warning">⚠ Overridden</span>
                      )}
                    </div>
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

export { TransactionsTable }
