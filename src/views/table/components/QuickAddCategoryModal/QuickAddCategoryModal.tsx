import { useCategories, useCategoryMetadata, useStore, getOrCreateCategoryId } from '../../../../store/useStore.ts'
import { Modal } from '../../../../components/Modal/Modal.tsx'
import { Button } from '../../../../components/Button/Button.tsx'
import { Input } from '../../../../components/Input/Input.tsx'
import { Select } from '../../../../components/Select/Select.tsx'
import styles from './QuickAddCategoryModal.module.css'
import { useState } from 'react'

interface QuickAddCategoryModalProps {
  transactionId: string | null
  onCancel: () => void
}

const QuickAddCategoryModal = ({ transactionId, onCancel }: QuickAddCategoryModalProps) => {
  const categories = useCategories()
  const categoryMetadata = useCategoryMetadata()

  const updateCategory = useStore((s) => s.updateCategory)
  const updateTransactionCategory = useStore((s) => s.updateTransactionCategory)
  const transactions = useStore((s) => s.transactions)

  const transaction = transactionId ? transactions.find((t) => t.id === transactionId) ?? null : null

  const [selectedCategory, setSelectedCategory] = useState<string>('new')
  const [customCategory, setCustomCategory] = useState<string>('')
  const [keyword, setKeyword] = useState<string>(transaction?.description ?? '')

  if (!transaction) return null

  const handleSave = () => {
    let categoryName = ''
    if (selectedCategory === 'new') {
      if (!customCategory.trim()) {
        alert('Please enter a category name')
        return
      }
      categoryName = customCategory.trim()
    } else {
      categoryName = selectedCategory
    }

    if (selectedCategory === 'new' && categories.includes(categoryName)) {
      alert('Category with this name already exists. Please choose a different name.')
      return
    }

    if (!keyword.trim()) {
      alert('Please enter at least one keyword')
      return
    }

    const keywords = keyword.split(',').map((k) => k.trim()).filter((k) => k)
    updateCategory(categoryName, keywords, true)

    // Convert newly created or existing category name to ID and update transaction
    const categoryId = getOrCreateCategoryId(categoryName, categoryMetadata)
    updateTransactionCategory(transaction.id, categoryId)

    // Reset internal state and close modal
    setSelectedCategory('new')
    setCustomCategory('')
    setKeyword('')
    onCancel()
  }

  return (
    <Modal
      title="Quick Add Category"
      onClose={onCancel}
      footer={
        <>
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!keyword.trim() || (selectedCategory === 'new' && !customCategory.trim())}
          >
            Save
          </Button>
        </>
      }
    >
      <div className={styles['form']}>
        <Select
          id="quick-add-category-select"
          label="Category:"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value)
          }}
          className={styles['select']}
        >
          <option value="new">New category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>

        {selectedCategory === 'new' && (
          <Input
            id="quick-add-custom-category"
            label="Custom Category Name:"
            type="text"
            value={customCategory}
            onChange={(e) => {
              setCustomCategory(e.target.value)
            }}
            placeholder="Enter category name"
            className={styles['input']}
          />
        )}

        <Input
          id="quick-add-keyword"
          label="Keyword (comma-separated):"
          type="text"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value)
          }}
          placeholder="Enter keywords"
          className={styles['input']}
        />
      </div>
    </Modal>
  )
}

export { QuickAddCategoryModal }
