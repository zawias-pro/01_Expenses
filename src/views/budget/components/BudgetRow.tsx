import { useState } from 'react'
import { useStore } from '../../../store/useStore.ts'
import { formatPolishNumber } from '../../../parsing/formatPolishNumber/formatPolishNumber.ts'
import { parsePolishAmount } from '../../../parsing/parsePolishAmount/parsePolishAmount.ts'
import { Button } from '../../../components/Button/Button.tsx'
import { Input } from '../../../components/Input/Input.tsx'

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
    <div>
      {isEditing ? (
        <>
          <span>{name}</span>
          <Input
            id={`budget-row-amount-${name}`}
            type="text"
            label={'Amount'}
            value={editingAmount}
            onChange={e => { setEditingAmount(e.target.value) }}
          />
          <Button
            onClick={handleSaveEdit}
          >
            Save
          </Button>
          <Button
            onClick={() => { setIsEditing(false) }}
          >
            Cancel
          </Button>
        </>
      ) : (
        <>
          <span>{name}</span>
          <span>{formatPolishNumber(amount)} PLN</span>
          <Button
            onClick={handleStartEdit}
          >
            Edit
          </Button>
          <Button
            onClick={handleRemove}
          >
            Remove
          </Button>
        </>
      )}
    </div>
  )
}

export { BudgetRow }
