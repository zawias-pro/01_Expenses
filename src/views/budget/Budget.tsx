import { useState } from 'react'
import { useStore } from '../../store/useStore.ts'
import { useCategories } from '../../store/useStore.ts'
import { formatPolishNumber } from '../../parsing/formatPolishNumber/formatPolishNumber.ts'
import { parsePolishAmount } from '../../parsing/parsePolishAmount/parsePolishAmount.ts'

const Budget = () => {
  const categories = useCategories()
  const budgets = useStore((state) => state.budgets)
  const setBudget = useStore((state) => state.setBudget)
  const removeBudget = useStore((state) => state.removeBudget)
  
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingAmount, setEditingAmount] = useState<string>('')
  const [newCategory, setNewCategory] = useState<string>('')
  const [newAmount, setNewAmount] = useState<string>('')

  const handleStartEdit = (category: string, amount: number) => {
    setEditingCategory(category)
    setEditingAmount(formatPolishNumber(amount))
  }

  const handleSaveEdit = () => {
    if (editingCategory) {
      try {
        const amount = parsePolishAmount(editingAmount)
        if (amount > 0) {
          setBudget(editingCategory, amount)
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

  const handleRemove = (category: string) => {
    if (window.confirm(`Remove budget for "${category}"?`)) {
      removeBudget(category)
    }
  }

  const budgetEntries = Object.entries(budgets).sort(([a], [b]) => a.localeCompare(b))

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
            {categories.filter(cat => !budgets[cat]).map(cat => (
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
            {budgetEntries.map(([category, amount]) => (
              <div
                key={category}
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
                {editingCategory === category ? (
                  <>
                    <span style={{ minWidth: '200px', fontWeight: '500' }}>{category}</span>
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
                    <span style={{ minWidth: '200px', fontWeight: '500' }}>{category}</span>
                    <span style={{ minWidth: '150px' }}>{formatPolishNumber(amount)} PLN</span>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleStartEdit(category, amount)}
                      style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleRemove(category)}
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
