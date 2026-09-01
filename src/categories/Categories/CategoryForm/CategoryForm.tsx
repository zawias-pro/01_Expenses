import styles from './CategoryForm.module.css'

const CategoryForm = ({ name, matcher, error, submitLabel, onNameChange, onMatcherChange, onSubmit }: {
  name: string
  matcher: string
  error: string
  submitLabel: string
  onNameChange: (value: string) => void
  onMatcherChange: (value: string) => void
  onSubmit: () => void
}) => (
  <form
    className={styles.form}
    onSubmit={(event) => {
      event.preventDefault()
      onSubmit()
    }}
  >
    <label className={styles.field}>
      <span>Name</span>
      <input type="text" value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Category name" />
    </label>
    <label className={styles.field}>
      <span>Matcher</span>
      <textarea
        value={matcher}
        onChange={(event) => onMatcherChange(event.target.value)}
        placeholder="Globs separated by ; e.g. coffee;TEST-*"
        rows={3}
      />
    </label>
    {error ? <p className={styles.error}>{error}</p> : null}
    <button type="submit">{submitLabel}</button>
  </form>
)

export { CategoryForm }