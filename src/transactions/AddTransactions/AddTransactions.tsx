import { useState } from 'react'
import { Modal } from '../../components/Modal/Modal.tsx'
import { db } from '../../db.ts'
import { parseCsv, type ParsedRow } from './parseCsv.ts'
import { presets } from './presets.ts'
import styles from './AddTransactions.module.css'

const getDuplicateRows = async (preview: ParsedRow[]) => {
  const existing = await db.transactions.toArray()
  const existingKeys = new Set(existing.map((transaction) => `${transaction.amount}\u0000${transaction.description}`))
  return preview.filter((row) => existingKeys.has(`${row.amount}\u0000${row.description}`))
}

const hasInvalidRows = (preview: ParsedRow[]) => {
  if (preview.some((row) => row.error)) {
    alert('Cannot import: some rows are invalid.')
    return true
  }
  return false
}

const importRows = async (rows: ParsedRow[]) => {
  const importedAt = Date.now()
  await db.transactions.bulkAdd(
    rows.map((row) => ({
      description: row.description,
      amount: row.amount as number,
      categoryId: null,
      importedAt,
    })),
  )
}

const AddTransactions = () => {
  const [source, setSource] = useState('')
  const [separator, setSeparator] = useState(';')
  const [descriptionColumn, setDescriptionColumn] = useState(1)
  const [amountColumn, setAmountColumn] = useState(2)
  const [importDecision, setImportDecision] = useState<{ rows: ParsedRow[]; duplicates: ParsedRow[] } | null>(null)

  const preview = parseCsv(source, { delimiter: separator, descriptionColumn, amountColumn })

  const handleImport = async () => {
    if (hasInvalidRows(preview)) {
      return
    }

    const duplicates = await getDuplicateRows(preview)
    if (duplicates.length > 0) {
      setImportDecision({ rows: preview, duplicates })
      return
    }

    await importRows(preview)
    setSource('')
  }

  const handleImportAll = async () => {
    if (!importDecision) {
      return
    }
    await importRows(importDecision.rows)
    setImportDecision(null)
    setSource('')
  }

  const handleSkipDuplicates = async () => {
    if (!importDecision) {
      return
    }
    const duplicateKeys = new Set(importDecision.duplicates.map((row) => `${row.amount}\u0000${row.description}`))
    const remainingSource = importDecision.duplicates.map((row) => row.line).join('\n')
    await importRows(importDecision.rows.filter((row) => !duplicateKeys.has(`${row.amount}\u0000${row.description}`)))
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
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {preview.length === 0 ? (
                <tr>
                  <td className={styles.empty} colSpan={2}>
                    No rows
                  </td>
                </tr>
) : (
                preview.map((row, index) => (
                  <tr
                    key={index}
                    className={row.error ? styles.invalidRow : undefined}
                  >
                    <td>{row.description}</td>
                    <td>{row.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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