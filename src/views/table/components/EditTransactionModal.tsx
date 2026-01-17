import { useCategories, useCategoryMetadata, getCategoryNameFromId, getCategoryIdFromName } from '../../../store/useStore.ts'
import { Modal } from '../../../components/Modal/Modal.tsx'
import { Button } from '../../../components/Button/Button.tsx'
import { Input, TextArea } from '../../../components/Input/Input.tsx'
import { Select } from '../../../components/Select/Select.tsx'
import { Checkbox } from '../../../components/Checkbox/Checkbox.tsx'

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Input
          label="Date:"
          type="text"
          value={date}
          onChange={e => { onDateChange(e.target.value) }}
          placeholder="YYYY-MM-DD"
          style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem' }}
        />
        
        <Select
          label="Category:"
          value={getCategoryNameFromId(category || othersCategoryId, categoryMetadata)}
          onChange={e => {
            const categoryName = e.target.value
            const categoryId = getCategoryIdFromName(categoryName, categoryMetadata)
            onCategoryChange(categoryId || othersCategoryId)
          }}
          style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem' }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>
        
        <TextArea
          label="Comment:"
          value={comment}
          onChange={e => { onCommentChange(e.target.value) }}
          placeholder="Enter a comment for this transaction..."
          rows={4}
          style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem', fontFamily: 'inherit', resize: 'vertical' }}
        />
        
        <Checkbox
          label="Exclude from calculations"
          checked={excluded}
          onChange={e => { onExcludedChange(e.target.checked) }}
        />
      </div>
    </Modal>
  )
}

export { EditTransactionModal }
