import { useStore } from '../../../store/useStore.ts'
import { Checkbox } from '../../../components/Checkbox/Checkbox.tsx'
import { Input } from '../../../components/Input/Input.tsx'
import styles from './CategoryProcessingControls.module.css'
import { FormGroup } from "../../../components/FormGroup/FormGroup.tsx"

const CategoryProcessingControls = () => {
  const treatLowValueAsOthers = useStore((state) => state.treatLowValueAsOthers)
  const lowValueThreshold = useStore((state) => state.lowValueThreshold)
  const mergeSmallCategories = useStore((state) => state.mergeSmallCategories)
  const categoryThresholdPercent = useStore((state) => state.categoryThresholdPercent)

  const setTreatLowValueAsOthers = useStore((state) => state.setTreatLowValueAsOthers)
  const setLowValueThreshold = useStore((state) => state.setLowValueThreshold)
  const setMergeSmallCategories = useStore((state) => state.setMergeSmallCategories)
  const setCategoryThresholdPercent = useStore((state) => state.setCategoryThresholdPercent)

  return (
    <>
        <div>
        <Checkbox
          label='Treat low-value expenses as "others"'
          checked={treatLowValueAsOthers}
          onChange={e => { setTreatLowValueAsOthers(e.target.checked) }}
        />
        {treatLowValueAsOthers && (
          <Input
            label={'Threshold'}
            id="low-value-threshold"
            type="number"
            style={{ width: '120px', marginBottom: 0 }}
            min="0"
            step="0.01"
            value={lowValueThreshold}
            onChange={e => { setLowValueThreshold(parseFloat(e.target.value) || 0) }}
          />
        )}
        </div>

      <div>
        <Checkbox
          label='Merge small categories into "others"'
          checked={mergeSmallCategories}
          onChange={e => { setMergeSmallCategories(e.target.checked) }}
        />
        {mergeSmallCategories && (
          <Input
            label={'Threshold'}
            id="category-threshold"
            type="number"
            style={{ width: '120px', marginBottom: 0 }}
            min="0"
            max="100"
            step="0.1"
            value={categoryThresholdPercent}
            onChange={e => { setCategoryThresholdPercent(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))) }}
          />
        )}
      </div>
    </>
  )
}

export { CategoryProcessingControls }
