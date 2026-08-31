import { useState } from 'react'
import styles from './DescriptionFilterForm.module.css'

const DescriptionFilterForm = ({ value, onApply, onClose }: {
  value: string
  onApply: (value: string) => void
  onClose: () => void
}) => {
  const [draft, setDraft] = useState(value)

  const apply = () => {
    onApply(draft.trim())
    onClose()
  }

  const clear = () => {
    setDraft('')
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
        <span>Keyword</span>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="e.g. TEST-*"
        />
      </label>
      <p className={styles.hint}>Supports glob patterns: * matches anything, ? matches one character.</p>
      <div className={styles.actions}>
        <button type="button" onClick={clear}>
          Clear
        </button>
        <button type="submit">Apply</button>
      </div>
    </form>
  )
}

export { DescriptionFilterForm }