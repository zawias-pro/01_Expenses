import { Checkbox } from '../../../components/Checkbox/Checkbox.tsx'
import { Input } from '../../../components/Input/Input.tsx'

const CategoryProcessingControls = ({
  treatLowValueAsOthers,
  lowValueThreshold,
  mergeSmallCategories,
  categoryThresholdPercent,
  onTreatLowValueAsOthersChange,
  onLowValueThresholdChange,
  onMergeSmallCategoriesChange,
  onCategoryThresholdPercentChange,
}: {
  treatLowValueAsOthers: boolean
  lowValueThreshold: number
  mergeSmallCategories: boolean
  categoryThresholdPercent: number
  onTreatLowValueAsOthersChange: (value: boolean) => void
  onLowValueThresholdChange: (value: number) => void
  onMergeSmallCategoriesChange: (value: boolean) => void
  onCategoryThresholdPercentChange: (value: number) => void
}) => {
  return (
    <>
      <div>
        <Checkbox
          label='Treat low-value expenses as uncategorized'
          checked={treatLowValueAsOthers}
          onChange={e => { onTreatLowValueAsOthersChange(e.target.checked) }}
        />
        {treatLowValueAsOthers && (
          <Input
            label={'Threshold'}
            id="low-value-threshold"
            type="number"
            min="0"
            step="0.01"
            value={lowValueThreshold}
            onChange={e => { onLowValueThresholdChange(parseFloat(e.target.value) || 0) }}
          />
        )}
      </div>

      <div>
        <Checkbox
          label='Merge small categories into uncategorized'
          checked={mergeSmallCategories}
          onChange={e => { onMergeSmallCategoriesChange(e.target.checked) }}
        />
        {mergeSmallCategories && (
          <Input
            label={'Threshold'}
            id="category-threshold"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={categoryThresholdPercent}
            onChange={e => { onCategoryThresholdPercentChange(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))) }}
          />
        )}
      </div>
    </>
  )
}

export { CategoryProcessingControls }
