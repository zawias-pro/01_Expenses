import { useState } from 'react'
import { getCategoryNameFromId, useCategoryMetadata, useStore } from '../../../store/useStore.ts'
import { Button } from '../../../components/Button/Button.tsx'
import { Input } from '../../../components/Input/Input.tsx'

const CategoryRow = ({
  id,
  name,
  keywords,
  count,
}: {
  id: string
  name: string
  keywords: string[]
  count: number
}) => {
  const onUpdateCategory = useStore((state) => state.updateCategory)
  const onRemoveCategory = useStore((state) => state.removeCategory)
  const onRenameCategory = useStore((state) => state.renameCategory)
  const categoryMetadata = useCategoryMetadata()
  const [isRenaming, setIsRenaming] = useState(false)
  const [renamingCategoryName, setRenamingCategoryName] = useState('')
  const [editingCategory, onEditingCategoryChange] = useState<string | null>(null)
  const [editingKeywords, onEditingKeywordsChange] = useState('')

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
    const oldName = name
    const newName = renamingCategoryName.trim()
    const existingNames = Object.values(categoryMetadata)
    if (existingNames.includes(newName) && oldName !== newName) {
      alert(`Category "${newName}" already exists. Please choose a different name.`)
      return
    }
    onRenameCategory(oldName, newName)
    setIsRenaming(false)
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
        <code>{id}</code>
      </td>
      <td>
        {count}
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
          keywords.map(k => (
            <div key={k}>
              {k}
            </div>
          ))
        )}
      </td>
      <td>
        {isEditing&&<Button onClick={handleSaveEdit}>Save</Button>}
        {isEditing&&<Button onClick={handleCancelEdit}>Cancel</Button>}
        {isRenaming&&<Button onClick={handleSaveRename} disabled={!renamingCategoryName.trim()}>Save</Button>}
        {isRenaming&&<Button onClick={handleCancelRename}>Cancel</Button>}
        {!isEditing&&!isRenaming&&<Button onClick={handleStartEdit}>Edit</Button>}
        {!isEditing&&!isRenaming&&<Button onClick={handleStartRename}>Rename</Button>}
        {!isEditing&&!isRenaming&&<Button variant="danger" onClick={() => { onRemoveCategory(name) }}>Remove</Button>}
      </td>
    </tr>
  )
}

export { CategoryRow }
