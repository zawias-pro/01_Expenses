import { useStore, getCategoryNameFromId, useCategoryMetadata } from '../../../store/useStore.ts'
import { Modal } from '../../../components/Modal/Modal.tsx'
import { Button } from '../../../components/Button/Button.tsx'
import { Textarea } from "../../../components/Textarea/Textarea.tsx"

interface ExportCategoriesModalProps {
  rules: Record<string, string[]>
}

const ExportCategoriesModal = ({ rules }: ExportCategoriesModalProps) => {
  const categoryMetadata = useCategoryMetadata()
  const setShowExportModal = useStore((state) => state.setShowExportModal)

  const exportRules = (): string => {
    const lines: string[] = []
    for (const [categoryId, keywords] of Object.entries(rules)) {
      const categoryName = getCategoryNameFromId(categoryId, categoryMetadata)
      const keywordsStr = keywords.join(',')
      lines.push(`${categoryName};${keywordsStr}`)
    }
    return lines.sort().join('\n')
  }

  const handleClose = () => { setShowExportModal(false) }

  return (
    <Modal
      title="Export Categories"
      onClose={handleClose}
      footer={
        <Button onClick={handleClose}>
          Close
        </Button>
      }
    >
      <p>
        All categories in CSV format (categoryname;keyword1,keyword2,keyword3):
      </p>
      <Textarea
        label={'Categories'}
        value={exportRules()}
        readOnly
        onClick={e => { (e.target as HTMLTextAreaElement).select() }}
        style={{ minHeight: '300px', fontFamily: 'Courier New, monospace' }}
      />
    </Modal>
  )
}

export { ExportCategoriesModal }
