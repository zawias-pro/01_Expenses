import { useMemo, useState } from 'react'
import type { Transaction } from '../../parsing/types.ts'
import { getYearFromDate } from '../../parsing/getYearFromDate/getYearFromDate.ts'
import { getMonthFromDate } from '../../parsing/getMonthFromDate/getMonthFromDate.ts'
import { parsePolishAmount } from '../../parsing/parsePolishAmount/parsePolishAmount.ts'

const TransactionsTable = ({
   transactions,
   categories,
   onExcludedChange,
   onCategoryChange,
   onDateChange,
   onOverrideModeChange,
   onRemoveTransaction,
   searchQuery,
   onSearchQueryChange,
   selectedCategory,
   onSelectedCategoryChange,
   selectedMonthFilter,
   onSelectedMonthFilterChange,
   amountFilterType,
   amountFilterValue,
   onAmountFilterChange,
   sortColumn,
   sortDirection,
   onSortChange,
}: {
  transactions: Transaction[]
  categories: string[]
  onExcludedChange: (id: string, excluded: boolean) => void
  onCategoryChange: (id: string, category: string) => void
  onDateChange: (id: string, date: string) => void
  onOverrideModeChange: (id: string, overrideMode: boolean) => void
  onRemoveTransaction: (id: string) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  selectedCategory: string | null
  onSelectedCategoryChange: (category: string | null) => void
  selectedMonthFilter: string | null
  onSelectedMonthFilterChange: (month: string | null) => void
  amountFilterType: 'none' | 'less' | 'greater' | null
  amountFilterValue: number | null
  onAmountFilterChange: (type: 'none' | 'less' | 'greater' | null, value: number | null) => void
  sortColumn: 'date' | 'description' | 'category' | 'amount' | null
  sortDirection: 'asc' | 'desc' | null
  onSortChange: (column: 'date' | 'description' | 'category' | 'amount' | null, direction: 'asc' | 'desc' | null) => void
}) => {
  const [amountFilterInput, setAmountFilterInput] = useState<string>('')

  // Parse amount string to number
  const parseAmount = (amountStr: string): number => {
    if (!amountStr || !amountStr.trim()) return 0
    try {
      return parsePolishAmount(amountStr)
    } catch {
      return 0
    }
  }

  // Get unique months from transactions
  const availableMonths = useMemo(() => {
    const monthMap = new Map<string, string>()
    transactions.forEach(t => {
      try {
        const year = getYearFromDate(t.date)
        const month = getMonthFromDate(t.date)
        const key = `${year}-${month.toString().padStart(2, '0')}`
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        if (!monthMap.has(key)) {
          monthMap.set(key, `${monthNames[month - 1]} ${year}`)
        }
      } catch {
        // Skip invalid dates
      }
    })
    return Array.from(monthMap.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [transactions])

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.date.includes(query) ||
        t.amount.includes(query) ||
        (t.hash && t.hash.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    // Month filter
    if (selectedMonthFilter) {
      const [year, month] = selectedMonthFilter.split('-').map(Number)
      filtered = filtered.filter(t => {
        try {
          const tYear = getYearFromDate(t.date)
          const tMonth = getMonthFromDate(t.date)
          return tYear === year && tMonth === month
        } catch {
          return false
        }
      })
    }

    // Amount filter
    if (amountFilterType && amountFilterType !== 'none' && amountFilterValue !== null) {
      filtered = filtered.filter(t => {
        const amount = parseAmount(t.amount)
        if (amountFilterType === 'less') {
          return amount < amountFilterValue
        } else if (amountFilterType === 'greater') {
          return amount > amountFilterValue
        }
        return true
      })
    }

    // Sort
    if (sortColumn && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0
        if (sortColumn === 'date') {
          comparison = a.date.localeCompare(b.date)
        } else if (sortColumn === 'description') {
          comparison = a.description.localeCompare(b.description)
        } else if (sortColumn === 'category') {
          comparison = a.category.localeCompare(b.category)
        } else if (sortColumn === 'amount') {
          comparison = parseAmount(a.amount) - parseAmount(b.amount)
        }
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [transactions, searchQuery, selectedCategory, selectedMonthFilter, amountFilterType, amountFilterValue, sortColumn, sortDirection])

  const handleSort = (column: 'date' | 'description' | 'category' | 'amount') => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        onSortChange(column, 'desc')
      } else if (sortDirection === 'desc') {
        onSortChange(null, null)
      } else {
        onSortChange(column, 'asc')
      }
    } else {
      onSortChange(column, 'asc')
    }
  }

  const handleAmountFilterApply = () => {
    const value = parseFloat(amountFilterInput)
    if (!isNaN(value)) {
      onAmountFilterChange(amountFilterType || 'less', value)
    }
  }

  const handleRemoveClick = (id: string, description: string) => {
    if (window.confirm(`Are you sure you want to remove this transaction?\n\n${description}`)) {
      onRemoveTransaction(id)
    }
  }

  const getSortIndicator = (column: 'date' | 'description' | 'category' | 'amount') => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? ' ↑' : ' ↓'
    }
    return ''
  }

  return (
    <div className="section">
      <h2 className="section-header">Transactions Table</h2>

      {/* Filters */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '0.75rem',
        marginBottom: '1rem',
        fontSize: '0.875rem'
      }}>
        {/* Search */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
            Search:
          </label>
          <input
            type="text"
            className="form-input"
            value={searchQuery}
            onChange={e => onSearchQueryChange(e.target.value)}
            placeholder="Search transactions..."
            style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem' }}
          />
        </div>

        {/* Category Filter */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
            Category:
          </label>
          <select
            className="form-select"
            value={selectedCategory || ''}
            onChange={e => onSelectedCategoryChange(e.target.value || null)}
            style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem' }}
          >
            <option value="">All categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
            Month:
          </label>
          <select
            className="form-select"
            value={selectedMonthFilter || ''}
            onChange={e => onSelectedMonthFilterChange(e.target.value || null)}
            style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem' }}
          >
            <option value="">All months</option>
            {availableMonths.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Amount Filter */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
            Amount:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              value={amountFilterType || 'none'}
              onChange={e => {
                const type = e.target.value as 'none' | 'less' | 'greater'
                if (type === 'none') {
                  onAmountFilterChange(null, null)
                  setAmountFilterInput('')
                } else {
                  onAmountFilterChange(type, amountFilterValue)
                }
              }}
              style={{ fontSize: '0.875rem', padding: '0.375rem', minWidth: '110px' }}
            >
              <option value="none">None</option>
              <option value="less">&lt; Less than</option>
              <option value="greater">&gt; Greater than</option>
            </select>
            {amountFilterType && amountFilterType !== 'none' && (
              <>
                <input
                  type="number"
                  className="form-input"
                  value={amountFilterInput}
                  onChange={e => setAmountFilterInput(e.target.value)}
                  placeholder="Amount"
                  style={{ fontSize: '0.875rem', padding: '0.375rem', width: '120px' }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleAmountFilterApply}
                  style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                >
                  Apply
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
        Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
      </div>

      {/* Compact Table */}
      <div className="table-container" style={{ maxHeight: '70vh', overflow: 'auto' }}>
        <table className="table" style={{ fontSize: '0.8125rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.375rem', fontSize: '0.8125rem' }}>Exclude</th>
              <th style={{ padding: '0.375rem', fontSize: '0.8125rem' }}>Override</th>
              <th 
                style={{ padding: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('date')}
              >
                Date{getSortIndicator('date')}
              </th>
              <th 
                style={{ padding: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('description')}
              >
                Description{getSortIndicator('description')}
              </th>
              <th 
                style={{ padding: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('category')}
              >
                Category{getSortIndicator('category')}
              </th>
              <th 
                style={{ padding: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('amount')}
              >
                Amount{getSortIndicator('amount')}
              </th>
              <th style={{ padding: '0.375rem', fontSize: '0.8125rem' }}>Hash</th>
              <th style={{ padding: '0.375rem', fontSize: '0.8125rem', width: '40px' }}>Remove</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTransactions.map(t => (
              <tr key={t.id}>
                <td style={{ padding: '0.375rem' }}>
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={t.excluded}
                    onChange={e => { onExcludedChange(t.id, e.target.checked) }}
                    style={{ width: '14px', height: '14px' }}
                  />
                </td>
                <td style={{ padding: '0.375rem' }}>
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={t.overrideMode}
                    onChange={e => { onOverrideModeChange(t.id, e.target.checked) }}
                    style={{ width: '14px', height: '14px' }}
                  />
                </td>
                <td style={{ padding: '0.375rem' }}>
                  {t.overrideMode ? (
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '100px', fontSize: '0.8125rem', padding: '0.25rem' }}
                      value={t.date}
                      onChange={e => { onDateChange(t.id, e.target.value) }}
                    />
                  ) : (
                    <span>{t.date}</span>
                  )}
                </td>
                <td style={{ padding: '0.375rem' }}>{t.description}</td>
                <td style={{ padding: '0.375rem' }}>
                  {t.overrideMode ? (
                    <select
                      className="form-select"
                      style={{ minWidth: '120px', fontSize: '0.8125rem', padding: '0.25rem' }}
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
                <td style={{ padding: '0.375rem' }}>{t.amount}</td>
                <td style={{ padding: '0.375rem' }}>
                  <code style={{ 
                    fontSize: '0.6875rem', 
                    fontFamily: 'monospace',
                    color: '#666',
                    backgroundColor: '#f5f5f5',
                    padding: '1px 3px',
                    borderRadius: '2px'
                  }}>
                    {t.hash || 'N/A'}
                  </code>
                </td>
                <td style={{ padding: '0.375rem', textAlign: 'center' }}>
                  <button
                    onClick={() => handleRemoveClick(t.id, t.description)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      fontSize: '0.875rem',
                      color: '#dc3545'
                    }}
                    title="Remove transaction"
                  >
                    🗑️
                  </button>
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
