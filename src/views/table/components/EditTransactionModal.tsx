import { NO_CATEGORY_KEY } from '../../../parsing/types.ts'
import { useCategories, useCategoryMetadata, getCategoryNameFromId, getCategoryIdFromName, useStore } from '../../../store/useStore.ts'
import { useEffect, useState } from 'react'
import { Modal } from '../../../components/Modal/Modal.tsx'
import { Button } from '../../../components/Button/Button.tsx'
import { Input } from '../../../components/Input/Input.tsx'
import { Select } from '../../../components/Select/Select.tsx'
import { Checkbox } from '../../../components/Checkbox/Checkbox.tsx'
import styles from './EditTransactionModal.module.css'
import { Textarea } from "../../../components/Textarea/Textarea.tsx"

const EditTransactionModal = ({
  transactionId,
  onCancel
}: {
  transactionId: string | null
  onCancel: () => void
}) => {
  const categories = useCategories()
  const categoryMetadata = useCategoryMetadata()

  const transactions = useStore((s) => s.transactions)
  const updateTransactionDate = useStore((s) => s.updateTransactionDate)
  const updateTransactionCategory = useStore((s) => s.updateTransactionCategory)
  const updateTransactionComment = useStore((s) => s.updateTransactionComment)
  const updateTransactionExcluded = useStore((s) => s.updateTransactionExcluded)

  const [date, setDate] = useState<string>('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [comment, setComment] = useState<string>('')
  const [excluded, setExcluded] = useState<boolean>(false)

  useEffect(() => {
    if (!transactionId) return
    const tx = transactions.find((t) => t.id === transactionId)
    if (!tx) return
    setDate(tx.date)
    setSelectedCategoryId(tx.category ?? null)
    setComment(tx.comment ?? '')
    setExcluded(tx.excluded)
  }, [transactionId, transactions])

  if (!transactionId) return null

  const handleSave = () => {
    if (!transactionId) return
    updateTransactionDate(transactionId, date)
    updateTransactionCategory(transactionId, selectedCategoryId)
    updateTransactionComment(transactionId, comment)
    updateTransactionExcluded(transactionId, excluded)
    onCancel()
  }

  return (
    <Modal
      title="Edit Transaction"
      onClose={onCancel}
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <Input
          label="Date:"
          type="text"
          value={date}
          onChange={e => { setDate(e.target.value) }}
          placeholder="YYYY-MM-DD"
          className={styles.input}
        />

        <Select
          label="Category:"
          value={getCategoryNameFromId(selectedCategoryId, categoryMetadata)}
          onChange={e => {
            const categoryName = e.target.value
            if (categoryName === NO_CATEGORY_KEY) {
              setSelectedCategoryId(null)
            } else {
              setSelectedCategoryId(getCategoryIdFromName(categoryName, categoryMetadata) ?? null)
            }
          }}
          className={styles.input}
        >
          <option value={NO_CATEGORY_KEY}>{NO_CATEGORY_KEY}</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>

        <Textarea
          label="Comment:"
          value={comment}
          onChange={e => { setComment(e.target.value) }}
          placeholder="Enter a comment for this transaction..."
          rows={4}
          className={styles.textarea}
        />

        <Checkbox
          label="Exclude from calculations"
          checked={excluded}
          onChange={e => { setExcluded(e.target.checked) }}
          className={styles.checkbox}
        />
      </div>
    </Modal>
  )
}

export { EditTransactionModal }
