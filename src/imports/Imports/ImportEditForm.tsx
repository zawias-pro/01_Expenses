import { useState } from 'react'
import type { Account } from '../../accounts/Account.ts'
import type { ImportRecord } from '../Import.ts'
import { db } from '../../db.ts'
import styles from './ImportEditForm.module.css'

const ImportEditForm = ({ importRecord, accounts, onClose }: {
  importRecord: ImportRecord
  accounts: Account[]
  onClose: () => void
}) => {
  const [name, setName] = useState(importRecord.name ?? '')
  const [accountId, setAccountId] = useState(
    importRecord.accountId === null ? '' : String(importRecord.accountId),
  )
  const [error, setError] = useState('')

  const apply = async () => {
    const trimmed = name.trim()
    if (trimmed !== '') {
      const normalized = trimmed.toLowerCase()
      const existing = await db.imports.toArray()
      const clash = existing.some(
        (existingImport) =>
          existingImport.id !== importRecord.id &&
          existingImport.name !== null &&
          existingImport.name.trim().toLowerCase() === normalized,
      )
      if (clash) {
        setError(`Import name "${trimmed}" already exists`)
        return
      }
    }
    await db.imports.update(importRecord.id, {
      name: trimmed === '' ? null : trimmed,
      accountId: accountId === '' ? null : Number(accountId),
    })
    onClose()
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        void apply()
      }}
    >
      <label className={styles.field}>
        <span>Name</span>
        <input
          type="text"
          maxLength={1000}
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setError('')
          }}
          placeholder="Unnamed import"
        />
      </label>
      <label className={styles.field}>
        <span>Account</span>
        <select value={accountId} onChange={(event) => setAccountId(event.target.value)}>
          <option value="">No account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </label>
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.actions}>
        <button type="submit">Save</button>
      </div>
    </form>
  )
}

export { ImportEditForm }