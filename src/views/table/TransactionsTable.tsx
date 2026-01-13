import { useMemo } from 'react'
import type { Transaction } from '../../parsing/types.ts'

const TransactionsTable = ({
   transactions,
   categories,
   onlyShowOthers,
   onOnlyShowOthersChange,
   amountSortDirection,
   onAmountSortDirectionChange,
   onExcludedChange,
   onCategoryChange,
   onDateChange,
   onOverrideModeChange,
}: {
  transactions: Transaction[]
  categories: string[]
  onlyShowOthers: boolean
  onOnlyShowOthersChange: (value: boolean) => void
  amountSortDirection: 'asc' | 'desc' | null
  onAmountSortDirectionChange: (direction: 'asc' | 'desc' | null) => void
  onExcludedChange: (id: string, excluded: boolean) => void
  onCategoryChange: (id: string, category: string) => void
  onDateChange: (id: string, date: string) => void
  onOverrideModeChange: (id: string, overrideMode: boolean) => void
}) => {

  // Parse amount string to number for sorting
  const parseAmount = (amountStr: string): number => {
    if (!amountStr || !amountStr.trim()) return 0
    // Remove currency symbols, spaces, and commas, then parse
    const cleaned = amountStr.replace(/[^\d.-]/g, '').replace(',', '.')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  // Filter transactions based on the "only show others" filter
  const filteredTransactions = useMemo(() => {
    let filtered = onlyShowOthers
      ? transactions.filter(t => t.category === 'others')
      : transactions

    // Sort by amount if sort direction is set
    if (amountSortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const amountA = parseAmount(a.amount)
        const amountB = parseAmount(b.amount)
        if (amountSortDirection === 'asc') {
          return amountA - amountB
        } else {
          return amountB - amountA
        }
      })
    }

    return filtered
  }, [transactions, onlyShowOthers, amountSortDirection])

  const handleSortByAmount = () => {
    if (amountSortDirection === null) {
      onAmountSortDirectionChange('asc')
    } else if (amountSortDirection === 'asc') {
      onAmountSortDirectionChange('desc')
    } else {
      onAmountSortDirectionChange(null)
    }
  }

  return (
    <div className="section">
      <h2 className="section-header">Transactions Table</h2>

      <div className="filter-controls">
        <label className="filter-label">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={onlyShowOthers}
            onChange={e => { onOnlyShowOthersChange(e.target.checked) }}
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
              <th>Hash</th>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th 
                className="sortable-header"
                onClick={handleSortByAmount}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Amount
                {amountSortDirection === 'asc' && ' ↑'}
                {amountSortDirection === 'desc' && ' ↓'}
              </th>
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
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={t.overrideMode}
                    onChange={e => { onOverrideModeChange(t.id, e.target.checked) }}
                  />
                </td>
                <td>
                  <code style={{ 
                    fontSize: '0.75rem', 
                    fontFamily: 'monospace',
                    color: '#666',
                    backgroundColor: '#f5f5f5',
                    padding: '2px 4px',
                    borderRadius: '2px'
                  }}>
                    {t.hash || 'N/A'}
                  </code>
                </td>
                <td>
                  {t.overrideMode ? (
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '120px' }}
                      value={t.date}
                      onChange={e => { onDateChange(t.id, e.target.value) }}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { TransactionsTable }
