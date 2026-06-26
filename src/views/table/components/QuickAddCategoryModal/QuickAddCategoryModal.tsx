import { useCategoryMetadata, useStore } from '../../../../store/useStore.ts'
import { Modal } from '../../../../components/Modal/Modal.tsx'
import { Button } from '../../../../components/Button/Button.tsx'
import { Input } from '../../../../components/Input/Input.tsx'
import { Select } from '../../../../components/Select/Select.tsx'
import { useState } from 'react'

const FORM_NAME = 'quick-add-category-form'
const CATEGORY_ID_NEW = 'new'

const QuickAddCategoryModal = ({
  transactionId,
  onCancel
}: {
  transactionId: string | null
  onCancel: () => void
}) => {
  const categories = useCategoryMetadata()
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

  const [selectedCategoryId, setSelectedCategoryId] = useState(CATEGORY_ID_NEW)
  const [customCategory, setCustomCategory] = useState('')
  const [keyword, setKeyword] = useState(initialKeyword)

  if (transaction === null) {
    return null
  }

  const handleSave = () => {
    if (selectedCategoryId === CATEGORY_ID_NEW && customCategory.trim()==='') {
      alert('Please enter a category name')
      return
    }

    if (selectedCategoryId === CATEGORY_ID_NEW && Object.values(categories).find(c=>c.name===customCategory.trim())) {
      alert('Category with this name already exists. Please choose a different name.')
      return
    }

    if (selectedCategoryId === CATEGORY_ID_NEW) {
      updateCategory(customCategory.trim(), [keyword])
    } else {
      addKeywordToCategory(selectedCategoryId, keyword)
    }
    reclassifyTransactions()

    setSelectedCategoryId(CATEGORY_ID_NEW)
    setCustomCategory('')
    setKeyword('')
    onCancel()
  }

  return (
    <Modal
      title="Quick add category"
      onClose={onCancel}
      footer={
        <>
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!keyword.trim() || (selectedCategoryId === CATEGORY_ID_NEW && !customCategory.trim())}
            form={FORM_NAME}
          >
            Save
          </Button>
        </>
      }
    >
      <form
        id={FORM_NAME}
        onSubmit={(e) => {
          e.preventDefault()
          handleSave()
        }}
      >
        <Select
          id="quick-add-category-select"
          label="Category"
          value={selectedCategoryId}
          onChange={(e) => { console.log(e); setSelectedCategoryId(e.target.value) }}
          autoFocus
        >
          <option value="new">New category</option>
          {Object.entries(categories).map(([id, metadata]) => (
            <option key={id} value={id}>{metadata.name}</option>
          ))}
        </Select>
        {selectedCategoryId === CATEGORY_ID_NEW && (
          <Input
            id="quick-add-custom-category"
            label="New category name"
            type="text"
            value={customCategory}
            onChange={(e) => { setCustomCategory(e.target.value) }}
          />
        )}
        <Input
          id="quick-add-keyword"
          label="Keyword"
          type="text"
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value) }}
        />
      </form>
    </Modal>
  )
}

export { QuickAddCategoryModal }
