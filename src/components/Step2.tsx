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
  onBack: () => void
  onNext: () => void
}) => {
  const [newKeyword, setNewKeyword] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [onlyShowOthers, setOnlyShowOthers] = useState(false)

  const handleAddRuleClick = () => {
    if (newKeyword.trim() && newCategory.trim()) {
      onAddRule(newKeyword.trim(), newCategory.trim())
      setNewKeyword('')
      setNewCategory('')
    }
  }

  const isBaseRule = (keyword: string) => keyword in baseRules
  const isCustomRule = (keyword: string) => keyword in customRules

  // Filter transactions based on the "only show others" filter
  const filteredTransactions = onlyShowOthers
    ? transactions.filter(t => t.category === 'others')
    : transactions

  return (
    <div>
      <h2>Step 2: Exclude Transactions</h2>
      
      <div style={{ marginBottom: '2rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0 }}>Expense Categories</h3>
        <div style={{ marginBottom: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Keyword</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(rules)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([keyword, category]) => (
                <tr key={keyword} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem' }}>{keyword}</td>
                  <td style={{ padding: '0.5rem' }}>{category}</td>
                  <td style={{ padding: '0.5rem' }}>
                    {isBaseRule(keyword) ? (
                      <span style={{ color: '#666', fontSize: '0.9em' }}>Built-in</span>
                    ) : (
                      <span style={{ color: '#0066cc', fontSize: '0.9em' }}>Custom</span>
                    )}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    {isCustomRule(keyword) && (
                      <button
                        onClick={() => onRemoveRule(keyword)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.85em',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Keyword (e.g., 'netflix')"
            value={newKeyword}
            onChange={e => setNewKeyword(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '3px', minWidth: '150px' }}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                handleAddRuleClick()
              }
            }}
          />
          <input
            type="text"
            placeholder="Category (e.g., 'entertainment')"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '3px', minWidth: '150px' }}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                handleAddRuleClick()
              }
            }}
          />
          <button
            onClick={handleAddRuleClick}
            disabled={!newKeyword.trim() || !newCategory.trim()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: newKeyword.trim() && newCategory.trim() ? 'pointer' : 'not-allowed',
              opacity: newKeyword.trim() && newCategory.trim() ? 1 : 0.6
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={onlyShowOthers}
            onChange={e => setOnlyShowOthers(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span>Only show "others" category</span>
        </label>
        {onlyShowOthers && (
          <span style={{ color: '#666', fontSize: '0.9em' }}>
            ({filteredTransactions.length} of {transactions.length} transactions)
          </span>
        )}
      </div>

      <div className="transaction-table-container">
        <table className="transaction-table">
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
              <tr key={t.id} className={`${t.excluded ? 'excluded-row' : ''} ${!t.isValid ? 'invalid-row' : ''}`}>
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
                      style={{ width: '100px' }}
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
                      style={{ width: '120px' }}
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
