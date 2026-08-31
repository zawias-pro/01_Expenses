import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAppStore } from '../../appStore.ts'
import { db } from '../../db.ts'
import type { Transaction } from '../../transactions/Transaction.ts'
import styles from './Imports.module.css'

type ImportGroup = {
  importName: string | null
  importedAt: number
  transactions: Transaction[]
}

const groupTransactions = (transactions: Transaction[]): ImportGroup[] => {
  const byKey = new Map<string, ImportGroup>()
  for (const transaction of transactions) {
    const key = `${transaction.importName ?? ''}\u0000${transaction.importedAt}`
    const existing = byKey.get(key)
    if (existing) {
      existing.transactions.push(transaction)
    } else {
      byKey.set(key, {
        importName: transaction.importName ?? null,
        importedAt: transaction.importedAt,
        transactions: [transaction],
      })
    }
  }
  return [...byKey.values()].sort((a, b) => b.importedAt - a.importedAt)
}

const importLabel = (importName: string | null) => importName ?? 'Unnamed import'

const Imports = () => {
  const transactions = useLiveQuery(() => db.transactions.toArray(), [], [])
  const focusImport = useAppStore((state) => state.focusImport)

  const groups = useMemo(() => groupTransactions(transactions), [transactions])

  return (
    <div className={styles.layout}>
      <h2>Imports</h2>
      {groups.length === 0 ? (
        <p>No imports</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Imported at</th>
              <th>Transactions</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={`${group.importName}\u0000${group.importedAt}`}>
                <td>{importLabel(group.importName)}</td>
                <td>{new Date(group.importedAt).toLocaleString()}</td>
                <td>{group.transactions.length}</td>
                <td>
                  <button type="button" onClick={() => focusImport(group.importedAt)}>
                    Focus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export { Imports }