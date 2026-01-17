import { useStore, getCategoryNameFromId, useCategoryMetadata } from '../../../store/useStore.ts'
import { Modal } from '../../../components/Modal/Modal.tsx'
import { Button } from '../../../components/Button/Button.tsx'
import { TextArea } from '../../../components/Input/Input.tsx'

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
      for (const keyword of keywords) {
        lines.push(`${keyword};${categoryName}`)
      }
    }
    return lines.sort().join('\n')
  }

  const handleClose = () => { setShowExportModal(false) }

  return (
    <Modal
      title="Export Categories"
      onClose={handleClose}
      footer={
        <Button variant="outline" onClick={handleClose}>
          Close
        </Button>
      }
    >
      <p style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
        All categories in export format (keyword;category):
      </p>
      <TextArea
        value={exportRules()}
        readOnly
        onClick={e => { (e.target as HTMLTextAreaElement).select() }}
        style={{ minHeight: '300px', fontFamily: 'Courier New, monospace' }}
      />
    </Modal>
  )
}

export { ExportCategoriesModal }
