import { useStore } from '../../../store/useStore.ts'

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
      <h4 className="section-subheader" style={{ marginTop: 0, marginBottom: '1rem' }}>Add New Category</h4>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8125rem' }}>Category</label>
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
            style={{ padding: '0.5rem', fontSize: '0.875rem' }}
          />
        </div>
        <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8125rem' }}>Keywords (comma-separated)</label>
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
            style={{ padding: '0.5rem', fontSize: '0.875rem' }}
          />
        </div>
        <div>
          <button
            className="btn btn-primary"
            onClick={handleAddCategory}
            disabled={!newCategory.trim() || !newKeywords.trim()}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  )
}

export { AddCategoryForm }
