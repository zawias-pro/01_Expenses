import { useState } from 'react'
import { useStore } from '../../../store/useStore.ts'
import { formatPolishNumber } from '../../../parsing/formatPolishNumber/formatPolishNumber.ts'
import { parsePolishAmount } from '../../../parsing/parsePolishAmount/parsePolishAmount.ts'

interface BudgetRowProps {
  name: string
  amount: number
}

const BudgetRow = ({ name, amount }: BudgetRowProps) => {
  const setBudget = useStore((state) => state.setBudget)
  const removeBudget = useStore((state) => state.removeBudget)

  const [isEditing, setIsEditing] = useState(false)
  const [editingAmount, setEditingAmount] = useState('')

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditingAmount(formatPolishNumber(amount))
  }

  const handleSaveEdit = () => {
    try {
      const parsedAmount = parsePolishAmount(editingAmount)
      if (parsedAmount > 0) {
        setBudget(name, parsedAmount)
        setIsEditing(false)
      }
    } catch {
      alert('Invalid amount format')
    }
  }

  const handleRemove = () => {
    if (window.confirm(`Remove budget for "${name}"?`)) {
      removeBudget(name)
    }
  }

  return (
    <div
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
      {isEditing ? (
        <>
          <span style={{ minWidth: '200px', fontWeight: '500' }}>{name}</span>
          <input
            type="text"
            className="form-input"
            value={editingAmount}
            onChange={e => { setEditingAmount(e.target.value) }}
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
            onClick={() => { setIsEditing(false) }}
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
            onClick={handleStartEdit}
            style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
          >
            Edit
          </button>
          <button
            className="btn btn-outline"
            onClick={handleRemove}
            style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem', color: '#dc3545' }}
          >
            Remove
          </button>
        </>
      )}
    </div>
  )
}

export { BudgetRow }
