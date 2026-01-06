import { useState } from 'react'

const Categories = ({
  rules,
  customRules,
  onUpdateCategory,
  onRemoveCategory
}: {
  rules: Record<string, string[]>
  customRules: Record<string, string[]>
  onUpdateCategory: (category: string, keywords: string[]) => void
  onRemoveCategory: (category: string) => void
}) => {
  const [showExportModal, setShowExportModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingKeywords, setEditingKeywords] = useState<string>('')
  const [newCategory, setNewCategory] = useState('')
  const [newKeywords, setNewKeywords] = useState('')

  const handleStartEdit = (category: string, keywords: string[]) => {
    setEditingCategory(category)
    setEditingKeywords(keywords.join(', '))
  }

  const handleSaveEdit = () => {
    if (editingCategory) {
      const keywordsArray = editingKeywords.split(',').map(k => k.trim()).filter(k => k)
      onUpdateCategory(editingCategory, keywordsArray)
      setEditingCategory(null)
      setEditingKeywords('')
    }
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditingKeywords('')
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && newKeywords.trim()) {
      const keywordsArray = newKeywords.split(',').map(k => k.trim()).filter(k => k)
      onUpdateCategory(newCategory.trim(), keywordsArray)
      setNewCategory('')
      setNewKeywords('')
    }
  }

  const exportRules = (): string => {
    // Export in format: keyword;category (one line per keyword)
    const lines: string[] = []
    for (const [category, keywords] of Object.entries(rules)) {
      for (const keyword of keywords) {
        lines.push(`${keyword};${category}`)
      }
    }
    return lines.sort().join('\n')
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

  const categoryNames = Object.keys(rules).sort()

  return (
    <>
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="section-header" style={{ margin: 0 }}>Categories</h2>
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
                  <th>Category</th>
                  <th>Keywords</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categoryNames.map(category => {
                  const keywords = rules[category] || []
                  const isEditing = editingCategory === category
                  const isCustom = category in customRules
                  
                  return (
                    <tr key={category}>
                      <td><strong>{category}</strong></td>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-input"
                            value={editingKeywords}
                            onChange={e => { setEditingKeywords(e.target.value) }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                handleSaveEdit()
                              } else if (e.key === 'Escape') {
                                handleCancelEdit()
                              }
                            }}
                            style={{ width: '100%' }}
                            autoFocus
                          />
                        ) : (
                          <span>{keywords.join(', ')}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                              onClick={handleSaveEdit}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                              onClick={() => { handleStartEdit(category, keywords) }}
                            >
                              Edit
                            </button>
                            {isCustom && (
                              <button
                                className="btn btn-danger"
                                style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                                onClick={() => { onRemoveCategory(category) }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--surface-hover)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h4 className="section-subheader" style={{ marginTop: 0 }}>Add New Category</h4>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
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
                      handleAddCategory()
                    }
                  }}
                />
              </div>
              <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
                <label className="form-label">Keywords (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., 'netflix, spotify, hbo'"
                  value={newKeywords}
                  onChange={e => { setNewKeywords(e.target.value) }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleAddCategory()
                    }
                  }}
                />
              </div>
              <div>
                <button
                  className="btn btn-primary"
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim() || !newKeywords.trim()}
                >
                  Add Category
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
