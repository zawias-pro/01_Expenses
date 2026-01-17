import { useStore, useCategories, useCategoryMetadata, getCategoryNameFromId, getCategoryIdFromName } from '../../../store/useStore.ts'

interface EditTransactionModalProps {
  transactionId: string | null
  date: string
  category: string
  comment: string
  excluded: boolean
  onDateChange: (date: string) => void
  onCategoryChange: (category: string) => void
  onCommentChange: (comment: string) => void
  onExcludedChange: (excluded: boolean) => void
  onSave: () => void
  onCancel: () => void
}

export const EditTransactionModal = ({
  transactionId,
  date,
  category,
  comment,
  excluded,
  onDateChange,
  onCategoryChange,
  onCommentChange,
  onExcludedChange,
  onSave,
  onCancel,
}: EditTransactionModalProps) => {
  const categories = useCategories()
  const categoryMetadata = useCategoryMetadata()
  const othersCategoryId = getCategoryIdFromName('others', categoryMetadata) || ''

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
          Edit Transaction
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Date:
            </label>
            <input
              type="text"
              className="form-input"
              value={date}
              onChange={e => { onDateChange(e.target.value) }}
              placeholder="YYYY-MM-DD"
              style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Category:
            </label>
            <select
              className="form-select"
              value={getCategoryNameFromId(category || othersCategoryId, categoryMetadata)}
              onChange={e => {
                const categoryName = e.target.value
                const categoryId = getCategoryIdFromName(categoryName, categoryMetadata)
                onCategoryChange(categoryId || othersCategoryId)
              }}
              style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Comment:
            </label>
            <textarea
              className="form-input"
              value={comment}
              onChange={e => { onCommentChange(e.target.value) }}
              placeholder="Enter a comment for this transaction..."
              rows={4}
              style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                className="form-checkbox"
                checked={excluded}
                onChange={e => { onExcludedChange(e.target.checked) }}
                style={{ width: '16px', height: '16px' }}
              />
              Exclude from calculations
            </label>
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
