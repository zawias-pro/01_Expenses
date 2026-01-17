import { useStore, getCategoryNameFromId, useCategoryMetadata } from '../../../store/useStore.ts'

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

  return (
    <div className="modal-overlay" onClick={() => { setShowExportModal(false) }}>
      <div className="modal" onClick={e => { e.stopPropagation() }}>
        <div className="modal-header">
          <h3 className="modal-title">Export Categories</h3>
          <button
            className="modal-close"
            onClick={() => { setShowExportModal(false) }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <p style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            All categories in export format (keyword;category):
          </p>
          <textarea
            className="form-textarea modal-textarea"
            value={exportRules()}
            readOnly
            onClick={e => { (e.target as HTMLTextAreaElement).select() }}
          />
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-outline"
            onClick={() => { setShowExportModal(false) }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export { ExportCategoriesModal }
