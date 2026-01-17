import { useState } from 'react'
import { useStore, useCategories, useCategoryMetadata, getCategoryNameFromId, getCategoryIdFromName } from '../../store/useStore.ts'
import { formatPolishNumber } from '../../parsing/formatPolishNumber/formatPolishNumber.ts'
import { parsePolishAmount } from '../../parsing/parsePolishAmount/parsePolishAmount.ts'

const Budget = () => {
  const categories = useCategories() // category names
  const categoryMetadata = useCategoryMetadata()
  const budgets = useStore((state) => state.budgets) // category ID -> amount
  const setBudget = useStore((state) => state.setBudget)
  const removeBudget = useStore((state) => state.removeBudget)
  
  const [editingCategory, setEditingCategory] = useState<string | null>(null) // category name
  const [editingAmount, setEditingAmount] = useState<string>('')
  const [newCategory, setNewCategory] = useState<string>('') // category name
  const [newAmount, setNewAmount] = useState<string>('')

  const handleStartEdit = (categoryName: string, amount: number) => {
    setEditingCategory(categoryName)
    setEditingAmount(formatPolishNumber(amount))
  }

  const handleSaveEdit = () => {
    if (editingCategory) {
      try {
        const amount = parsePolishAmount(editingAmount)
        if (amount > 0) {
          setBudget(editingCategory, amount) // setBudget converts name to ID
          setEditingCategory(null)
          setEditingAmount('')
        }
      } catch {
        alert('Invalid amount format')
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditingAmount('')
  }

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

  const handleRemove = (categoryName: string) => {
    if (window.confirm(`Remove budget for "${categoryName}"?`)) {
      removeBudget(categoryName) // removeBudget converts name to ID
    }
  }

  // Convert budget entries from IDs to names for display
  const budgetEntries = Object.entries(budgets)
    .map(([categoryId, amount]) => ({
      id: categoryId,
      name: getCategoryNameFromId(categoryId, categoryMetadata),
      amount
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
  
  // Get set of category IDs that have budgets
  const budgetCategoryIds = new Set(Object.keys(budgets))

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>Monthly Budget</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Define monthly budgets for each category. Amounts should be in PLN format (e.g., "1 000,00 PLN" or "500,00").
      </p>

      {/* Add New Budget */}
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
            onChange={e => setNewCategory(e.target.value)}
            style={{ minWidth: '200px', fontSize: '0.875rem', padding: '0.375rem' }}
          >
            <option value="">Select category...</option>
            {categories
              .filter(cat => {
                const categoryId = getCategoryIdFromName(cat, categoryMetadata)
                return !budgetCategoryIds.has(categoryId)
              })
              .map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
          </select>
          <input
            type="text"
            className="form-input"
            value={newAmount}
            onChange={e => setNewAmount(e.target.value)}
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

      {/* Budget List */}
      <div>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>Current Budgets</h3>
        {budgetEntries.length === 0 ? (
          <p style={{ color: '#666' }}>No budgets defined yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {budgetEntries.map(({ id, name, amount }) => (
              <div
                key={id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                {editingCategory === name ? (
                  <>
                    <span style={{ minWidth: '200px', fontWeight: '500' }}>{name}</span>
                    <input
                      type="text"
                      className="form-input"
                      value={editingAmount}
                      onChange={e => setEditingAmount(e.target.value)}
                      style={{ minWidth: '150px', fontSize: '0.875rem', padding: '0.375rem' }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveEdit}
                      style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={handleCancelEdit}
                      style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ minWidth: '200px', fontWeight: '500' }}>{name}</span>
                    <span style={{ minWidth: '150px' }}>{formatPolishNumber(amount)} PLN</span>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleStartEdit(name, amount)}
                      style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleRemove(name)}
                      style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem', color: '#dc3545' }}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export { Budget }
