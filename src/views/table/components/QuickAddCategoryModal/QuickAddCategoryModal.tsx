import { useCategories, useCategoryMetadata, useStore, getOrCreateCategoryId } from '../../../../store/useStore.ts'
import { Modal } from '../../../../components/Modal/Modal.tsx'
import { Button } from '../../../../components/Button/Button.tsx'
import { Input } from '../../../../components/Input/Input.tsx'
import { Select } from '../../../../components/Select/Select.tsx'
import { useState } from 'react'

const QuickAddCategoryModal = ({
  transactionId,
  onCancel
}: {
  transactionId: string | null
  onCancel: () => void
}) => {
  const categories = useCategories()
  const categoryMetadata = useCategoryMetadata()

  const updateCategory = useStore((s) => s.updateCategory)
  const updateTransactionCategory = useStore((s) => s.updateTransactionCategory)
  const transactions = useStore((s) => s.transactions)

  const transaction = transactionId ? transactions.find((t) => t.id === transactionId) ?? null : null

  const [selectedCategory, setSelectedCategory] = useState('new')
  const [customCategory, setCustomCategory] = useState('')
  const [keyword, setKeyword] = useState(transaction?.description ?? '')

  if (transaction === null) {
    return null
  }

  const handleSave = () => {
    const categoryName = selectedCategory === 'new'
      ? customCategory.trim()
      : selectedCategory

    if (selectedCategory === 'new' && !categoryName) {
      alert('Please enter a category name')
      return
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
      <>
        <Select
          id="quick-add-category-select"
          label="Category"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value)
          }}
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
            label="Custom Category Name"
            type="text"
            value={customCategory}
            onChange={(e) => {
              setCustomCategory(e.target.value)
            }}
          />
        )}

        <Input
          id="quick-add-keyword"
          label="Keywords (comma-separated)"
          type="text"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value)
          }}
        />
      </>
    </Modal>
  )
}

export { QuickAddCategoryModal }
