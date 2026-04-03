import { getCategoryNameFromId, useAllRules, useCategoryMetadata } from '../../../store/useStore.ts'
import { Modal } from '../../../components/Modal/Modal.tsx'
import { Button } from '../../../components/Button/Button.tsx'
import { Textarea } from "../../../components/Textarea/Textarea.tsx"

const ExportCategoriesModal = ({
  onClose
}: {
  onClose: () => void
}) => {
  const categoryMetadata = useCategoryMetadata()
  const rules = useAllRules()

  const exportRules = (): string => {
    const lines: string[] = []
    for (const [categoryId, keywords] of Object.entries(rules)) {
      const categoryName = getCategoryNameFromId(categoryId, categoryMetadata)
      const keywordsStr = keywords.join(',')
      lines.push(`${categoryName};${keywordsStr}`)
    }
    return lines.sort().join('\n')
  }

  return (
    <Modal
      title="Export Categories"
      onClose={onClose}
      footer={
        <Button onClick={onClose}>
          Close
        </Button>
      }
    >
      <Textarea
        id="export-categories"
        label={'Categories'}
        value={exportRules()}
        readOnly
        onClick={e => { (e.target as HTMLTextAreaElement).select() }}
        rows={10}
      />
    </Modal>
  )
}

export { ExportCategoriesModal }
