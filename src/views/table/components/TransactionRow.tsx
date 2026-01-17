import type { Transaction } from '../../../parsing/types.ts'
import { useStore, useCategoryMetadata, getCategoryNameFromId, getCategoryIdFromName } from '../../../store/useStore.ts'

interface TransactionRowProps {
  transaction: Transaction
  isSelected: boolean
  onToggleSelect: () => void
  onQuickAddCategory: (transactionId: string, description: string) => void
  onEdit: (transaction: Transaction) => void
}

export const TransactionRow = ({
  transaction,
  isSelected,
  onToggleSelect,
  onQuickAddCategory,
  onEdit,
}: TransactionRowProps) => {
  const categoryMetadata = useCategoryMetadata()
  const othersCategoryId = getCategoryIdFromName('others', categoryMetadata) || ''
  const resetTransactionDate = useStore((state) => state.resetTransactionDate)
  const resetTransactionCategory = useStore((state) => state.resetTransactionCategory)
  const removeTransaction = useStore((state) => state.removeTransaction)

  const excludedStyle = {
    textDecoration: transaction.excluded ? 'line-through' as const : 'none' as const,
    color: transaction.excluded ? '#999' : 'inherit',
    opacity: transaction.excluded ? 0.6 : 1
  }

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to remove this transaction?\n\n${transaction.description}`)) {
      removeTransaction(transaction.id)
    }
  }

  return (
    <tr>
      <td style={{ padding: '0.375rem' }}>
        <input
          type="checkbox"
          className="form-checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          style={{ width: '14px', height: '14px' }}
        />
      </td>
      <td style={{ padding: '0.375rem', ...excludedStyle }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span>{transaction.date}</span>
          {transaction.dateOverridden && (
            <button
              onClick={() => { resetTransactionDate(transaction.id) }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.125rem',
                fontSize: '0.75rem',
                color: '#ff9800',
                opacity: 1
              }}
              title="Reset date to original"
            >
              🔄
            </button>
          )}
        </div>
      </td>
      <td style={{ padding: '0.375rem', ...excludedStyle }}>
        {transaction.description}
      </td>
      <td style={{ padding: '0.375rem', ...excludedStyle }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{getCategoryNameFromId(transaction.category, categoryMetadata)}</span>
          {transaction.category === othersCategoryId && !transaction.categoryOverridden && (
            <button
              onClick={() => { onQuickAddCategory(transaction.id, transaction.description) }}
              style={{
                fontSize: '0.75rem',
                padding: '0.125rem 0.375rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
              title="Quick add category"
            >
              + Add
            </button>
          )}
          {transaction.categoryOverridden && (
            <button
              onClick={() => { resetTransactionCategory(transaction.id) }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.125rem',
                fontSize: '0.75rem',
                color: '#ff9800',
                opacity: 1
              }}
              title="Reset category to auto-classified"
            >
              🔄
            </button>
          )}
        </div>
      </td>
      <td style={{ padding: '0.375rem', ...excludedStyle }}>
        {transaction.amount}
      </td>
      <td style={{ padding: '0.375rem', ...excludedStyle }}>
        {transaction.addedAt !== undefined ? new Date(transaction.addedAt).toLocaleString() : 'N/A'}
      </td>
      <td style={{ padding: '0.375rem', ...excludedStyle }}>
        <code style={{ 
          fontSize: '0.6875rem', 
          fontFamily: 'monospace',
          color: '#666',
          backgroundColor: '#f5f5f5',
          padding: '1px 3px',
          borderRadius: '2px'
        }}>
          {transaction.hash || 'N/A'}
        </code>
      </td>
      <td style={{ padding: '0.375rem', textAlign: 'center', opacity: 1 }}>
        {transaction.comment && (
          <span
            style={{
              fontSize: '0.875rem',
              color: '#007bff'
            }}
            title={transaction.comment}
          >
            💭
          </span>
        )}
      </td>
      <td style={{ padding: '0.375rem', textAlign: 'center', opacity: 1 }}>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            onClick={() => { onEdit(transaction) }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              fontSize: '0.875rem',
              color: '#007bff'
            }}
            title="Edit transaction"
          >
            ✏️
          </button>
          <button
            onClick={handleRemove}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              fontSize: '0.875rem',
              color: '#dc3545'
            }}
            title="Remove transaction"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  )
}
