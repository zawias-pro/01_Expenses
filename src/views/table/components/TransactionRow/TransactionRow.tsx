import type { Transaction } from '../../../../parsing/types.ts'
import { useStore, useCategoryMetadata, getCategoryNameFromId } from '../../../../store/useStore.ts'
import styles from './TransactionRow.module.css'
import { EditCommentModal } from "../EditCommentModal/EditCommentModal.tsx"
import { useState } from "react"
import { QuickAddCategoryModal } from "../QuickAddCategoryModal/QuickAddCategoryModal.tsx"
import { EditDateModal } from "../EditDateModal/EditDateModal.tsx"

const TransactionRow = ({
  transaction,
  isSelected,
  onToggleSelect,
}: {
  transaction: Transaction
  isSelected: boolean
  onToggleSelect: () => void
}) => {
  const categoryMetadata = useCategoryMetadata()
  const resetTransactionDate = useStore((state) => state.resetTransactionDate)
  const resetTransactionCategory = useStore((state) => state.resetTransactionCategory)
  const removeTransaction = useStore((state) => state.removeTransaction)
  const toggleTransactionExcluded = useStore((state) => state.toggleTransactionExcluded)
  const [editCommentModalOpen, setEditCommentModalOpen] = useState(false)
  const [editDateModalOpen, setEditDateModalOpen] = useState(false)
  const [quickCategoryOpen, setQuickCategoryOpen] = useState(false)

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to remove this transaction?\n\n${transaction.description}`)) {
      removeTransaction(transaction.id)
    }
  }

  return (
    <tr className={transaction.excluded ? styles['excluded'] : undefined}>
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
          {(transaction.date !== transaction.originalDate) && (
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
          <span>{getCategoryNameFromId(transaction.category, categoryMetadata)}</span>
          {transaction.category === null && !(transaction.category!==transaction.originalCategory) && (
            <button
              onClick={() => { setQuickCategoryOpen(true) }}
              title="Quick add category"
            >
              + Add
            </button>
          )}
          {quickCategoryOpen&& <QuickAddCategoryModal
            transactionId={transaction.id}
            onCancel={() => { setQuickCategoryOpen(false) }}
          />}
          {(transaction.category!==transaction.originalCategory) && (
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
            title="Edit date"
            onClick={() => { setEditDateModalOpen(true) }}
          >
            ✏️
          </button>
          {editDateModalOpen && (
            <EditDateModal
              transaction={transaction}
              onClose={() => {setEditDateModalOpen(false)}}
            />
          )}
          <button
            title="Edit category"
          >
            ✏️
          </button>
          <button
            onClick={() => { setEditCommentModalOpen(true) }}
            title="Edit comment"
          >
            ✏️
          </button>
          {editCommentModalOpen && (
            <EditCommentModal
              transaction={transaction}
              onClose={() => {setEditCommentModalOpen(false)}}
            />
          )}
          <button
            onClick={() => { toggleTransactionExcluded(transaction.id) }}
            title="Toggle exclude"
          >
            ❌
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
