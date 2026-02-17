import { useState } from 'react'
import { NO_CATEGORY_KEY, NO_CATEGORY_FILTER_VALUE } from '../../../parsing/types.ts'
import { useCategories, useCategoryMetadata, getCategoryIdFromName, getCategoryNameFromId } from '../../../store/useStore.ts'
import { Input } from '../../../components/Input/Input.tsx'
import { Select } from '../../../components/Select/Select.tsx'
import { Button } from '../../../components/Button/Button.tsx'
import { FormGroup } from "../../../components/FormGroup/FormGroup.tsx"
import { Panel } from "../../../components/Panel/Panel.tsx"

interface TransactionsFiltersProps {
  availableMonths: Array<[string, string]>
  searchQuery: string
  selectedCategory: string | null
  selectedMonthFilter: string | null
  amountFilterType: 'none' | 'less' | 'greater' | null
  amountFilterValue: number | null
  onSearchQueryChange: (value: string) => void
  onSelectedCategoryChange: (categoryId: string | null) => void
  onSelectedMonthFilterChange: (value: string | null) => void
  onAmountFilterChange: (type: 'none' | 'less' | 'greater' | null, value: number | null) => void
}

const TransactionsFilters = ({
  availableMonths,
  searchQuery,
  selectedCategory,
  selectedMonthFilter,
  amountFilterType,
  amountFilterValue,
  onSearchQueryChange,
  onSelectedCategoryChange,
  onSelectedMonthFilterChange,
  onAmountFilterChange,
}: TransactionsFiltersProps) => {
  const [amountFilterInput, setAmountFilterInput] = useState<string>('')
  const categoryMetadata = useCategoryMetadata()
  const categories = useCategories()

  const handleAmountFilterApply = () => {
    const value = parseFloat(amountFilterInput)
    if (!isNaN(value)) {
      onAmountFilterChange(amountFilterType || 'less', value)
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
          onChange={e => { onSearchQueryChange(e.target.value) }}
        />

        <Select
          id={'category'}
          label="Category"
          value={selectedCategory === NO_CATEGORY_FILTER_VALUE ? NO_CATEGORY_KEY : (selectedCategory ? getCategoryNameFromId(selectedCategory, categoryMetadata) ?? '' : '')}
          onChange={e => {
            const value = e.target.value
            if (value === '') {
              onSelectedCategoryChange(null)
            } else if (value === NO_CATEGORY_FILTER_VALUE) {
              onSelectedCategoryChange(NO_CATEGORY_FILTER_VALUE)
            } else {
              onSelectedCategoryChange(getCategoryIdFromName(value, categoryMetadata))
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
          onChange={e => { onSelectedMonthFilterChange(e.target.value || null) }}
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
                onAmountFilterChange(null, null)
                setAmountFilterInput('')
              } else {
                onAmountFilterChange(type, amountFilterValue)
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
      </FormGroup>
    </Panel>
  )
}

export { TransactionsFilters }
