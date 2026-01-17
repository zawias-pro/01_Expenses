import { useMemo, useState } from 'react'
import type { Transaction } from '../../parsing/types.ts'
import { getYearFromDate } from '../../parsing/getYearFromDate/getYearFromDate.ts'
import { getMonthFromDate } from '../../parsing/getMonthFromDate/getMonthFromDate.ts'
import { parsePolishAmount } from '../../parsing/parsePolishAmount/parsePolishAmount.ts'
import { useCategoryMetadata, getCategoryNameFromId, getCategoryIdFromName, getOrCreateCategoryId } from '../../store/useStore.ts'

type BulkAction = 'delete' | 'exclude' | 'unexclude' | 'setCategory' | null

const TransactionsTable = ({
   transactions,
   categories,
  onExcludedChange,
  onCategoryChange,
  onDateChange,
  onCommentChange,
  onResetTransactionDate,
  onResetTransactionCategory,
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
   onUpdateCategory,
}: {
  transactions: Transaction[]
  categories: string[] // category names
  onExcludedChange: (id: string, excluded: boolean) => void
  onCategoryChange: (id: string, categoryId: string) => void
  onDateChange: (id: string, date: string) => void
  onCommentChange: (id: string, comment: string) => void
  onResetTransactionDate: (id: string) => void
  onResetTransactionCategory: (id: string) => void
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
  sortColumn: 'date' | 'description' | 'category' | 'amount' | 'addedAt' | null
  sortDirection: 'asc' | 'desc' | null
  onSortChange: (column: 'date' | 'description' | 'category' | 'amount' | 'addedAt' | null, direction: 'asc' | 'desc' | null) => void
  onUpdateCategory: (category: string, keywords: string[]) => void
}) => {
  const [amountFilterInput, setAmountFilterInput] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<BulkAction>(null)
  const [bulkCategory, setBulkCategory] = useState<string>('')
  const [quickAddTransactionId, setQuickAddTransactionId] = useState<string | null>(null)
  const [editTransactionId, setEditTransactionId] = useState<string | null>(null)
  const [editDate, setEditDate] = useState<string>('')
  const [editCategory, setEditCategory] = useState<string>('')
  const [editComment, setEditComment] = useState<string>('')
  const [editExcluded, setEditExcluded] = useState<boolean>(false)
  const [quickAddSelectedCategory, setQuickAddSelectedCategory] = useState<string>('new')
  const [quickAddCustomCategory, setQuickAddCustomCategory] = useState<string>('')
  const [quickAddKeyword, setQuickAddKeyword] = useState<string>('')
  
  const categoryMetadata = useCategoryMetadata()
  const othersCategoryId = generateCategoryId('others')

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
        const key = `${String(year)}-${String(month).padStart(2, '0')}`
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        if (!monthMap.has(key)) {
          monthMap.set(key, `${monthNames[month - 1] ?? ''} ${String(year)}`)
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
      filtered = filtered.filter(t => {
        const categoryName = getCategoryNameFromId(t.category, categoryMetadata)
        return (
          t.description.toLowerCase().includes(query) ||
          categoryName.toLowerCase().includes(query) ||
          t.date.includes(query) ||
          t.amount.includes(query) ||
          t.hash.toLowerCase().includes(query)
        )
      })
    }

    // Category filter (selectedCategory is a category ID)
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
        }
        // amountFilterType === 'greater' is guaranteed here
        return amount > amountFilterValue
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
          const aName = getCategoryNameFromId(a.category, categoryMetadata)
          const bName = getCategoryNameFromId(b.category, categoryMetadata)
          comparison = aName.localeCompare(bName)
        } else if (sortColumn === 'amount') {
          comparison = parseAmount(a.amount) - parseAmount(b.amount)
        } else {
          // sortColumn === 'addedAt'
          const aTime = a.addedAt ?? ''
          const bTime = b.addedAt ?? ''
          comparison = aTime.localeCompare(bTime)
        }
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [transactions, searchQuery, selectedCategory, selectedMonthFilter, amountFilterType, amountFilterValue, sortColumn, sortDirection, categoryMetadata])

  const handleSort = (column: 'date' | 'description' | 'category' | 'amount' | 'addedAt') => {
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

  // Select all visible transactions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredAndSortedTransactions.map(t => t.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  // Toggle individual selection
  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  // Check if all visible are selected
  const allSelected = filteredAndSortedTransactions.length > 0 && 
    filteredAndSortedTransactions.every(t => selectedIds.has(t.id))
  const someSelected = filteredAndSortedTransactions.some(t => selectedIds.has(t.id))

  // Apply bulk actions
  const handleApplyBulkAction = () => {
    if (selectedIds.size === 0) return

    if (bulkAction === 'delete') {
      const count = selectedIds.size
      if (window.confirm(`Are you sure you want to remove ${String(count)} transaction(s)?`)) {
        selectedIds.forEach(id => { onRemoveTransaction(id) })
        setSelectedIds(new Set())
        setBulkAction(null)
      }
    } else if (bulkAction === 'exclude') {
      selectedIds.forEach(id => { onExcludedChange(id, true) })
      setSelectedIds(new Set())
      setBulkAction(null)
    } else if (bulkAction === 'unexclude') {
      selectedIds.forEach(id => { onExcludedChange(id, false) })
      setSelectedIds(new Set())
      setBulkAction(null)
    } else if (bulkAction === 'setCategory' && bulkCategory) {
      // bulkCategory is a category name, convert to ID
      const categoryId = getCategoryIdFromName(bulkCategory, categoryMetadata)
      if (categoryId) {
        selectedIds.forEach(id => { onCategoryChange(id, categoryId) })
        setSelectedIds(new Set())
        setBulkAction(null)
        setBulkCategory('')
      }
    }
  }

  const handleQuickAddCategory = (transactionId: string, description: string) => {
    setQuickAddTransactionId(transactionId)
    setQuickAddSelectedCategory('new')
    setQuickAddCustomCategory('')
    // Pre-fill keyword with the full transaction description
    setQuickAddKeyword(description)
  }

  const handleSaveQuickAdd = () => {
    if (!quickAddTransactionId) return
    
    const transaction = transactions.find(t => t.id === quickAddTransactionId)
    if (!transaction) return

    let categoryName = ''
    if (quickAddSelectedCategory === 'new') {
      if (!quickAddCustomCategory.trim()) {
        alert('Please enter a category name')
        return
      }
      categoryName = quickAddCustomCategory.trim()
    } else {
      categoryName = quickAddSelectedCategory
    }

    if (!quickAddKeyword.trim()) {
      alert('Please enter at least one keyword')
      return
    }

    const keywords = quickAddKeyword.split(',').map(k => k.trim()).filter(k => k)
    onUpdateCategory(categoryName, keywords)
    
    // Update the transaction's category (convert name to ID)
    // Use getOrCreateCategoryId since we just created the category
    const categoryId = getOrCreateCategoryId(categoryName, categoryMetadata)
    onCategoryChange(quickAddTransactionId, categoryId)
    
    // Close the modal
    setQuickAddTransactionId(null)
    setQuickAddSelectedCategory('new')
    setQuickAddCustomCategory('')
    setQuickAddKeyword('')
  }

  const handleCancelQuickAdd = () => {
    setQuickAddTransactionId(null)
    setQuickAddSelectedCategory('new')
    setQuickAddCustomCategory('')
    setQuickAddKeyword('')
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
            onChange={e => { onSearchQueryChange(e.target.value) }}
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
            onChange={e => {
              const categoryName = e.target.value
              const categoryId = categoryName ? getCategoryIdFromName(categoryName, categoryMetadata) : null
              onSelectedCategoryChange(categoryId)
            }}
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
            onChange={e => { onSelectedMonthFilterChange(e.target.value || null) }}
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
                  onChange={e => { setAmountFilterInput(e.target.value) }}
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

      <div style={{ 
        marginBottom: '0.5rem', 
        fontSize: '0.875rem', 
        color: '#666',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <span>Showing {String(filteredAndSortedTransactions.length)} of {String(transactions.length)} transactions</span>
        {someSelected && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '500' }}>{selectedIds.size} selected</span>
            <select
              className="form-select"
              value={bulkAction || ''}
              onChange={e => {
                const action = e.target.value as BulkAction
                setBulkAction(action)
                if (action !== 'setCategory') {
                  setBulkCategory('')
                }
              }}
              style={{ fontSize: '0.875rem', padding: '0.375rem' }}
            >
              <option value="">Choose action...</option>
              <option value="exclude">Exclude</option>
              <option value="unexclude">Include</option>
              <option value="setCategory">Set Category</option>
              <option value="delete">Delete</option>
            </select>
            {bulkAction === 'setCategory' && (
              <select
                className="form-select"
                value={bulkCategory}
                onChange={e => { setBulkCategory(e.target.value) }}
                style={{ fontSize: '0.875rem', padding: '0.375rem', minWidth: '150px' }}
              >
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
            {bulkAction && (
              <button
                className="btn btn-primary"
                onClick={handleApplyBulkAction}
                disabled={bulkAction === 'setCategory' && !bulkCategory}
                style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
              >
                Apply
              </button>
            )}
            <button
              className="btn btn-outline"
              onClick={() => {
                setSelectedIds(new Set())
                setBulkAction(null)
                setBulkCategory('')
              }}
              style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Compact Table */}
      <div className="table-container" style={{ maxHeight: '70vh', overflow: 'auto' }}>
        <table className="table" style={{ fontSize: '0.8125rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.375rem', fontSize: '0.8125rem', width: '30px' }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected && !allSelected
                  }}
                  onChange={e => { handleSelectAll(e.target.checked) }}
                  style={{ width: '14px', height: '14px' }}
                  title="Select all"
                />
              </th>
              <th 
                style={{ padding: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => { handleSort('date') }}
              >
                Date{getSortIndicator('date')}
              </th>
              <th 
                style={{ padding: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => { handleSort('description') }}
              >
                Description{getSortIndicator('description')}
              </th>
              <th 
                style={{ padding: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => { handleSort('category') }}
              >
                Category{getSortIndicator('category')}
              </th>
              <th 
                style={{ padding: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => { handleSort('amount') }}
              >
                Amount{getSortIndicator('amount')}
              </th>
              <th 
                style={{ padding: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => { handleSort('addedAt') }}
              >
                Added At{getSortIndicator('addedAt')}
              </th>
              <th style={{ padding: '0.375rem', fontSize: '0.8125rem' }}>Hash</th>
              <th style={{ padding: '0.375rem', fontSize: '0.8125rem', width: '40px' }}>Comment</th>
              <th style={{ padding: '0.375rem', fontSize: '0.8125rem', width: '80px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTransactions.map(t => (
              <tr key={t.id}>
                <td style={{ padding: '0.375rem' }}>
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={selectedIds.has(t.id)}
                    onChange={() => { handleToggleSelect(t.id) }}
                    style={{ width: '14px', height: '14px' }}
                  />
                </td>
                <td style={{ 
                  padding: '0.375rem', 
                  textDecoration: t.excluded ? 'line-through' : 'none',
                  color: t.excluded ? '#999' : 'inherit',
                  opacity: t.excluded ? 0.6 : 1
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>{t.date}</span>
                    {t.dateOverridden && (
                      <button
                        onClick={() => { onResetTransactionDate(t.id) }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.125rem',
                          fontSize: '0.75rem',
                          color: '#ff9800',
                          opacity: 1
                        }}
                        title="Reset date to original"
                      >
                        🔄
                      </button>
                    )}
                  </div>
                </td>
                <td style={{ 
                  padding: '0.375rem', 
                  textDecoration: t.excluded ? 'line-through' : 'none',
                  color: t.excluded ? '#999' : 'inherit',
                  opacity: t.excluded ? 0.6 : 1
                }}>{t.description}</td>
                <td style={{ 
                  padding: '0.375rem', 
                  textDecoration: t.excluded ? 'line-through' : 'none',
                  color: t.excluded ? '#999' : 'inherit',
                  opacity: t.excluded ? 0.6 : 1
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{getCategoryNameFromId(t.category, categoryMetadata)}</span>
                    {t.category === othersCategoryId && !t.categoryOverridden && (
                      <button
                        onClick={() => { handleQuickAddCategory(t.id, t.description) }}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.375rem',
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                        title="Quick add category"
                      >
                        + Add
                      </button>
                    )}
                    {t.categoryOverridden && (
                      <button
                        onClick={() => { onResetTransactionCategory(t.id) }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.125rem',
                          fontSize: '0.75rem',
                          color: '#ff9800',
                          opacity: 1
                        }}
                        title="Reset category to auto-classified"
                      >
                        🔄
                      </button>
                    )}
                  </div>
                </td>
                <td style={{ 
                  padding: '0.375rem', 
                  textDecoration: t.excluded ? 'line-through' : 'none',
                  color: t.excluded ? '#999' : 'inherit',
                  opacity: t.excluded ? 0.6 : 1
                }}>{t.amount}</td>
                <td style={{ 
                  padding: '0.375rem', 
                  textDecoration: t.excluded ? 'line-through' : 'none',
                  color: t.excluded ? '#999' : 'inherit',
                  opacity: t.excluded ? 0.6 : 1
                }}>
                  {t.addedAt !== undefined ? new Date(t.addedAt).toLocaleString() : 'N/A'}
                </td>
                <td style={{ 
                  padding: '0.375rem', 
                  textDecoration: t.excluded ? 'line-through' : 'none',
                  color: t.excluded ? '#999' : 'inherit',
                  opacity: t.excluded ? 0.6 : 1
                }}>
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
                <td style={{ padding: '0.375rem', textAlign: 'center', opacity: 1 }}>
                  {t.comment && (
                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: '#007bff'
                      }}
                      title={t.comment}
                    >
                      💭
                    </span>
                  )}
                </td>
                <td style={{ padding: '0.375rem', textAlign: 'center', opacity: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        setEditTransactionId(t.id)
                        setEditDate(t.date)
                        setEditCategory(t.category) // Store category ID
                        setEditComment(t.comment || '')
                        setEditExcluded(t.excluded)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        fontSize: '0.875rem',
                        color: '#007bff'
                      }}
                      title="Edit transaction"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => { handleRemoveClick(t.id, t.description) }}
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Transaction Modal */}
      {editTransactionId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            minWidth: '400px',
            maxWidth: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem' }}>
              Edit Transaction
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  Date:
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editDate}
                  onChange={e => { setEditDate(e.target.value) }}
                  placeholder="YYYY-MM-DD"
                  style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  Category:
                </label>
                <select
                  className="form-select"
                  value={getCategoryNameFromId(editCategory || othersCategoryId, categoryMetadata)}
                  onChange={e => {
                    const categoryName = e.target.value
                    const categoryId = getCategoryIdFromName(categoryName, categoryMetadata)
                    setEditCategory(categoryId)
                  }}
                  style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem' }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  Comment:
                </label>
                <textarea
                  className="form-input"
                  value={editComment}
                  onChange={e => { setEditComment(e.target.value) }}
                  placeholder="Enter a comment for this transaction..."
                  rows={4}
                  style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={editExcluded}
                    onChange={e => { setEditExcluded(e.target.checked) }}
                    style={{ width: '16px', height: '16px' }}
                  />
                  Exclude from calculations
                </label>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setEditTransactionId(null)
                    setEditDate('')
                    setEditCategory('')
                    setEditComment('')
                    setEditExcluded(false)
                  }}
                  style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (editTransactionId) {
                      onDateChange(editTransactionId, editDate)
                      onCategoryChange(editTransactionId, editCategory || othersCategoryId)
                      onCommentChange(editTransactionId, editComment)
                      onExcludedChange(editTransactionId, editExcluded)
                    }
                    setEditTransactionId(null)
                    setEditDate('')
                    setEditCategory('')
                    setEditComment('')
                    setEditExcluded(false)
                  }}
                  style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Category Modal */}
      {quickAddTransactionId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            minWidth: '400px',
            maxWidth: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem' }}>
              Quick Add Category
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  Category:
                </label>
                <select
                  className="form-select"
                  value={quickAddSelectedCategory}
                  onChange={e => { setQuickAddSelectedCategory(e.target.value) }}
                  style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem' }}
                >
                  <option value="new">New category</option>
                  {categories.filter(cat => cat !== 'others').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              {quickAddSelectedCategory === 'new' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>
                    Custom Category Name:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={quickAddCustomCategory}
                    onChange={e => { setQuickAddCustomCategory(e.target.value) }}
                    placeholder="Enter category name"
                    style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem' }}
                  />
                </div>
              )}
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  Keyword (comma-separated):
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={quickAddKeyword}
                  onChange={e => { setQuickAddKeyword(e.target.value) }}
                  placeholder="Enter keywords"
                  style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  className="btn btn-outline"
                  onClick={handleCancelQuickAdd}
                  style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveQuickAdd}
                  disabled={!quickAddKeyword.trim() || (quickAddSelectedCategory === 'new' && !quickAddCustomCategory.trim())}
                  style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { TransactionsTable }
