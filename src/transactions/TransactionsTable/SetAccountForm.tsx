import { useState } from 'react'
import type { Account } from '../../accounts/Account.ts'
import styles from './SetAccountForm.module.css'

const SetAccountForm = ({ accounts, currentAccountId, onApply, onClose }: {
  accounts: Account[]
  currentAccountId: number | null
  onApply: (accountId: number | null) => void
  onClose: () => void
}) => {
  const [selection, setSelection] = useState<string>(currentAccountId === null ? '' : String(currentAccountId))

  const apply = () => {
    onApply(selection === '' ? null : Number(selection))
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
        <span>Account</span>
        <select value={selection} onChange={(event) => setSelection(event.target.value)}>
          <option value="">No account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.actions}>
        <button type="submit">Apply</button>
      </div>
    </form>
  )
}

export { SetAccountForm }