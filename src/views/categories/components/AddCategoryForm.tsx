import { useStore } from '../../../store/useStore.ts'
import { Button } from '../../../components/Button/Button.tsx'
import { Input } from '../../../components/Input/Input.tsx'
import { SectionHeader } from '../../../components/SectionHeader/SectionHeader.tsx'

interface AddCategoryFormProps {
  onUpdateCategory: (categoryName: string, keywords: string[]) => void
}

const AddCategoryForm = ({ onUpdateCategory }: AddCategoryFormProps) => {
  const newCategory = useStore((state) => state.newCategory)
  const newKeywords = useStore((state) => state.newKeywords)
  const setNewCategory = useStore((state) => state.setNewCategory)
  const setNewKeywords = useStore((state) => state.setNewKeywords)

  const handleAddCategory = () => {
    if (newCategory.trim() && newKeywords.trim()) {
      const keywordsArray = newKeywords.split(',').map(k => k.trim()).filter(k => k)
      onUpdateCategory(newCategory.trim(), keywordsArray)
      setNewCategory('')
      setNewKeywords('')
    }
  }

  return (
    <div style={{ marginBottom: '2rem', padding: '1.25rem', backgroundColor: 'var(--surface-hover)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
      <SectionHeader>Add New Category</SectionHeader>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <Input
            label="Category"
            type="text"
            placeholder="e.g., 'entertainment'"
            value={newCategory}
            onChange={e => { setNewCategory(e.target.value) }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleAddCategory()
              }
            }}
            style={{ padding: '0.5rem', fontSize: '0.875rem' }}
          />
        </div>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <Input
            label="Keywords (comma-separated)"
            type="text"
            placeholder="e.g., 'netflix, spotify, hbo'"
            value={newKeywords}
            onChange={e => { setNewKeywords(e.target.value) }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleAddCategory()
              }
            }}
            style={{ padding: '0.5rem', fontSize: '0.875rem' }}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <Button
            onClick={handleAddCategory}
            disabled={!newCategory.trim() || !newKeywords.trim()}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            Add Category
          </Button>
        </div>
      </div>
    </div>
  )
}

export { AddCategoryForm }
