import { useState } from 'react'
import { useStore, useCategories, useCategoryMetadata, getCategoryIdFromName } from '../../../store/useStore.ts'
import { Input } from '../../../components/Input/Input.tsx'
import { Select } from '../../../components/Select/Select.tsx'
import { Button } from '../../../components/Button/Button.tsx'
import styles from './TransactionsFilters.module.css'

interface TransactionsFiltersProps {
  availableMonths: Array<[string, string]>
}

const TransactionsFilters = ({ availableMonths }: TransactionsFiltersProps) => {
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
    <div className={styles.filters}>
      {/* Search */}
      <Input
        label="Search:"
        type="text"
        value={searchQuery}
        onChange={e => { setSearchQuery(e.target.value) }}
        placeholder="Search transactions..."
        style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem', marginBottom: 0 }}
      />

      {/* Category Filter */}
      <Select
        label="Category:"
        value={selectedCategory || ''}
        onChange={e => {
          const categoryName = e.target.value
          const categoryId = categoryName ? getCategoryIdFromName(categoryName, categoryMetadata) : null
          setSelectedCategory(categoryId)
        }}
        style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem', marginBottom: 0 }}
      >
        <option value="">All categories</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </Select>

      {/* Month Filter */}
      <Select
        label="Month:"
        value={selectedMonthFilter || ''}
        onChange={e => { setSelectedMonthFilter(e.target.value || null) }}
        style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem', marginBottom: 0 }}
      >
        <option value="">All months</option>
        {availableMonths.map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </Select>

      {/* Amount Filter */}
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
          Amount:
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Select
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
            style={{ fontSize: '0.875rem', padding: '0.375rem', minWidth: '110px', marginBottom: 0 }}
          >
            <option value="none">None</option>
            <option value="less">&lt; Less than</option>
            <option value="greater">&gt; Greater than</option>
          </Select>
          {amountFilterType && amountFilterType !== 'none' && (
            <>
              <Input
                type="number"
                value={amountFilterInput}
                onChange={e => { setAmountFilterInput(e.target.value) }}
                placeholder="Amount"
                style={{ fontSize: '0.875rem', padding: '0.375rem', width: '120px', marginBottom: 0 }}
              />
              <Button
                onClick={handleAmountFilterApply}
                style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
              >
                Apply
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export { TransactionsFilters }
