import { useState } from 'react'
import { useStore, useCategories, useCategoryMetadata, getCategoryIdFromName } from '../../../store/useStore.ts'
import { parsePolishAmount } from '../../../parsing/parsePolishAmount/parsePolishAmount.ts'

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
    <div style={{ 
      marginBottom: '2rem', 
      padding: '1rem', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '4px' 
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>Add New Budget</h3>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          className="form-select"
          value={newCategory}
          onChange={e => { setNewCategory(e.target.value) }}
          style={{ minWidth: '200px', fontSize: '0.875rem', padding: '0.375rem' }}
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
        </select>
        <input
          type="text"
          className="form-input"
          value={newAmount}
          onChange={e => { setNewAmount(e.target.value) }}
          placeholder="Amount (e.g., 1 000,00 PLN)"
          style={{ minWidth: '150px', fontSize: '0.875rem', padding: '0.375rem' }}
        />
        <button
          className="btn btn-primary"
          onClick={handleAddBudget}
          disabled={!newCategory.trim() || !newAmount.trim()}
          style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
        >
          Add
        </button>
      </div>
    </div>
  )
}

export { AddBudgetForm }
