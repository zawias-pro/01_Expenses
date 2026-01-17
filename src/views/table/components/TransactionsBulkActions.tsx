import { useCategories } from '../../../store/useStore.ts'

type BulkAction = 'delete' | 'exclude' | 'unexclude' | 'setCategory' | null

interface TransactionsBulkActionsProps {
  selectedCount: number
  totalCount: number
  filteredCount: number
  bulkAction: BulkAction
  onBulkActionChange: (action: BulkAction) => void
  bulkCategory: string
  onBulkCategoryChange: (category: string) => void
  onApplyBulkAction: () => void
  onClearSelection: () => void
}

export const TransactionsBulkActions = ({
  selectedCount,
  totalCount,
  filteredCount,
  bulkAction,
  onBulkActionChange,
  bulkCategory,
  onBulkCategoryChange,
  onApplyBulkAction,
  onClearSelection,
}: TransactionsBulkActionsProps) => {
  const categories = useCategories()

  if (selectedCount === 0) {
    return (
      <div style={{ 
        marginBottom: '0.5rem', 
        fontSize: '0.875rem', 
        color: '#666',
      }}>
        <span>Showing {String(filteredCount)} of {String(totalCount)} transactions</span>
      </div>
    )
  }

  return (
    <div style={{ 
      marginBottom: '0.5rem', 
      fontSize: '0.875rem', 
      color: '#666',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '0.5rem'
    }}>
      <span>Showing {String(filteredCount)} of {String(totalCount)} transactions</span>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: '500' }}>{selectedCount} selected</span>
        <select
          className="form-select"
          value={bulkAction || ''}
          onChange={e => {
            const action = e.target.value as BulkAction
            onBulkActionChange(action)
            if (action !== 'setCategory') {
              onBulkCategoryChange('')
            }
          }}
          style={{ fontSize: '0.875rem', padding: '0.375rem' }}
        >
          <option value="">Choose action...</option>
          <option value="exclude">Exclude</option>
          <option value="unexclude">Include</option>
          <option value="setCategory">Set Category</option>
          <option value="delete">Delete</option>
        </select>
        {bulkAction === 'setCategory' && (
          <select
            className="form-select"
            value={bulkCategory}
            onChange={e => { onBulkCategoryChange(e.target.value) }}
            style={{ fontSize: '0.875rem', padding: '0.375rem', minWidth: '150px' }}
          >
            <option value="">Select category...</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
        {bulkAction && (
          <button
            className="btn btn-primary"
            onClick={onApplyBulkAction}
            disabled={bulkAction === 'setCategory' && !bulkCategory}
            style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
          >
            Apply
          </button>
        )}
        <button
          className="btn btn-outline"
          onClick={onClearSelection}
          style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
        >
          Clear
        </button>
      </div>
    </div>
  )
}
