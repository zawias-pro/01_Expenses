import { useStore } from '../../../store/useStore.ts'
import { Checkbox } from '../../../components/Checkbox/Checkbox.tsx'
import { Input } from '../../../components/Input/Input.tsx'
import styles from './CategoryProcessingControls.module.css'

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
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Low-value threshold controls */}
      <div className="filter-controls" style={{ marginBottom: '0.75rem' }}>
        <Checkbox
          label='Treat low-value expenses as "others"'
          checked={treatLowValueAsOthers}
          onChange={e => { setTreatLowValueAsOthers(e.target.checked) }}
        />
        {treatLowValueAsOthers && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="low-value-threshold" className={styles.formLabel} style={{ margin: 0 }}>
              Threshold:
            </label>
            <Input
              id="low-value-threshold"
              type="number"
              style={{ width: '120px', marginBottom: 0 }}
              min="0"
              step="0.01"
              value={lowValueThreshold}
              onChange={e => { setLowValueThreshold(parseFloat(e.target.value) || 0) }}
            />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>PLN</span>
          </div>
        )}
      </div>
      
      {/* Category percentage threshold controls */}
      <div className="filter-controls">
        <Checkbox
          label='Merge small categories into "others"'
          checked={mergeSmallCategories}
          onChange={e => { setMergeSmallCategories(e.target.checked) }}
        />
        {mergeSmallCategories && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="category-threshold" className={styles.formLabel} style={{ margin: 0 }}>
              Category threshold:
            </label>
            <Input
              id="category-threshold"
              type="number"
              style={{ width: '120px', marginBottom: 0 }}
              min="0"
              max="100"
              step="0.1"
              value={categoryThresholdPercent}
              onChange={e => { setCategoryThresholdPercent(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))) }}
            />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>%</span>
          </div>
        )}
      </div>
    </div>
  )
}

export { CategoryProcessingControls }
