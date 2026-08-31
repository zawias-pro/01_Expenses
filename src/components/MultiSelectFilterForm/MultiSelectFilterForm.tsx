import { useState } from 'react'
import styles from './MultiSelectFilterForm.module.css'

const MultiSelectFilterForm = ({ options, selection, onApply, onClose }: {
  options: { value: string; label: string }[]
  selection: Set<string>
  onApply: (selection: Set<string>) => void
  onClose: () => void
}) => {
  const [draft, setDraft] = useState<Set<string>>(() => new Set(selection))

  const toggle = (value: string) => {
    setDraft((prev) => {
      const next = new Set(prev)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return next
    })
  }

  const apply = () => {
    onApply(draft)
    onClose()
  }

  const clear = () => {
    setDraft(new Set())
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        apply()
      }}
    >
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="checkbox"
              checked={draft.has(option.value)}
              onChange={() => toggle(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={clear}>
          Clear
        </button>
        <button type="submit">Apply</button>
      </div>
    </form>
  )
}

export { MultiSelectFilterForm }