import { useState } from 'react'
import styles from './ImportedAtFilterForm.module.css'

type ImportedAtFilter = {
  from: string
  to: string
}

const ImportedAtFilterForm = ({ filter, onApply, onClose }: {
  filter: ImportedAtFilter
  onApply: (filter: ImportedAtFilter) => void
  onClose: () => void
}) => {
  const [draftFrom, setDraftFrom] = useState(filter.from)
  const [draftTo, setDraftTo] = useState(filter.to)

  const apply = () => {
    onApply({ from: draftFrom, to: draftTo })
    onClose()
  }

  const clear = () => {
    setDraftFrom('')
    setDraftTo('')
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
        <span>From</span>
        <input
          type="datetime-local"
          value={draftFrom}
          onChange={(event) => setDraftFrom(event.target.value)}
        />
      </label>
      <label className={styles.field}>
        <span>To</span>
        <input
          type="datetime-local"
          value={draftTo}
          onChange={(event) => setDraftTo(event.target.value)}
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

export type { ImportedAtFilter }
export { ImportedAtFilterForm }