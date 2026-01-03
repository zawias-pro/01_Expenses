import type { Transaction } from '../parsing/calculations.ts'

interface Step2Props {
  transactions: Transaction[]
  onExcludedChange: (id: string, excluded: boolean) => void
  onBack: () => void
  onNext: () => void
}

function Step2({ transactions, onExcludedChange, onBack, onNext }: Step2Props) {
  return (
    <div>
      <h2>Step 2: Exclude Transactions</h2>
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
              <td>{t.date}</td>
              <td>{t.description}</td>
              <td>{t.account}</td>
              <td>{t.category}</td>
              <td>{t.amount}</td>
              <td>
                {t.isValid ? (
                  <span style={{ color: 'green' }}>✓ Valid</span>
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
      <div style={{ marginTop: '1rem' }}>
        <button onClick={onBack} style={{ marginRight: '0.5rem' }}>Back</button>
        <button onClick={onNext}>Next</button>
      </div>
    </div>
  )
}

export { Step2 }


