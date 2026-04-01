import { useStore } from '../../../../store/useStore.ts'
import { useState } from 'react'
import { Modal } from '../../../../components/Modal/Modal.tsx'
import { Button } from '../../../../components/Button/Button.tsx'
import { Textarea } from '../../../../components/Textarea/Textarea.tsx'
import type { Transaction } from "../../../../parsing/types.ts"

const EditCommentModal = ({
  transaction,
  onClose
}: {
  transaction: Transaction
  onClose: () => void
}) => {
  const updateTransactionComment = useStore((s) => s.updateTransactionComment)
  const [comment, setComment] = useState(transaction.comment ?? '')

  const handleSave = () => {
    updateTransactionComment(transaction.id, comment)
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
      <Textarea
        id="edit-transaction-comment"
        label="Comment"
        value={comment}
        onChange={e => {
          setComment(e.target.value)
        }}
        rows={4}
      />
    </Modal>
  )
}

export { EditCommentModal }
