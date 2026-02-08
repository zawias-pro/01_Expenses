import { useState } from 'react'
import { useStore, useCategories, useCategoryMetadata, getCategoryIdFromName } from '../../../store/useStore.ts'
import { parsePolishAmount } from '../../../parsing/parsePolishAmount/parsePolishAmount.ts'
import { Button } from '../../../components/Button/Button.tsx'
import { Input } from '../../../components/Input/Input.tsx'
import { Select } from '../../../components/Select/Select.tsx'
import { SectionHeader } from "../../../components/SectionHeader/SectionHeader.tsx"
import { FormGroup } from "../../../components/FormGroup/FormGroup.tsx"

const AddBudgetForm = () => {
  const categories = useCategories()
  const categoryMetadata = useCategoryMetadata()
  const budgets = useStore((state) => state.budgets)
  const setBudget = useStore((state) => state.setBudget)

  const [newCategory, setNewCategory] = useState<string>('')
  const [newAmount, setNewAmount] = useState<string>('')

  const handleAddBudget = () => {
    if (newCategory.trim() && newAmount.trim()) {
      try {
        const amount = parsePolishAmount(newAmount)
        if (amount > 0) {
          setBudget(newCategory.trim(), amount)
          setNewCategory('')
          setNewAmount('')
        }
      } catch {
        alert('Invalid amount format')
      }
    }
  }

  const budgetCategoryIds = new Set(Object.keys(budgets))

  return (
    <div>
      <FormGroup>
        <Select
          id={'category'}
          label={'Category'}
          value={newCategory}
          onChange={event => { setNewCategory(event.target.value) }}
        >
          <option value="">Select category...</option>
          {categories
            .filter(cat => {
              const categoryId = getCategoryIdFromName(cat, categoryMetadata)
              return categoryId && !budgetCategoryIds.has(categoryId)
            })
            .map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
        </Select>
        <Input
          id={'amount'}
          label={'Amount'}
          type="text"
          value={newAmount}
          onChange={event => { setNewAmount(event.target.value) }}
          placeholder="1000,00"
        />
      </FormGroup>

      <Button
        onClick={handleAddBudget}
        disabled={!newCategory.trim() || !newAmount.trim()}
        style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
      >
        Add
      </Button>
    </div>
  )
}

export { AddBudgetForm }
