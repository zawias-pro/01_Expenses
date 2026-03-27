import type { Transaction } from '../../../../parsing/types.ts'
import { useStore, useCategoryMetadata, getCategoryNameFromId } from '../../../../store/useStore.ts'
import styles from './TransactionRow.module.css'

interface TransactionRowProps {
  transaction: Transaction
  isSelected: boolean
  onToggleSelect: () => void
  onQuickAddCategory: (transactionId: string) => void
  onEdit: (transaction: Transaction) => void
}

const cx = (...parts: Array<string | undefined>): string => parts.filter((part): part is string => part !== undefined && part !== '').join(' ')

const TransactionRow = ({
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

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to remove this transaction?\n\n${transaction.description}`)) {
      removeTransaction(transaction.id)
    }
  }

  const cellClass = styles['cell'] ?? ''
  const cellExcludedClass = styles['cellExcluded'] ?? ''
  const cellNormalClass = styles['cellNormal'] ?? ''
  const descriptionCellClass = styles['descriptionCell'] ?? ''
  const amountCellClass = styles['amountCell'] ?? ''
  const addedAtCellClass = styles['addedAtCell'] ?? ''
  const commentCellClass = styles['commentCell'] ?? ''
  const actionsCellClass = styles['actionsCell'] ?? ''
  const actionsClass = styles['actions'] ?? ''
  const actionButtonClass = styles['actionButton'] ?? ''
  const editButtonClass = styles['editButton'] ?? ''
  const deleteButtonClass = styles['deleteButton'] ?? ''
  const formCheckboxClass = styles['formCheckbox'] ?? ''
  const dateCellClass = styles['dateCell'] ?? ''
  const resetButtonClass = styles['resetButton'] ?? ''
  const categoryCellClass = styles['categoryCell'] ?? ''
  const addButtonClass = styles['addButton'] ?? ''
  const hashCodeClass = styles['hashCode'] ?? ''

  return (
    <tr>
      <td className={cellClass}>
        <input
          type="checkbox"
          className={formCheckboxClass}
          checked={isSelected}
          onChange={onToggleSelect}
        />
      </td>
      <td className={cx(cellClass, transaction.excluded ? cellExcludedClass : cellNormalClass)}>
        <div className={dateCellClass}>
          <span>{transaction.date}</span>
          {transaction.dateOverridden && (
            <button
              onClick={() => { resetTransactionDate(transaction.id) }}
              className={resetButtonClass}
              title="Reset date to original"
            >
              🔄
            </button>
          )}
        </div>
      </td>
      <td className={cx(cellClass, descriptionCellClass)}>
        {transaction.description}
      </td>
      <td className={cx(cellClass, transaction.excluded ? cellExcludedClass : cellNormalClass)}>
        <div className={categoryCellClass}>
          <span>{transaction.category} {getCategoryNameFromId(transaction.category, categoryMetadata)}</span>
          {transaction.category === null && !transaction.categoryOverridden && (
            <button
              onClick={() => { onQuickAddCategory(transaction.id) }}
              className={addButtonClass}
              title="Quick add category"
            >
              + Add
            </button>
          )}
          {transaction.categoryOverridden && (
            <button
              onClick={() => { resetTransactionCategory(transaction.id) }}
              className={resetButtonClass}
              title="Reset category to auto-classified"
            >
              🔄
            </button>
          )}
        </div>
      </td>
      <td className={cx(cellClass, amountCellClass)}>
        {transaction.amount}
      </td>
      <td className={cx(cellClass, addedAtCellClass)}>
        {transaction.addedAt !== undefined ? new Date(transaction.addedAt).toLocaleString() : 'N/A'}
      </td>
      <td className={cx(cellClass, transaction.excluded ? cellExcludedClass : cellNormalClass)}>
        <code className={hashCodeClass}>
          {transaction.hash || 'N/A'}
        </code>
      </td>
      <td className={commentCellClass}>
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
      <td className={actionsCellClass}>
        <div className={actionsClass}>
          <button
            onClick={() => { onEdit(transaction) }}
            className={cx(actionButtonClass, editButtonClass)}
            title="Edit transaction"
          >
            ✏️
          </button>
          <button
            onClick={handleRemove}
            className={cx(actionButtonClass, deleteButtonClass)}
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
