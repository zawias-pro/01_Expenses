import { useStore, useCategories, getOrCreateCategoryId, useCategoryMetadata } from '../../../store/useStore.ts'

interface QuickAddCategoryModalProps {
  transactionId: string | null
  selectedCategory: string
  customCategory: string
  keyword: string
  onSelectedCategoryChange: (category: string) => void
  onCustomCategoryChange: (category: string) => void
  onKeywordChange: (keyword: string) => void
  onSave: () => void
  onCancel: () => void
}

export const QuickAddCategoryModal = ({
  transactionId,
  selectedCategory,
  customCategory,
  keyword,
  onSelectedCategoryChange,
  onCustomCategoryChange,
  onKeywordChange,
  onSave,
  onCancel,
}: QuickAddCategoryModalProps) => {
  const categories = useCategories()

  if (!transactionId) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        minWidth: '400px',
        maxWidth: '90%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem' }}>
          Quick Add Category
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Category:
            </label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={e => { onSelectedCategoryChange(e.target.value) }}
              style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem' }}
            >
              <option value="new">New category</option>
              {categories.filter(cat => cat !== 'others').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {selectedCategory === 'new' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>
                Custom Category Name:
              </label>
              <input
                type="text"
                className="form-input"
                value={customCategory}
                onChange={e => { onCustomCategoryChange(e.target.value) }}
                placeholder="Enter category name"
                style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem' }}
              />
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Keyword (comma-separated):
            </label>
            <input
              type="text"
              className="form-input"
              value={keyword}
              onChange={e => { onKeywordChange(e.target.value) }}
              placeholder="Enter keywords"
              style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              className="btn btn-outline"
              onClick={onCancel}
              style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={onSave}
              disabled={!keyword.trim() || (selectedCategory === 'new' && !customCategory.trim())}
              style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
