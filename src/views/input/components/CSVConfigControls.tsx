import { useStore } from '../../../store/useStore.ts'
import { Input } from '../../../components/Input/Input.tsx'
import { Select } from '../../../components/Select/Select.tsx'
import styles from './CSVConfigControls.module.css'

const CSVConfigControls = () => {
  const delimiter = useStore((state) => state.delimiter)
  const dateIndex = useStore((state) => state.dateIndex)
  const descriptionIndex = useStore((state) => state.descriptionIndex)
  const amountIndex = useStore((state) => state.amountIndex)
  const setDelimiter = useStore((state) => state.setDelimiter)
  const setDateIndex = useStore((state) => state.setDateIndex)
  const setDescriptionIndex = useStore((state) => state.setDescriptionIndex)
  const setAmountIndex = useStore((state) => state.setAmountIndex)

  return (
    <div className={styles.formGroup}>
      <div className={styles.formGroupRow}>
        <div className={styles.formGroup}>
          <Select
            id="delimiter-select"
            label="CSV Delimiter:"
            value={delimiter}
            onChange={e => { setDelimiter(e.target.value) }}
            style={{ marginBottom: 0 }}
          >
            <option value=";">Semicolon (;)</option>
            <option value=",">Comma (,)</option>
            <option value="\t">Tab</option>
            <option value="|">Pipe (|)</option>
          </Select>
        </div>
        <div className={styles.formGroupSmall}>
          <Input
            id="date-index"
            label="Date Column:"
            type="number"
            value={dateIndex}
            onChange={e => { setDateIndex(parseInt(e.target.value) || 0) }}
            min="0"
            style={{ marginBottom: 0 }}
          />
        </div>
        <div className={styles.formGroupSmall}>
          <Input
            id="description-index"
            label="Description Column:"
            type="number"
            value={descriptionIndex}
            onChange={e => { setDescriptionIndex(parseInt(e.target.value) || 0) }}
            min="0"
            style={{ marginBottom: 0 }}
          />
        </div>
        <div className={styles.formGroupSmall}>
          <Input
            id="amount-index"
            label="Amount Column:"
            type="number"
            value={amountIndex}
            onChange={e => { setAmountIndex(parseInt(e.target.value) || 0) }}
            min="0"
            style={{ marginBottom: 0 }}
          />
        </div>
      </div>
    </div>
  )
}

export { CSVConfigControls }
