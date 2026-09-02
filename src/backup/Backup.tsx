import { useRef, useState } from 'react'
import { db } from '../db.ts'
import styles from './Backup.module.css'

const Backup = () => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [showImport, setShowImport] = useState(false)
  const [status, setStatus] = useState('')

  const handleExport = async () => {
    const [transactions, categories, accounts, imports] = await Promise.all([
      db.transactions.toArray(),
      db.categories.toArray(),
      db.accounts.toArray(),
      db.imports.toArray(),
    ])
    const data = {
      transactions,
      categories,
      accounts,
      imports,
      exportedAt: new Date().toISOString(),
      version: db.verno,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setStatus('Exported')
  }

  const handleImportClick = () => {
    setShowImport(true)
    setStatus('')
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await db.transaction('rw', db.transactions, db.categories, db.accounts, db.imports, async () => {
        await db.transactions.clear()
        await db.categories.clear()
        await db.accounts.clear()
        await db.imports.clear()
        await db.categories.bulkAdd(data.categories)
        await db.accounts.bulkAdd(data.accounts)
        await db.imports.bulkAdd(data.imports)
        await db.transactions.bulkAdd(data.transactions)
      })
      setStatus(`Imported ${data.transactions.length} transactions, ${data.categories.length} categories`)
      setShowImport(false)
      if (fileRef.current) {
        fileRef.current.value = ''
      }
    } catch (error) {
      setStatus(`Import failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className={styles.layout}>
      <h2>Backup</h2>
      <div className={styles.actions}>
        <button type="button" onClick={() => void handleExport()}>
          Export to file
        </button>
        <button type="button" onClick={handleImportClick}>
          Import from file
        </button>
      </div>
      {showImport ? (
        <div className={styles.importSection}>
          <p>Select backup file to import (will replace current data):</p>
          <input ref={fileRef} type="file" accept=".json,application/json" onChange={(e) => void handleFileChange(e)} />
          <button type="button" onClick={() => setShowImport(false)}>
            Cancel
          </button>
        </div>
      ) : null}
      {status ? <p className={styles.status}>{status}</p> : null}
    </div>
  )
}

export { Backup }
