import { useState } from 'react'

const Categories = ({
  rules,
  baseRules,
  customRules,
  onAddRule,
  onRemoveRule
}: {
  rules: Record<string, string>
  baseRules: Record<string, string>
  customRules: Record<string, string>
  onAddRule: (keyword: string, category: string) => void
  onRemoveRule: (keyword: string) => void
}) => {
  const [newKeyword, setNewKeyword] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)

  const handleAddRuleClick = () => {
    if (newKeyword.trim() && newCategory.trim()) {
      onAddRule(newKeyword.trim(), newCategory.trim())
      setNewKeyword('')
      setNewCategory('')
    }
  }

  const isBaseRule = (keyword: string) => keyword in baseRules
  const isCustomRule = (keyword: string) => keyword in customRules

  const exportRules = (): string => {
    // Sort rules alphabetically by keyword
    const sortedRules = Object.entries(rules).sort(([a], [b]) => a.localeCompare(b))
    return sortedRules.map(([pattern, category]) => `${pattern};${category}`).join('\n')
  }

  const handleCopyToClipboard = () => {
    const text = exportRules()
    navigator.clipboard.writeText(text).then(() => {
      alert('Categories copied to clipboard!')
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      alert('Categories copied to clipboard!')
    })
  }

  return (
    <>
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="section-header" style={{ margin: 0 }}>Custom Categories</h2>
          <button
            className="btn btn-outline"
            onClick={() => { setShowExportModal(true) }}
          >
            Export
          </button>
        </div>
      
      <div>
        <h3 className="section-subheader">Expense Categories</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Keyword</th>
                <th>Category</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(rules)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([keyword, category]) => (
                <tr key={keyword}>
                  <td><strong>{keyword}</strong></td>
                  <td>{category}</td>
                  <td>
                    {isBaseRule(keyword) ? (
                      <span className="status-badge" style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>
                        Built-in
                      </span>
                    ) : (
                      <span className="status-badge status-warning">Custom</span>
                    )}
                  </td>
                  <td>
                    {isCustomRule(keyword) && (
                      <button 
                        className="btn btn-danger"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                        onClick={() => { onRemoveRule(keyword) }}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--surface-hover)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h4 className="section-subheader" style={{ marginTop: 0 }}>Add New Rule</h4>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
              <label className="form-label">Keyword</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., 'netflix'"
                value={newKeyword}
                onChange={e => { setNewKeyword(e.target.value) }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleAddRuleClick()
                  }
                }}
              />
            </div>
            <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., 'entertainment'"
                value={newCategory}
                onChange={e => { setNewCategory(e.target.value) }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleAddRuleClick()
                  }
                }}
              />
            </div>
            <div>
              <button
                className="btn btn-primary"
                onClick={handleAddRuleClick}
                disabled={!newKeyword.trim() || !newCategory.trim()}
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {showExportModal && (
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
                All categories (built-in + custom) in export format:
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
                className="btn btn-primary"
                onClick={handleCopyToClipboard}
              >
                Copy to Clipboard
              </button>
              <button
                className="btn btn-outline"
                onClick={() => { setShowExportModal(false) }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export { Categories }
