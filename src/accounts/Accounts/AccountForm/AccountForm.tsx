import styles from './AccountForm.module.css'

const AccountForm = ({ name, error, submitLabel, onNameChange, onSubmit }: {
  name: string
  error: string
  submitLabel: string
  onNameChange: (value: string) => void
  onSubmit: () => void
}) => (
  <form
    className={styles.form}
    onSubmit={(event) => {
      event.preventDefault()
      onSubmit()
    }}
  >
    <label className={styles.nameField}>
      <span>Name</span>
      <input
        type="text"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Account name"
      />
    </label>
    {error ? <p className={styles.error}>{error}</p> : null}
    <button type="submit">{submitLabel}</button>
  </form>
)

export { AccountForm }