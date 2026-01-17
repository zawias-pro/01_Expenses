import { useState } from 'react'
import { useStore, useCategoryMetadata, getCategoryNameFromId } from '../../store/useStore.ts'

const Categories = ({
  rules,
  customRules,
  onUpdateCategory,
  onRemoveCategory,
  onRenameCategory
}: {
  rules: Record<string, string[]> // category ID -> keywords
  customRules: Record<string, string[]> // category ID -> keywords
  onUpdateCategory: (categoryName: string, keywords: string[]) => void
  onRemoveCategory: (categoryName: string) => void
  onRenameCategory: (oldName: string, newName: string) => void
}) => {
  // Store state
  const categoryMetadata = useCategoryMetadata()
  const transactions = useStore((state) => state.transactions)
  const showExportModal = useStore((state) => state.showExportModal)
  const editingCategory = useStore((state) => state.editingCategory) // category ID
  const editingKeywords = useStore((state) => state.editingKeywords)
  const newCategory = useStore((state) => state.newCategory) // category name
  const newKeywords = useStore((state) => state.newKeywords)
  
  // Local state for renaming
  const [renamingCategoryId, setRenamingCategoryId] = useState<string | null>(null)
  const [renamingCategoryName, setRenamingCategoryName] = useState<string>('')
  
  // Store actions
  const setShowExportModal = useStore((state) => state.setShowExportModal)
  const setEditingCategory = useStore((state) => state.setEditingCategory)
  const setEditingKeywords = useStore((state) => state.setEditingKeywords)
  const setNewCategory = useStore((state) => state.setNewCategory)
  const setNewKeywords = useStore((state) => state.setNewKeywords)

  const handleStartEdit = (categoryId: string, keywords: string[]) => {
    setEditingCategory(categoryId)
    setEditingKeywords(keywords.join(', '))
  }

  const handleSaveEdit = () => {
    if (editingCategory) {
      const categoryName = getCategoryNameFromId(editingCategory, categoryMetadata)
      const keywordsArray = editingKeywords.split(',').map(k => k.trim()).filter(k => k)
      onUpdateCategory(categoryName, keywordsArray)
      setEditingCategory(null)
      setEditingKeywords('')
    }
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditingKeywords('')
  }

  const handleStartRename = (categoryId: string, categoryName: string) => {
    setRenamingCategoryId(categoryId)
    setRenamingCategoryName(categoryName)
  }

  const handleSaveRename = () => {
    if (renamingCategoryId && renamingCategoryName.trim()) {
      const oldName = getCategoryNameFromId(renamingCategoryId, categoryMetadata)
      const newName = renamingCategoryName.trim()
      
      // Check if the new name already exists (and is not the same as the old name)
      const existingNames = Object.values(categoryMetadata)
      if (existingNames.includes(newName) && oldName !== newName) {
        alert(`Category "${newName}" already exists. Please choose a different name.`)
        return
      }
      
      if (oldName !== newName) {
        onRenameCategory(oldName, newName)
      }
      setRenamingCategoryId(null)
      setRenamingCategoryName('')
    }
  }

  const handleCancelRename = () => {
    setRenamingCategoryId(null)
    setRenamingCategoryName('')
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
    // Export uses category names, not IDs
    const lines: string[] = []
    for (const [categoryId, keywords] of Object.entries(rules)) {
      const categoryName = getCategoryNameFromId(categoryId, categoryMetadata)
      for (const keyword of keywords) {
        lines.push(`${keyword};${categoryName}`)
      }
    }
    return lines.sort().join('\n')
  }

  // Get category entries sorted by name
  const categoryEntries = Object.entries(rules)
    .map(([categoryId, keywords]) => {
      const count = transactions.filter(t => t.category === categoryId).length
      return {
        id: categoryId,
        name: getCategoryNameFromId(categoryId, categoryMetadata),
        keywords,
        count
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

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
                {categoryEntries.map(({ id, name, keywords, count }) => {
                  const isEditing = editingCategory === id
                  const isRenaming = renamingCategoryId === id
                  const isCustom = id in customRules
                  
                  return (
                    <tr key={id}>
                      <td>
                        {isRenaming ? (
                          <input
                            type="text"
                            className="form-input"
                            value={renamingCategoryName}
                            onChange={e => { setRenamingCategoryName(e.target.value) }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                handleSaveRename()
                              } else if (e.key === 'Escape') {
                                handleCancelRename()
                              }
                            }}
                            style={{ width: '100%', fontWeight: 'bold' }}
                            autoFocus
                          />
                        ) : (
                          <>
                            <strong>{name}</strong>
                            <span style={{ marginLeft: '0.5rem', color: '#666', fontSize: '0.875rem' }}>
                              ({count})
                            </span>
                          </>
                        )}
                      </td>
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
                        ) : isRenaming ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                              onClick={handleSaveRename}
                              disabled={!renamingCategoryName.trim()}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                              onClick={handleCancelRename}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                              onClick={() => { handleStartEdit(id, keywords) }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                              onClick={() => { handleStartRename(id, name) }}
                            >
                              Rename
                            </button>
                            {isCustom && (
                              <button
                                className="btn btn-danger"
                                style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                                onClick={() => { onRemoveCategory(name) }}
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
