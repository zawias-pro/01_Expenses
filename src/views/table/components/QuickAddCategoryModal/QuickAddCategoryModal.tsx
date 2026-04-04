import { useCategories, useStore } from '../../../../store/useStore.ts'
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
  const addKeywordToCategory = useStore((s) => s.addKeywordToCategory)
  const updateCategory = useStore((s) => s.updateCategory)
  const reclassifyTransactions = useStore((s) => s.reclassifyTransactions)
  const transactions = useStore((s) => s.transactions)

  const transaction = transactionId ? transactions.find((t) => t.id === transactionId) ?? null : null

  const initialKeyword = (() => {
    return (transaction?.description ?? '')
      .replace(/www/i, '')
      .replace(/\.pl/i, '')
      .replace(/\.com/i, '')
      .split(' ')[0] ?? ''
  })()

  const [selectedCategory, setSelectedCategory] = useState('new')
  const [customCategory, setCustomCategory] = useState('')
  const [keyword, setKeyword] = useState(initialKeyword)

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

    if (selectedCategory === 'new' && categories.find(c=>c.name===categoryName)) {
      alert('Category with this name already exists. Please choose a different name.')
      return
    }

    if(selectedCategory==='new') {
      updateCategory(categoryName, [keyword])
    } else {
      addKeywordToCategory(categoryName, keyword)
    }
    reclassifyTransactions()

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
          {Object.entries(categories).map(([id, metadata]) => (
            <option key={id} value={id}>{metadata.name}</option>
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
          label="Keyword"
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
