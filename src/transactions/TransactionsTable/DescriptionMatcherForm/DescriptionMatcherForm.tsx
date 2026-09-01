import { useState } from 'react'
import type { Category } from '../../../categories/Category.ts'
import styles from './DescriptionMatcherForm.module.css'

const DescriptionMatcherForm = ({ pattern, categoryName, categories, onSave, onClose }: {
  pattern: string
  categoryName: string
  categories: Category[]
  onSave: (target: { categoryId: number } | { newName: string }, pattern: string) => Promise<string>
  onClose: () => void
}) => {
  const [draftPattern, setDraftPattern] = useState(pattern)
  const [selected, setSelected] = useState<string>('new')
  const [draftName, setDraftName] = useState(categoryName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    const trimmedPattern = draftPattern.trim()
    if (trimmedPattern === '') {
      setError('Pattern is empty')
      return
    }
    setSaving(true)
    if (selected === 'new') {
      const name = draftName.trim()
      if (name === '') {
        setSaving(false)
        setError('Category name is empty')
        return
      }
      const err = await onSave({ newName: name }, trimmedPattern)
      if (err) {
        setSaving(false)
        setError(err)
        return
      }
    } else {
      const err = await onSave({ categoryId: Number(selected) }, trimmedPattern)
      if (err) {
        setSaving(false)
        setError(err)
        return
      }
    }
    setSaving(false)
    onClose()
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        void save()
      }}
    >
      <label className={styles.field}>
        <span>Pattern</span>
        <input type="text" value={draftPattern} onChange={(event) => setDraftPattern(event.target.value)} />
      </label>
      <label className={styles.field}>
        <span>Category</span>
        <select value={selected} onChange={(event) => setSelected(event.target.value)}>
          <option value="new">New category</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      {selected === 'new' ? (
        <label className={styles.field}>
          <span>Category name</span>
          <input type="text" value={draftName} onChange={(event) => setDraftName(event.target.value)} />
        </label>
      ) : null}
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.actions}>
        <button type="button" onClick={onClose}>
          Discard
        </button>
        <button type="submit" disabled={saving}>
          Save
        </button>
      </div>
    </form>
  )
}

export { DescriptionMatcherForm }