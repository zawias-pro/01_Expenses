import { useState } from 'react'
import { useStore, useCategories, useCategoryMetadata, getCategoryIdFromName } from '../../../store/useStore.ts'

interface TransactionsFiltersProps {
  availableMonths: Array<[string, string]>
}

export const TransactionsFilters = ({ availableMonths }: TransactionsFiltersProps) => {
  const [amountFilterInput, setAmountFilterInput] = useState<string>('')

  // Store state
  const searchQuery = useStore((state) => state.searchQuery)
  const selectedCategory = useStore((state) => state.selectedCategory)
  const selectedMonthFilter = useStore((state) => state.selectedMonthFilter)
  const amountFilterType = useStore((state) => state.amountFilterType)
  const amountFilterValue = useStore((state) => state.amountFilterValue)
  const categoryMetadata = useCategoryMetadata()
  const categories = useCategories()

  // Store actions
  const setSearchQuery = useStore((state) => state.setSearchQuery)
  const setSelectedCategory = useStore((state) => state.setSelectedCategory)
  const setSelectedMonthFilter = useStore((state) => state.setSelectedMonthFilter)
  const setAmountFilter = useStore((state) => state.setAmountFilter)

  const handleAmountFilterApply = () => {
    const value = parseFloat(amountFilterInput)
    if (!isNaN(value)) {
      setAmountFilter(amountFilterType || 'less', value)
    }
  }

  return (
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
          onChange={e => { setSearchQuery(e.target.value) }}
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
            setSelectedCategory(categoryId)
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
          onChange={e => { setSelectedMonthFilter(e.target.value || null) }}
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
                setAmountFilter(null, null)
                setAmountFilterInput('')
              } else {
                setAmountFilter(type, amountFilterValue)
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
  )
}
