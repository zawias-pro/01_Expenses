import { parseCSVLine } from '../parsing/calculations.ts'
import type { Transaction } from '../parsing/calculations.ts'

interface Step1Props {
  csvContent: string
  delimiter: string
  onCsvChange: (content: string) => void
  onDelimiterChange: (delimiter: string) => void
  onFillExample: () => void
  onNext: () => void
}

function Step1({ csvContent, delimiter, onCsvChange, onDelimiterChange, onFillExample, onNext }: Step1Props) {
  // Parse preview transactions from first 3 rows
  const getPreviewTransactions = (): Transaction[] => {
    if (!csvContent.trim()) return []

    const lines = csvContent.split('\n').filter(line => line.trim())
    return lines.slice(0, 3).map(line => parseCSVLine(line, delimiter))
  }

  const previewTransactions = getPreviewTransactions()

  return (
    <div>
      <h2>Step 1: Paste CSV Content</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="delimiter-select" style={{ marginRight: '0.5rem' }}>
          CSV Delimiter:
        </label>
        <select
          id="delimiter-select"
          value={delimiter}
          onChange={e => onDelimiterChange(e.target.value)}
          style={{ marginRight: '1rem' }}
        >
          <option value=";">Semicolon (;)</option>
          <option value=",">Comma (,)</option>
          <option value="\t">Tab</option>
          <option value="|">Pipe (|)</option>
        </select>
      </div>

      <textarea
        value={csvContent}
        onChange={e => onCsvChange(e.target.value)}
        rows={10}
        style={{ width: '100%', fontFamily: 'monospace' }}
        placeholder="Paste your CSV data here..."
      />

      {previewTransactions.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Preview (first 3 rows):</h3>
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #ddd',
            marginBottom: '1rem'
          }}>
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Exclude</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Account</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {previewTransactions.map(t => (
                  <tr key={t.id} className={`${t.excluded ? 'excluded-row' : ''} ${!t.isValid ? 'invalid-row' : ''}`}>
                    <td>
                      <input
                        type="checkbox"
                        checked={t.excluded}
                        disabled
                        readOnly
                      />
                    </td>
                    <td>{t.date}</td>
                    <td>{t.description}</td>
                    <td>{t.account}</td>
                    <td>{t.category}</td>
                    <td>{t.amount}</td>
                    <td>
                      {t.isValid ? (
                        <span style={{ color: 'green' }}>✓ Valid</span>
                      ) : (
                        <span style={{ color: 'red' }}>
                          ✗ Error: {t.validationError}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1rem' }}>
        <button onClick={onFillExample} style={{ marginRight: '0.5rem' }}>
          Fill with Example Data
        </button>
        <button onClick={onNext}>Next</button>
      </div>
    </div>
  )
}

export { Step1 }


