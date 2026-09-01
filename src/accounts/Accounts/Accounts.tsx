import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Modal } from '../../components/Modal/Modal.tsx'
import { db } from '../../db.ts'
import type { Account } from '../Account.ts'
import { AccountEditForm } from './AccountEditForm/AccountEditForm.tsx'
import { AccountForm } from './AccountForm/AccountForm.tsx'
import styles from './Accounts.module.css'

const accountExists = async (rawName: string, excludeId?: number) => {
  const existing = await db.accounts.toArray()
  const name = rawName.trim()
  const normalized = name.toLowerCase()
  return existing.some(
    (account) => account.id !== excludeId && account.name.toLowerCase() === normalized,
  )
}

const Accounts = () => {
  const data = useLiveQuery(
    async () => {
      const [accounts, imports] = await Promise.all([
        db.accounts.toArray(),
        db.imports.toArray(),
      ])
      return { accounts, imports }
    },
    [],
    { accounts: [] as Account[], imports: [] },
  )

  const [name, setName] = useState('')
  const [addError, setAddError] = useState('')
  const [editing, setEditing] = useState<Account | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState<Account | null>(null)

  const importCounts = new Map<number, number>()
  for (const importRecord of data.imports) {
    if (importRecord.accountId !== null) {
      importCounts.set(importRecord.accountId, (importCounts.get(importRecord.accountId) ?? 0) + 1)
    }
  }

  const handleAdd = async () => {
    const trimmed = name.trim()
    if (trimmed === '') {
      setAddError('Account name is empty')
      return
    }
    if (trimmed.length > 1000) {
      setAddError('Account name is too long (max 1000 characters)')
      return
    }
    if (await accountExists(trimmed)) {
      setAddError('Account with this name already exists')
      return
    }
    await db.accounts.add({ name: trimmed })
    setName('')
    setAddError('')
  }

  const handleDelete = async () => {
    if (!confirmingDelete) {
      return
    }
    await db.accounts.delete(confirmingDelete.id)
    setConfirmingDelete(null)
  }

  return (
    <div className={styles.layout}>
      <AccountForm
        name={name}
        error={addError}
        submitLabel="Add"
        onNameChange={(value) => {
          setName(value)
          setAddError('')
        }}
        onSubmit={() => void handleAdd()}
      />
      {data.accounts.length === 0 ? (
        <p className={styles.empty}>No accounts</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Imports</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.accounts.map((account) => (
              <tr key={account.id}>
                <td>{account.id}</td>
                <td>{account.name}</td>
                <td>{importCounts.get(account.id) ?? 0}</td>
                <td className={styles.actions}>
                  <button type="button" onClick={() => setEditing(account)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={(importCounts.get(account.id) ?? 0) > 0}
                    onClick={() => setConfirmingDelete(account)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editing ? (
        <Modal title="Edit account" onClose={() => setEditing(null)}>
          <AccountEditForm account={editing} onClose={() => setEditing(null)} />
        </Modal>
      ) : null}
      {confirmingDelete ? (
        <Modal title="Delete account" onClose={() => setConfirmingDelete(null)}>
          <p>Delete account "{confirmingDelete.name}"?</p>
          <div className={styles.modalActions}>
            <button type="button" onClick={() => setConfirmingDelete(null)}>
              No
            </button>
            <button type="button" onClick={() => void handleDelete()}>
              Yes, delete
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

export { Accounts }