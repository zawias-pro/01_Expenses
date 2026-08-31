import { useState } from 'react'
import styles from './AmountFilterForm.module.css'

type AmountFilter = {
  min: string
  max: string
}

const AmountFilterForm = ({ filter, onApply, onClose }: {
  filter: AmountFilter
  onApply: (filter: AmountFilter) => void
  onClose: () => void
}) => {
  const [draftMin, setDraftMin] = useState(filter.min)
  const [draftMax, setDraftMax] = useState(filter.max)

  const apply = () => {
    onApply({ min: draftMin.trim(), max: draftMax.trim() })
    onClose()
  }

  const clear = () => {
    onApply({ min: '', max: '' })
    onClose()
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        apply()
      }}
    >
      <label className={styles.field}>
        <span>Min amount</span>
        <input
          type="number"
          value={draftMin}
          onChange={(event) => setDraftMin(event.target.value)}
        />
      </label>
      <label className={styles.field}>
        <span>Max amount</span>
        <input
          type="number"
          value={draftMax}
          onChange={(event) => setDraftMax(event.target.value)}
        />
      </label>
      <div className={styles.actions}>
        <button type="button" onClick={clear}>
          Clear
        </button>
        <button type="submit">Apply</button>
      </div>
    </form>
  )
}

export type { AmountFilter }
export { AmountFilterForm }