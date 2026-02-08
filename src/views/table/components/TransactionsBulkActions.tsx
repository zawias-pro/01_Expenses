import { useCategories } from '../../../store/useStore.ts'
import styles from './TransactionsBulkActions.module.css'
import { Button } from "../../../components/Button/Button.tsx"

type BulkAction = 'delete' | 'exclude' | 'unexclude' | 'setCategory' | null

const TransactionsBulkActions = ({
  selectedCount,
  totalCount,
  filteredCount,
  bulkAction,
  onBulkActionChange,
  bulkCategory,
  onBulkCategoryChange,
  onApplyBulkAction,
  onClearSelection,
}: {
  selectedCount: number
  totalCount: number
  filteredCount: number
  bulkAction: BulkAction
  onBulkActionChange: (action: BulkAction) => void
  bulkCategory: string
  onBulkCategoryChange: (category: string) => void
  onApplyBulkAction: () => void
  onClearSelection: () => void
}) => {
  const categories = useCategories()

  return (
    <div>
      <span>Showing {String(filteredCount)} of {String(totalCount)} transactions</span>
      <div>
        <span className={styles.selectedText}>{selectedCount} selected</span>
        <select
          className={styles.select}
          value={bulkAction || ''}
          onChange={e => {
            const action = e.target.value as BulkAction
            onBulkActionChange(action)
            if (action !== 'setCategory') {
              onBulkCategoryChange('')
            }
          }}
        >
          <option value="">Choose action...</option>
          <option value="exclude">Exclude</option>
          <option value="unexclude">Include</option>
          <option value="setCategory">Set Category</option>
          <option value="delete">Delete</option>
        </select>
        {bulkAction === 'setCategory' && (
          <select
            className={styles.select}
            value={bulkCategory}
            onChange={e => { onBulkCategoryChange(e.target.value) }}
            style={{ minWidth: '150px' }}
          >
            <option value="">Select category...</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
        {bulkAction && (
          <Button
            onClick={onApplyBulkAction}
            disabled={bulkAction === 'setCategory' && !bulkCategory}
          >
            Apply
          </Button>
        )}
        <Button onClick={onClearSelection}>
          Clear
        </Button>
      </div>
    </div>
  )
}

export { TransactionsBulkActions }
