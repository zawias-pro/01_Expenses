import { NO_CATEGORY_KEY } from '../../../../parsing/types.ts'
import { useCategories, useCategoryMetadata, getCategoryNameFromId, getCategoryIdFromName, useStore } from '../../../../store/useStore.ts'
import { useState } from 'react'
import { Modal } from '../../../../components/Modal/Modal.tsx'
import { Button } from '../../../../components/Button/Button.tsx'
import { Input } from '../../../../components/Input/Input.tsx'
import { Select } from '../../../../components/Select/Select.tsx'
import { Checkbox } from '../../../../components/Checkbox/Checkbox.tsx'
import { Textarea } from '../../../../components/Textarea/Textarea.tsx'

const EditTransactionModal = ({
  transactionId,
  onClose
}: {
  transactionId: string | null
  onClose: () => void
}) => {
  const categories = useCategories()
  const categoryMetadata = useCategoryMetadata()

  const transactions = useStore((s) => s.transactions)
  const updateTransactionDate = useStore((s) => s.updateTransactionDate)
  const updateTransactionCategory = useStore((s) => s.updateTransactionCategory)
  const updateTransactionComment = useStore((s) => s.updateTransactionComment)
  const updateTransactionExcluded = useStore((s) => s.updateTransactionExcluded)

  const transaction = transactionId
    ? (transactions.find((t) => t.id === transactionId) ?? null)
    : null

  const [date, setDate] = useState(transaction?.date ?? '')
  const [selectedCategoryId, setSelectedCategoryId] = useState(transaction?.category ?? null)
  const [comment, setComment] = useState(transaction?.comment ?? '')
  const [excluded, setExcluded] = useState(transaction?.excluded ?? false)

  if(transaction===null){
    return null
  }

  const handleSave = () => {
    updateTransactionDate(transaction.id, date)
    updateTransactionCategory(transaction.id, selectedCategoryId)
    updateTransactionComment(transaction.id, comment)
    updateTransactionExcluded(transaction.id, excluded)
    onClose()
  }

  return (
    <Modal
      title={"Edit Transaction"}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </>
      }
    >
      <>
        <Input
          id="edit-transaction-date"
          label="Date"
          type="text"
          value={date}
          onChange={e => { setDate(e.target.value) }}
          placeholder="YYYY-MM-DD"
        />

        <Select
          id="edit-transaction-category"
          label="Category"
          value={getCategoryNameFromId(selectedCategoryId, categoryMetadata)}
          onChange={e => {
            const categoryName = e.target.value
            if (categoryName === NO_CATEGORY_KEY) {
              setSelectedCategoryId(null)
            } else {
              setSelectedCategoryId(getCategoryIdFromName(categoryName, categoryMetadata) ?? null)
            }
          }}
        >
          <option value={NO_CATEGORY_KEY}>{NO_CATEGORY_KEY}</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>

        <Textarea
          id="edit-transaction-comment"
          label="Comment"
          value={comment}
          onChange={e => { setComment(e.target.value) }}
          rows={4}
        />

        <Checkbox
          label="Exclude from calculations"
          checked={excluded}
          onChange={e => { setExcluded(e.target.checked) }}
        />
      </>
    </Modal>
  )
}

export { EditTransactionModal }
