import { useStore } from '../../../../store/useStore.ts'
import { useState } from 'react'
import { Modal } from '../../../../components/Modal/Modal.tsx'
import { Button } from '../../../../components/Button/Button.tsx'
import type { Transaction } from "../../../../parsing/types.ts"
import { Select } from "../../../../components/Select/Select.tsx"

const EditCategoryModal = ({
  transaction,
  onClose
}: {
  transaction: Transaction
  onClose: () => void
}) => {
  const categoryMetadata = useStore((s) => s.categoryMetadata)
  const updateTransactionCategory = useStore((s) => s.updateTransactionCategory)
  const [category, setCategory] = useState(transaction.category ?? '')

  const handleSave = () => {
    updateTransactionCategory(transaction.id, category)
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
      <Select
        id="EditCategoryModal-category"
        label="Category"
        value={category}
        onChange={e => {
          setCategory(e.target.value)
        }}
      >
        <option value={undefined}>
          no category
        </option>
        {Object.entries(categoryMetadata).map(([id,name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </Select>
    </Modal>
  )
}

export { EditCategoryModal }
