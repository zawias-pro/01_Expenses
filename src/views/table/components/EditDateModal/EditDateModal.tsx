import { useStore } from '../../../../store/useStore.ts'
import { useState } from 'react'
import { Modal } from '../../../../components/Modal/Modal.tsx'
import { Button } from '../../../../components/Button/Button.tsx'
import type { Transaction } from "../../../../parsing/types.ts"
import { Input } from "../../../../components/Input/Input.tsx"

const EditDateModal = ({
  transaction,
  onClose
}: {
  transaction: Transaction
  onClose: () => void
}) => {
  const updateTransactionDate = useStore((s) => s.updateTransactionDate)
  const [date, setDate] = useState(transaction.date)

  const handleSave = () => {
    updateTransactionDate(transaction.id, date)
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
      <Input
        placeholder={'YYYY-MM-DD'}
        type='text'
        id="edit-transaction-comment"
        label="Date"
        value={date}
        onChange={e => {
          setDate(e.target.value)
        }}
      />
    </Modal>
  )
}

export { EditDateModal }
