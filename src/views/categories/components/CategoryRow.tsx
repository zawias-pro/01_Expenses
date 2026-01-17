import { useState } from 'react'
import { useStore, getCategoryNameFromId, useCategoryMetadata } from '../../../store/useStore.ts'

interface CategoryRowProps {
  id: string
  name: string
  keywords: string[]
  count: number
  isCustom: boolean
  onUpdateCategory: (categoryName: string, keywords: string[]) => void
  onRemoveCategory: (categoryName: string) => void
  onRenameCategory: (oldName: string, newName: string) => void
}

const CategoryRow = ({
  id,
  name,
  keywords,
  count,
  isCustom,
  onUpdateCategory,
  onRemoveCategory,
  onRenameCategory
}: CategoryRowProps) => {
  const categoryMetadata = useCategoryMetadata()
  const editingCategory = useStore((state) => state.editingCategory)
  const editingKeywords = useStore((state) => state.editingKeywords)
  const setEditingCategory = useStore((state) => state.setEditingCategory)
  const setEditingKeywords = useStore((state) => state.setEditingKeywords)

  const [isRenaming, setIsRenaming] = useState(false)
  const [renamingCategoryName, setRenamingCategoryName] = useState('')

  const isEditing = editingCategory === id

  const handleStartEdit = () => {
    setEditingCategory(id)
    setEditingKeywords(keywords.join(', '))
  }

  const handleSaveEdit = () => {
    const categoryName = getCategoryNameFromId(id, categoryMetadata)
    const keywordsArray = editingKeywords.split(',').map(k => k.trim()).filter(k => k)
    onUpdateCategory(categoryName, keywordsArray)
    setEditingCategory(null)
    setEditingKeywords('')
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditingKeywords('')
  }

  const handleStartRename = () => {
    setIsRenaming(true)
    setRenamingCategoryName(name)
  }

  const handleSaveRename = () => {
    if (renamingCategoryName.trim()) {
      const oldName = name
      const newName = renamingCategoryName.trim()
      
      const existingNames = Object.values(categoryMetadata)
      if (existingNames.includes(newName) && oldName !== newName) {
        alert(`Category "${newName}" already exists. Please choose a different name.`)
        return
      }
      
      if (oldName !== newName) {
        onRenameCategory(oldName, newName)
      }
      setIsRenaming(false)
    }
  }

  const handleCancelRename = () => {
    setIsRenaming(false)
    setRenamingCategoryName('')
  }

  return (
    <tr>
      <td style={{ padding: '0.5rem 1rem' }}>
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
            style={{ width: '100%', fontWeight: 'bold', padding: '0.25rem 0.5rem' }}
            autoFocus
          />
        ) : (
          <strong>{name}</strong>
        )}
      </td>
      <td style={{ padding: '0.5rem 1rem' }}>
        <span style={{ color: '#666', fontSize: '0.875rem' }}>
          {count}
        </span>
      </td>
      <td style={{ padding: '0.5rem 1rem' }}>
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
            style={{ width: '100%', padding: '0.25rem 0.5rem' }}
            autoFocus
          />
        ) : (
          <span>{keywords.join(', ')}</span>
        )}
      </td>
      <td style={{ padding: '0.5rem 1rem' }}>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
              onClick={handleSaveEdit}
            >
              Save
            </button>
            <button
              className="btn btn-outline"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </div>
        ) : isRenaming ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
              onClick={handleSaveRename}
              disabled={!renamingCategoryName.trim()}
            >
              Save
            </button>
            <button
              className="btn btn-outline"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
              onClick={handleCancelRename}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-outline"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
              onClick={handleStartEdit}
            >
              Edit
            </button>
            <button
              className="btn btn-outline"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
              onClick={handleStartRename}
            >
              Rename
            </button>
            {isCustom && (
              <button
                className="btn btn-danger"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
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
}

export { CategoryRow }
