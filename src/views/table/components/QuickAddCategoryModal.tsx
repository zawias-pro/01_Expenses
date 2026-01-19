import { useCategories } from '../../../store/useStore.ts'
import { Modal } from '../../../components/Modal/Modal.tsx'
import { Button } from '../../../components/Button/Button.tsx'
import { Input } from '../../../components/Input/Input.tsx'
import { Select } from '../../../components/Select/Select.tsx'
import styles from './QuickAddCategoryModal.module.css'

interface QuickAddCategoryModalProps {
  transactionId: string | null
  selectedCategory: string
  customCategory: string
  keyword: string
  onSelectedCategoryChange: (category: string) => void
  onCustomCategoryChange: (category: string) => void
  onKeywordChange: (keyword: string) => void
  onSave: () => void
  onCancel: () => void
}

const QuickAddCategoryModal = ({
  transactionId,
  selectedCategory,
  customCategory,
  keyword,
  onSelectedCategoryChange,
  onCustomCategoryChange,
  onKeywordChange,
  onSave,
  onCancel,
}: QuickAddCategoryModalProps) => {
  const categories = useCategories()

  if (!transactionId) return null

  return (
    <Modal
      title="Quick Add Category"
      onClose={onCancel}
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            disabled={!keyword.trim() || (selectedCategory === 'new' && !customCategory.trim())}
          >
            Save
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <Select
          label="Category:"
          value={selectedCategory}
          onChange={e => { onSelectedCategoryChange(e.target.value) }}
          className={styles.select}
        >
          <option value="new">New category</option>
          {categories.filter(cat => cat !== 'others').map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>

        {selectedCategory === 'new' && (
          <Input
            label="Custom Category Name:"
            type="text"
            value={customCategory}
            onChange={e => { onCustomCategoryChange(e.target.value) }}
            placeholder="Enter category name"
            className={styles.input}
          />
        )}

        <Input
          label="Keyword (comma-separated):"
          type="text"
          value={keyword}
          onChange={e => { onKeywordChange(e.target.value) }}
          placeholder="Enter keywords"
          className={styles.input}
        />
      </div>
    </Modal>
  )
}

export { QuickAddCategoryModal }
