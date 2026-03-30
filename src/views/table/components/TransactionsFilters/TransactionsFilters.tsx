import { useState } from 'react'
import { NO_CATEGORY_KEY, NO_CATEGORY_FILTER_VALUE } from '../../../../parsing/types.ts'
import { useCategories, useCategoryMetadata, getCategoryIdFromName, getCategoryNameFromId, useStore } from '../../../../store/useStore.ts'
import { getYearFromDate } from '../../../../parsing/getYearFromDate/getYearFromDate.ts'
import { getMonthFromDate } from '../../../../parsing/getMonthFromDate/getMonthFromDate.ts'
import { Input } from '../../../../components/Input/Input.tsx'
import { Select } from '../../../../components/Select/Select.tsx'
import { Button } from '../../../../components/Button/Button.tsx'
import { FormGroup } from '../../../../components/FormGroup/FormGroup.tsx'
import { Panel } from '../../../../components/Panel/Panel.tsx'
import { useTransactionFilters } from '../../../../store/useTransactionFilters.ts'
import { Checkbox } from "../../../../components/Checkbox/Checkbox.tsx"

const TransactionsFilters = () => {
  const [amountFilterInput, setAmountFilterInput] = useState('')
  const categoryMetadata = useCategoryMetadata()
  const categories = useCategories()
  const transactions = useStore((s) => s.transactions)
  const {
    searchQuery,
    selectedCategory,
    selectedMonthFilter,
    amountFilterType,
    hasDuplicates,
    setSearchQuery,
    setSelectedCategory,
    setSelectedMonthFilter,
    setAmountFilterType,
    setAmountFilterValue,
    setHasDuplicates,
  } = useTransactionFilters()

  // Compute available months from transactions (same logic as TransactionsTable)
  const availableMonths: Array<[string, string]> = (() => {
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
  })()

  const handleAmountFilterApply = () => {
    const value = parseFloat(amountFilterInput)
    if (!isNaN(value)) {
      setAmountFilterType(amountFilterType || 'less')
      setAmountFilterValue(value)
    }
  }

  return (
    <Panel>
      <FormGroup>
        <Input
          id={'search'}
          label="Search"
          type="text"
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value) }}
        />

        <Select
          id={'category'}
          label="Category"
          value={
            selectedCategory === NO_CATEGORY_FILTER_VALUE
              ? NO_CATEGORY_KEY
              : selectedCategory
              ? getCategoryNameFromId(selectedCategory, categoryMetadata) || ''
              : ''
          }
          onChange={e => {
            const value = e.target.value
            if (value === '') {
              setSelectedCategory(null)
            } else if (value === NO_CATEGORY_FILTER_VALUE) {
              setSelectedCategory(NO_CATEGORY_FILTER_VALUE)
            } else {
              setSelectedCategory(getCategoryIdFromName(value, categoryMetadata))
            }
          }}
        >
          <option value="">All categories</option>
          <option value={NO_CATEGORY_FILTER_VALUE}>{NO_CATEGORY_KEY}</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>

        <Select
          label="Month"
          id="month-filter"
          value={selectedMonthFilter || ''}
          onChange={e => { setSelectedMonthFilter(e.target.value || null) }}
        >
          <option value="">All months</option>
          {availableMonths.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>

        <div>
          <Select
            label={'Amount'}
            id="amount-filter-type"
              value={amountFilterType || 'none'}
                onChange={e => {
                  const type = e.target.value as 'none' | 'less' | 'greater'
                  if (type === 'none') {
                    setAmountFilterType(null)
                    setAmountFilterValue(null)
                    setAmountFilterInput('')
                  } else {
                    setAmountFilterType(type)
                  }
                }}
          >
            <option value="none">None</option>
            <option value="less">&lt; Less than</option>
            <option value="greater">&gt; Greater than</option>
          </Select>

          {amountFilterType && amountFilterType !== 'none' && (
            <div>
              <Input
                label={'Value'}
                id={'amount'}
                type="number"
                value={amountFilterInput}
                onChange={event => { setAmountFilterInput(event.target.value) }}
                placeholder="100,00"
              />
              <Button onClick={handleAmountFilterApply} variant={'primary'}>
                Apply
              </Button>
            </div>
          )}
        </div>
        <div>
          <Checkbox
            label={'Has duplicates'}
            onChange={e => { setHasDuplicates(e.target.checked) }}
            checked={hasDuplicates}
          />
        </div>
      </FormGroup>
    </Panel>
  )
}

export { TransactionsFilters }
