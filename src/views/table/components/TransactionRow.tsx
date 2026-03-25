import type { Transaction } from '../../../parsing/types.ts'
import { useStore, useCategoryMetadata, getCategoryNameFromId } from '../../../store/useStore.ts'
import styles from './TransactionRow.module.css'

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
      <td className={styles.cell}>
        <input
          type="checkbox"
          className={styles.formCheckbox}
          checked={isSelected}
          onChange={onToggleSelect}
        />
      </td>
      <td className={`${styles.cell} ${transaction.excluded ? styles.cellExcluded : styles.cellNormal}`}>
        <div className={styles.dateCell}>
          <span>{transaction.date}</span>
          {transaction.dateOverridden && (
            <button
              onClick={() => { resetTransactionDate(transaction.id) }}
              className={styles.resetButton}
              title="Reset date to original"
            >
              🔄
            </button>
          )}
        </div>
      </td>
      <td className={`${styles.cell} ${styles.descriptionCell}`}>
        {transaction.description}
      </td>
      <td className={`${styles.cell} ${transaction.excluded ? styles.cellExcluded : styles.cellNormal}`}>
        <div className={styles.categoryCell}>
          <span>{transaction.category} {getCategoryNameFromId(transaction.category, categoryMetadata)}</span>
          {transaction.category === null && !transaction.categoryOverridden && (
            <button
              onClick={() => { onQuickAddCategory(transaction.id, transaction.description) }}
              className={styles.addButton}
              title="Quick add category"
            >
              + Add
            </button>
          )}
          {transaction.categoryOverridden && (
            <button
              onClick={() => { resetTransactionCategory(transaction.id) }}
              className={styles.resetButton}
              title="Reset category to auto-classified"
            >
              🔄
            </button>
          )}
        </div>
      </td>
      <td className={`${styles.cell} ${styles.amountCell}`}>
        {transaction.amount}
      </td>
      <td className={`${styles.cell} ${styles.addedAtCell}`}>
        {transaction.addedAt !== undefined ? new Date(transaction.addedAt).toLocaleString() : 'N/A'}
      </td>
      <td className={`${styles.cell} ${transaction.excluded ? styles.cellExcluded : styles.cellNormal}`}>
        <code className={styles.hashCode}>
          {transaction.hash || 'N/A'}
        </code>
      </td>
      <td className={styles.commentCell}>
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
      <td className={styles.actionsCell}>
        <div className={styles.actions}>
          <button
            onClick={() => { onEdit(transaction) }}
            className={`${styles.actionButton} ${styles.editButton}`}
            title="Edit transaction"
          >
            ✏️
          </button>
          <button
            onClick={handleRemove}
            className={`${styles.actionButton} ${styles.deleteButton}`}
            title="Remove transaction"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  )
}
