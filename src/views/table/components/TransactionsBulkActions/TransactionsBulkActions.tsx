import { useCategories } from '../../../../store/useStore.ts'
import { Button } from '../../../../components/Button/Button.tsx'
import { Select } from '../../../../components/Select/Select.tsx'
import { FormGroup } from '../../../../components/FormGroup/FormGroup.tsx'

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
    <>
    <div>
      <span>Showing {String(filteredCount)} of {String(totalCount)} transactions</span>
      <div>
        <span>{selectedCount} selected</span>
      </div>
    </div>
    <div>
      <FormGroup>
        <div>
        <Select
          id={'bulk-action'}
          label={'Action'}
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
        </Select>
        {bulkAction === 'setCategory' && (
          <Select
            label={'Category'}
            id={'category'}
            value={bulkCategory}
            onChange={e => { onBulkCategoryChange(e.target.value) }}
          >
            <option value="">Select category...</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        )}
        </div>
      </FormGroup>
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
    </>
  )
}

export { TransactionsBulkActions }
