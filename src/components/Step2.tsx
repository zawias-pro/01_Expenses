import type { Transaction } from '../parsing/types.ts'

const Step2 = ({
   transactions,
   categories,
   onExcludedChange,
   onCategoryChange,
   onDateChange,
   onBack,
   onNext
}: {
  transactions: Transaction[]
  categories: string[]
  onExcludedChange: (id: string, excluded: boolean) => void
  onCategoryChange: (id: string, category: string) => void
  onDateChange: (id: string, date: string) => void
  onBack: () => void
  onNext: () => void
}) => {
  return (
    <div>
      <h2>Step 2: Exclude Transactions</h2>
      <div className="transaction-table-container">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Exclude</th>
              <th>Date</th>
              <th>Description</th>
              <th>Account</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} className={`${t.excluded ? 'excluded-row' : ''} ${!t.isValid ? 'invalid-row' : ''}`}>
                <td>
                  <input
                    type="checkbox"
                    checked={t.excluded}
                    onChange={e => onExcludedChange(t.id, e.target.checked)}
                    disabled={!t.isValid}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={t.date}
                    onChange={e => onDateChange(t.id, e.target.value)}
                    style={{ width: '100px' }}
                    disabled={!t.isValid}
                  />
                </td>
                <td>{t.description}</td>
                <td>{t.account}</td>
                <td>
                  <select
                    value={t.category}
                    onChange={e => onCategoryChange(t.id, e.target.value)}
                    disabled={!t.isValid}
                    style={{ width: '120px' }}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </td>
                <td>{t.amount}</td>
                <td>
                  {t.isValid ? (
                    <div>
                      <span style={{ color: 'green' }}>✓ Valid</span>
                      {t.overridden && (
                        <div style={{ color: 'orange', fontSize: '0.8em' }}>⚠ Overridden</div>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: 'red' }}>
                      ✗ Error: {t.validationError}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={onBack} style={{ marginRight: '0.5rem' }}>Back</button>
        <button onClick={onNext}>Next</button>
      </div>
    </div>
  )
}

export { Step2 }


