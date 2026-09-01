import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAppStore } from '../../appStore.ts'
import { Modal } from '../../components/Modal/Modal.tsx'
import { formatDateTime } from '../../core/formatDateTime.ts'
import { db } from '../../db.ts'
import type { Account } from '../../accounts/Account.ts'
import type { ImportRecord } from '../Import.ts'
import { ImportEditForm } from './ImportEditForm.tsx'
import styles from './Imports.module.css'

const importLabel = (name: string | null) => name ?? 'Unnamed import'

const accountName = (accountId: number | null, accounts: Account[]) => {
  if (accountId === null) {
    return 'No account'
  }
  const account = accounts.find((account) => account.id === accountId)
  if (!account) {
    throw new Error(`Import references unknown account ${accountId}`)
  }
  return account.name
}

const Imports = () => {
  const data = useLiveQuery(
    async () => {
      const [imports, transactions, accounts] = await Promise.all([
        db.imports.toArray(),
        db.transactions.toArray(),
        db.accounts.toArray(),
      ])
      return { imports, transactions, accounts }
    },
    [],
    { imports: [] as ImportRecord[], transactions: [], accounts: [] as Account[] },
  )

  const focusImport = useAppStore((state) => state.focusImport)
  const [editing, setEditing] = useState<ImportRecord | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState<ImportRecord | null>(null)

  const counts = new Map<number, number>()
  for (const transaction of data.transactions) {
    counts.set(transaction.importId, (counts.get(transaction.importId) ?? 0) + 1)
  }

  const sorted = [...data.imports].sort((a, b) => b.importedAt - a.importedAt)

  const handleDelete = async () => {
    if (!confirmingDelete) {
      return
    }
    await db.imports.delete(confirmingDelete.id)
    setConfirmingDelete(null)
  }

  return (
    <div className={styles.layout}>
      <h2>Imports</h2>
      {sorted.length === 0 ? (
        <p>No imports</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Imported at</th>
              <th>Transactions</th>
              <th>Account</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((importRecord) => (
              <tr key={importRecord.id}>
                <td>{importRecord.id}</td>
                <td>{importLabel(importRecord.name)}</td>
                <td>{formatDateTime(importRecord.importedAt)}</td>
                <td>{counts.get(importRecord.id) ?? 0}</td>
                <td>{accountName(importRecord.accountId, data.accounts)}</td>
                <td className={styles.actions}>
                  <button type="button" onClick={() => focusImport(importRecord.importedAt)}>
                    Focus
                  </button>
                  <button type="button" onClick={() => setEditing(importRecord)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={(counts.get(importRecord.id) ?? 0) > 0}
                    onClick={() => setConfirmingDelete(importRecord)}
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
        <Modal title="Edit import" onClose={() => setEditing(null)}>
          <ImportEditForm
            importRecord={editing}
            accounts={data.accounts}
            onClose={() => setEditing(null)}
          />
        </Modal>
      ) : null}
      {confirmingDelete ? (
        <Modal title="Delete import" onClose={() => setConfirmingDelete(null)}>
          <p>Delete import "{importLabel(confirmingDelete.name)}"?</p>
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

export { Imports }