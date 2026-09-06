import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Modal } from '../../components/Modal/Modal.tsx'
import { formatDate } from '../../core/formatDate.ts'
import { db } from '../../db.ts'
import { parseCsv, type ParsedRow } from './parseCsv.ts'
import { presets } from './presets.ts'
import styles from './AddTransactions.module.css'

const getDuplicateRows = async (preview: ParsedRow[]) => {
  const existing = await db.transactions.toArray()
  const existingKeys = new Set(
    existing.map(
      (transaction) => `${transaction.amount}\u0000${transaction.description}\u0000${transaction.date}`,
    ),
  )
  return preview.filter((row) => existingKeys.has(`${row.amount}\u0000${row.description}\u0000${row.date}`))
}

const hasInvalidRows = (preview: ParsedRow[]) => {
  if (preview.some((row) => row.error)) {
    alert('Cannot import: some rows are invalid.')
    return true
  }
  return false
}

const importRows = async (rows: ParsedRow[], accountId: number | null) => {
  const importedAt = Date.now()
  const importId = await db.imports.add({ importedAt, name: null, accountId })
  await db.transactions.bulkAdd(
    rows.map((row) => ({
      description: row.description,
      amount: row.amount as number,
      categoryId: null,
      date: row.date as string,
      importId,
      customDate: null,
      customCategoryId: null,
      comment: null,
      ignored: false,
    })),
  )
}

const AddTransactions = () => {
  const [source, setSource] = useState('')
  const [separator, setSeparator] = useState(';')
  const [descriptionColumn, setDescriptionColumn] = useState(1)
  const [amountColumn, setAmountColumn] = useState(2)
  const [dateColumn, setDateColumn] = useState(3)
  const [invertAmount, setInvertAmount] = useState(false)
  const [accountId, setAccountId] = useState<number | null>(null)
  const [importDecision, setImportDecision] = useState<{ rows: ParsedRow[]; duplicates: ParsedRow[] } | null>(null)

  const rawPreview = parseCsv(source, { delimiter: separator, descriptionColumn, amountColumn, dateColumn })
  const preview = invertAmount
    ? rawPreview.map((row) => (row.amount === null ? row : { ...row, amount: -row.amount }))
    : rawPreview
  const accounts = useLiveQuery(() => db.accounts.toArray(), [], [])

  const handleImport = async () => {
    if (hasInvalidRows(preview)) {
      return
    }

    const duplicates = await getDuplicateRows(preview)
    if (duplicates.length > 0) {
      setImportDecision({ rows: preview, duplicates })
      return
    }

    await importRows(preview, accountId)
    setSource('')
  }

  const handleImportAll = async () => {
    if (!importDecision) {
      return
    }
    await importRows(importDecision.rows, accountId)
    setImportDecision(null)
    setSource('')
  }

  const handleSkipDuplicates = async () => {
    if (!importDecision) {
      return
    }
    const duplicateKeys = new Set(
      importDecision.duplicates.map((row) => `${row.amount}\u0000${row.description}\u0000${row.date}`),
    )
    const remainingSource = importDecision.duplicates.map((row) => row.line).join('\n')
    await importRows(
      importDecision.rows.filter((row) => !duplicateKeys.has(`${row.amount}\u0000${row.description}\u0000${row.date}`)),
      accountId,
    )
    setImportDecision(null)
    setSource(remainingSource)
  }

  return (
    <div className={styles.layout}>
      <section className={styles.top}>
        <textarea
          className={styles.textarea}
          value={source}
          onChange={(event) => setSource(event.target.value)}
          placeholder="Paste CSV here"
          rows={10}
        />
        <div className={styles.options}>
          <label className={styles.option}>
            <span>CSV separator</span>
            <input
              type="text"
              value={separator}
              onChange={(event) => setSeparator(event.target.value)}
            />
          </label>
          <label className={styles.option}>
            <span>Description column</span>
            <input
              type="number"
              min={1}
              value={descriptionColumn}
              onChange={(event) => setDescriptionColumn(Number(event.target.value))}
            />
          </label>
          <label className={styles.option}>
            <span>Amount column</span>
            <input
              type="number"
              min={1}
              value={amountColumn}
              onChange={(event) => setAmountColumn(Number(event.target.value))}
            />
          </label>
          <label className={styles.option}>
            <span>Date column</span>
            <input
              type="number"
              min={1}
              value={dateColumn}
              onChange={(event) => setDateColumn(Number(event.target.value))}
            />
          </label>
          <label className={styles.option}>
            <span>Invert amount</span>
            <input
              type="checkbox"
              checked={invertAmount}
              onChange={(event) => setInvertAmount(event.target.checked)}
            />
          </label>
          <div className={styles.presets}>
            <span>Presets</span>
            {presets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setSource(preset.source)}
              >
                Fill with {preset.name}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.bottom}>
        <div className={styles.preview}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {preview.length === 0 ? (
                <tr>
                  <td className={styles.empty} colSpan={3}>
                    No rows
                  </td>
                </tr>
              ) : (
                preview.map((row, index) => (
                  <tr
                    key={index}
                    className={row.error ? styles.invalidRow : undefined}
                  >
                    <td>{row.date !== null ? formatDate(row.date) : ''}</td>
                    <td>{row.amount}</td>
                    <td>{row.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <label className={styles.accountRow}>
          <span>Account</span>
          <select
            value={accountId ?? ''}
            onChange={(event) => setAccountId(event.target.value === '' ? null : Number(event.target.value))}
          >
            <option value="">No account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className={styles.importButton} onClick={handleImport}>
          Import
        </button>
      </section>
      {importDecision ? (
        <Modal title="Duplicate transactions" onClose={() => setImportDecision(null)}>
          <p>The following {importDecision.duplicates.length} row(s) already exist:</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {importDecision.duplicates.map((row, index) => (
                <tr key={index}>
                  <td>{row.description}</td>
                  <td>{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.modalActions}>
            <button type="button" onClick={handleSkipDuplicates}>
              Skip duplicates
            </button>
            <button type="button" onClick={handleImportAll}>
              Import all
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

export { AddTransactions }