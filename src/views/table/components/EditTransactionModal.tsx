import { useCategories, useCategoryMetadata, getCategoryNameFromId, getCategoryIdFromName } from '../../../store/useStore.ts'
import { Modal } from '../../../components/Modal/Modal.tsx'
import { Button } from '../../../components/Button/Button.tsx'
import { Input } from '../../../components/Input/Input.tsx'
import { Select } from '../../../components/Select/Select.tsx'
import { Checkbox } from '../../../components/Checkbox/Checkbox.tsx'
import styles from './EditTransactionModal.module.css'
import { Textarea } from "../../../components/Textarea/Textarea.tsx"

interface EditTransactionModalProps {
  transactionId: string | null
  date: string
  category: string
  comment: string
  excluded: boolean
  onDateChange: (date: string) => void
  onCategoryChange: (category: string) => void
  onCommentChange: (comment: string) => void
  onExcludedChange: (excluded: boolean) => void
  onSave: () => void
  onCancel: () => void
}

const EditTransactionModal = ({
  transactionId,
  date,
  category,
  comment,
  excluded,
  onDateChange,
  onCategoryChange,
  onCommentChange,
  onExcludedChange,
  onSave,
  onCancel,
}: EditTransactionModalProps) => {
  const categories = useCategories()
  const categoryMetadata = useCategoryMetadata()
  const othersCategoryId = getCategoryIdFromName('others', categoryMetadata) || ''

  if (!transactionId) return null

  return (
    <Modal
      title="Edit Transaction"
      onClose={onCancel}
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>
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
          onChange={e => { onDateChange(e.target.value) }}
          placeholder="YYYY-MM-DD"
          className={styles.input}
        />

        <Select
          label="Category:"
          value={getCategoryNameFromId(category || othersCategoryId, categoryMetadata)}
          onChange={e => {
            const categoryName = e.target.value
            const categoryId = getCategoryIdFromName(categoryName, categoryMetadata)
            onCategoryChange(categoryId || othersCategoryId)
          }}
          className={styles.input}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>

        <Textarea
          label="Comment:"
          value={comment}
          onChange={e => { onCommentChange(e.target.value) }}
          placeholder="Enter a comment for this transaction..."
          rows={4}
          className={styles.textarea}
        />

        <Checkbox
          label="Exclude from calculations"
          checked={excluded}
          onChange={e => { onExcludedChange(e.target.checked) }}
          className={styles.checkbox}
        />
      </div>
    </Modal>
  )
}

export { EditTransactionModal }
