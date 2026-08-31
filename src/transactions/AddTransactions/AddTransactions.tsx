import { useState } from 'react'
import { db } from '../../db.ts'
import { parseCsv, type ParsedRow } from './parseCsv.ts'
import { presets } from './presets.ts'
import styles from './AddTransactions.module.css'

const importRows = async (preview: ParsedRow[]) => {
  const invalid = preview.find((row) => row.error)
  if (invalid) {
    alert('Cannot import: some rows are invalid.')
    return false
  }

  const existing = await db.transactions.toArray()
  const existingKeys = new Set(existing.map((transaction) => `${transaction.amount}\u0000${transaction.description}`))

  const duplicateRows = preview.filter((row) => existingKeys.has(`${row.amount}\u0000${row.description}`))

  let rowsToImport = preview
  if (duplicateRows.length > 0) {
    const includeDuplicates = confirm(`Found ${duplicateRows.length} duplicate transaction(s). Import them anyway?`)
    if (!includeDuplicates) {
      rowsToImport = preview.filter((row) => !existingKeys.has(`${row.amount}\u0000${row.description}`))
    }
  }

  const importedAt = Date.now()
  await db.transactions.bulkAdd(
    rowsToImport.map((row) => ({
      description: row.description,
      amount: row.amount as number,
      categoryId: null,
      importedAt,
    })),
  )
  return true
}

const AddTransactions = () => {
  const [source, setSource] = useState('')
  const [separator, setSeparator] = useState(';')
  const [descriptionColumn, setDescriptionColumn] = useState(1)
  const [amountColumn, setAmountColumn] = useState(2)

  const preview = parseCsv(source, { delimiter: separator, descriptionColumn, amountColumn })

  const handleImport = async () => {
    if (await importRows(preview)) {
      setSource('')
    }
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
    </div>
  )
}

export { AddTransactions }