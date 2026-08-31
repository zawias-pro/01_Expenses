import { useState } from 'react'
import { parseCsv } from './parseCsv.ts'
import { presets } from './presets.ts'
import styles from './AddTransactions.module.css'

const AddTransactions = () => {
  const [source, setSource] = useState('')
  const [separator, setSeparator] = useState(';')
  const [descriptionColumn, setDescriptionColumn] = useState(1)
  const [amountColumn, setAmountColumn] = useState(2)

  const preview = parseCsv(source, { delimiter: separator, descriptionColumn, amountColumn })

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
                  <tr key={index}>
                    <td>{row.description}</td>
                    <td>{row.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <button type="button" className={styles.importButton}>
          Import
        </button>
      </section>
    </div>
  )
}

export { AddTransactions }