import { useState } from 'react'
import { getCategoryNameFromId, useCategoryMetadata } from '../../../store/useStore.ts'
import { Button } from '../../../components/Button/Button.tsx'
import { Input } from '../../../components/Input/Input.tsx'

interface CategoryRowProps {
  id: string
  name: string
  keywords: string[]
  count: number
  isCustom: boolean
  editingCategory: string | null
  editingKeywords: string
  onEditingCategoryChange: (id: string | null) => void
  onEditingKeywordsChange: (value: string) => void
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
  editingCategory,
  editingKeywords,
  onEditingCategoryChange,
  onEditingKeywordsChange,
  onUpdateCategory,
  onRemoveCategory,
  onRenameCategory,
}: CategoryRowProps) => {
  const categoryMetadata = useCategoryMetadata()
  const [isRenaming, setIsRenaming] = useState(false)
  const [renamingCategoryName, setRenamingCategoryName] = useState('')

  const isEditing = editingCategory === id

  const handleStartEdit = () => {
    onEditingCategoryChange(id)
    onEditingKeywordsChange(keywords.join(', '))
  }

  const handleSaveEdit = () => {
    const categoryName = getCategoryNameFromId(id, categoryMetadata)
    const keywordsArray = editingKeywords.split(',').map(k => k.trim()).filter(k => k)
    onUpdateCategory(categoryName, keywordsArray)
    onEditingCategoryChange(null)
    onEditingKeywordsChange('')
  }

  const handleCancelEdit = () => {
    onEditingCategoryChange(null)
    onEditingKeywordsChange('')
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
      <td>
        {isRenaming ? (
          <Input
            id={`category-row-rename-${id}`}
            label={'Name'}
            type="text"
            value={renamingCategoryName}
            onChange={e => { setRenamingCategoryName(e.target.value) }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSaveRename()
              } else if (e.key === 'Escape') {
                handleCancelRename()
              }
            }}
            autoFocus
          />
        ) : (
          <strong>{name}</strong>
        )}
      </td>
      <td>
        <code style={{ 
          fontSize: '0.75rem', 
          fontFamily: 'monospace',
          color: '#666',
          backgroundColor: '#f5f5f5',
          padding: '2px 6px',
          borderRadius: '3px'
        }}>
          {id}
        </code>
      </td>
      <td>
        <span style={{ color: '#666' }}>
          {count}
        </span>
      </td>
      <td>
        {isEditing ? (
          <Input
            id={`category-row-keywords-${id}`}
            label={'Keywords'}
            type="text"
            value={editingKeywords}
            onChange={e => { onEditingKeywordsChange(e.target.value) }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSaveEdit()
              } else if (e.key === 'Escape') {
                handleCancelEdit()
              }
            }}
            autoFocus
          />
        ) : (
          <span>{keywords.join(', ')}</span>
        )}
      </td>
      <td>
        {isEditing ? (
          <div>
            <Button
              onClick={handleSaveEdit}
            >
              Save
            </Button>
            <Button
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
          </div>
        ) : isRenaming ? (
          <div>
            <Button
              onClick={handleSaveRename}
              disabled={!renamingCategoryName.trim()}
            >
              Save
            </Button>
            <Button
              onClick={handleCancelRename}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div>
            <Button
              onClick={handleStartEdit}
            >
              Edit
            </Button>
            <Button
              onClick={handleStartRename}
            >
              Rename
            </Button>
            {isCustom && (
              <Button
                variant="danger"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
                onClick={() => { onRemoveCategory(name) }}
              >
                Remove
              </Button>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}

export { CategoryRow }
