import { useState } from 'react'
import type { Transaction } from '../parsing/types.ts'

const Step2 = ({
   transactions,
   categories,
   rules,
   baseRules,
   customRules,
   onExcludedChange,
   onCategoryChange,
   onDateChange,
   onOverrideModeChange,
   onAddRule,
   onRemoveRule,
   onBack,
   onNext
}: {
  transactions: Transaction[]
  categories: string[]
  rules: Record<string, string>
  baseRules: Record<string, string>
  customRules: Record<string, string>
  onExcludedChange: (id: string, excluded: boolean) => void
  onCategoryChange: (id: string, category: string) => void
  onDateChange: (id: string, date: string) => void
  onOverrideModeChange: (id: string, overrideMode: boolean) => void
  onAddRule: (keyword: string, category: string) => void
  onRemoveRule: (keyword: string) => void
  onBack?: () => void
  onNext?: () => void
}) => {
  const [onlyShowOthers, setOnlyShowOthers] = useState(false)

  // Filter transactions based on the "only show others" filter
  const filteredTransactions = onlyShowOthers
    ? transactions.filter(t => t.category === 'others')
    : transactions

  return (
    <div>
      <h2>Transactions Table</h2>

      <div style={{ display: 'flex' }}>
        <label>
          <input
            type="checkbox"
            checked={onlyShowOthers}
            onChange={e => setOnlyShowOthers(e.target.checked)}
          />
          Only show "others" category
        </label>
        {onlyShowOthers && (
          <span>
            ({filteredTransactions.length} of {transactions.length} transactions)
          </span>
        )}
      </div>

      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <table style={{ width: '100%' }}>
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
                    checked={t.excluded}
                    onChange={e => { onExcludedChange(t.id, e.target.checked) }}
                    disabled={!t.isValid}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={t.overrideMode}
                    onChange={e => { onOverrideModeChange(t.id, e.target.checked) }}
                    disabled={!t.isValid}
                  />
                </td>
                <td>
                  {t.overrideMode ? (
                    <input
                      type="text"
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
                    <div>
                      <span>✓ Valid</span>
                      {t.overridden && (
                        <div>⚠ Overridden</div>
                      )}
                    </div>
                  ) : (
                    <span>
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

export { Step2 }
