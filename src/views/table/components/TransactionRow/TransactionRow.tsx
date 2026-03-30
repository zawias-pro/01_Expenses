import type { Transaction } from '../../../../parsing/types.ts'
import { useStore, useCategoryMetadata, getCategoryNameFromId } from '../../../../store/useStore.ts'

const TransactionRow = ({
  transaction,
  isSelected,
  onToggleSelect,
  onQuickAddCategory,
  onEdit,
}: {
  transaction: Transaction
  isSelected: boolean
  onToggleSelect: () => void
  onQuickAddCategory: (transactionId: string) => void
  onEdit: (transaction: Transaction) => void
}) => {
  const categoryMetadata = useCategoryMetadata()
  const resetTransactionDate = useStore((state) => state.resetTransactionDate)
  const resetTransactionCategory = useStore((state) => state.resetTransactionCategory)
  const removeTransaction = useStore((state) => state.removeTransaction)

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to remove this transaction?\n\n${transaction.description}`)) {
      removeTransaction(transaction.id)
    }
  }

  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
        />
      </td>
      <td>
        <div>
          <span>{transaction.date}</span>
          {transaction.dateOverridden && (
            <button
              onClick={() => { resetTransactionDate(transaction.id) }}
              title="Reset date to original"
            >
              🔄
            </button>
          )}
        </div>
      </td>
      <td>
        {transaction.description}
      </td>
      <td>
        <div>
          <span>{transaction.category} {getCategoryNameFromId(transaction.category, categoryMetadata)}</span>
          {transaction.category === null && !transaction.categoryOverridden && (
            <button
              onClick={() => { onQuickAddCategory(transaction.id) }}
              title="Quick add category"
            >
              + Add
            </button>
          )}
          {transaction.categoryOverridden && (
            <button
              onClick={() => { resetTransactionCategory(transaction.id) }}
              title="Reset category to auto-classified"
            >
              🔄
            </button>
          )}
        </div>
      </td>
      <td>
        {transaction.amount}
      </td>
      <td>
        {transaction.addedAt !== undefined ? new Date(transaction.addedAt).toLocaleString() : 'N/A'}
      </td>
      <td>
        <code>
          {transaction.hash}
        </code>
      </td>
      <td>
        {transaction.comment && (
          <span title={transaction.comment}>
            💭
          </span>
        )}
      </td>
      <td>
        <div>
          <button
            onClick={() => { onEdit(transaction) }}
            title="Edit transaction"
          >
            ✏️
          </button>
          <button
            onClick={handleRemove}
            title="Remove transaction"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  )
}

export { TransactionRow }
