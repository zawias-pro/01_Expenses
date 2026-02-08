import { useState } from 'react'
import { useStore, useCategories, useCategoryMetadata, getCategoryIdFromName } from '../../../store/useStore.ts'
import { Input } from '../../../components/Input/Input.tsx'
import { Select } from '../../../components/Select/Select.tsx'
import { Button } from '../../../components/Button/Button.tsx'
import { FormGroup } from "../../../components/FormGroup/FormGroup.tsx"
import { Panel } from "../../../components/Panel/Panel.tsx"

interface TransactionsFiltersProps {
  availableMonths: Array<[string, string]>
}

const TransactionsFilters = ({ availableMonths }: TransactionsFiltersProps) => {
  const [amountFilterInput, setAmountFilterInput] = useState<string>('')

  const searchQuery = useStore((state) => state.searchQuery)
  const selectedCategory = useStore((state) => state.selectedCategory)
  const selectedMonthFilter = useStore((state) => state.selectedMonthFilter)
  const amountFilterType = useStore((state) => state.amountFilterType)
  const amountFilterValue = useStore((state) => state.amountFilterValue)
  const categoryMetadata = useCategoryMetadata()
  const categories = useCategories()

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
        value={selectedCategory || ''}
        onChange={e => {
          const categoryName = e.target.value
          const categoryId = categoryName ? getCategoryIdFromName(categoryName, categoryMetadata) : null
          setSelectedCategory(categoryId)
        }}
      >
        <option value="">All categories</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </Select>

      <Select
        label="Month"
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
