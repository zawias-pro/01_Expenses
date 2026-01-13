import { parseCSVLine } from '../../parsing/parseCSVLine/parseCSVLine.ts'
import { classifyDescription } from '../../parsing/classifyDescription/classifyDescription.ts'
import type { Transaction } from '../../parsing/types.ts'

const CSVInputPreview = ({ 
  csvContent, 
  delimiter, 
  dateIndex,
  descriptionIndex,
  amountIndex,
  onCsvChange, 
  onDelimiterChange,
  onDateIndexChange,
  onDescriptionIndexChange,
  onAmountIndexChange,
  onFillExample, 
  onCsvAccept, 
  rules 
}: {
  csvContent: string
  delimiter: string
  dateIndex: number
  descriptionIndex: number
  amountIndex: number
  onCsvChange: (content: string) => void
  onDelimiterChange: (delimiter: string) => void
  onDateIndexChange: (index: number) => void
  onDescriptionIndexChange: (index: number) => void
  onAmountIndexChange: (index: number) => void
  onFillExample: () => void
  onCsvAccept: () => void
  rules: Record<string, string[]>
}) => {
  // Parse preview transactions from first 3 rows and classify categories
  const getPreviewTransactions = (): Transaction[] => {
    if (!csvContent.trim()) return []

    const lines = csvContent.split('\n').filter(line => line.trim())
    return lines.slice(0, 3).map(line => {
      const parsed = parseCSVLine(line, delimiter, dateIndex, descriptionIndex, amountIndex)
      return {
        ...parsed,
        category: classifyDescription(parsed.description, rules)
      }
    })
  }

  const previewTransactions = getPreviewTransactions()

  const handleAddTransactions = () => {
    const hasErrors = getPreviewTransactions().some(t => !t.isValid)
    
    if (hasErrors) {
      alert('Please fix all errors in the CSV before adding transactions. Check the preview for details.')
      return
    }

    if (csvContent.trim().length === 0) {
      alert('Please paste CSV data before adding transactions.')
      return
    }

    onCsvAccept()
  }

  return (
    <div className="section">
      <h2 className="section-header">CSV Input</h2>
      <p style={{ marginBottom: '1rem', color: '#666' }}>
        Paste CSV data below to add transactions to your existing data. Transactions will be appended, not replaced.
      </p>

      <div className="form-group">
        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="delimiter-select" className="form-label">
              CSV Delimiter:
            </label>
            <select
              id="delimiter-select"
              className="form-select"
              value={delimiter}
              onChange={e => { onDelimiterChange(e.target.value) }}
            >
              <option value=";">Semicolon (;)</option>
              <option value=",">Comma (,)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>
          <div className="form-group-small">
            <label htmlFor="date-index" className="form-label">
              Date Column:
            </label>
            <input
              id="date-index"
              type="number"
              className="form-input"
              value={dateIndex}
              onChange={e => { onDateIndexChange(parseInt(e.target.value) || 0) }}
              min="0"
            />
          </div>
          <div className="form-group-small">
            <label htmlFor="description-index" className="form-label">
              Description Column:
            </label>
            <input
              id="description-index"
              type="number"
              className="form-input"
              value={descriptionIndex}
              onChange={e => { onDescriptionIndexChange(parseInt(e.target.value) || 0) }}
              min="0"
            />
          </div>
          <div className="form-group-small">
            <label htmlFor="amount-index" className="form-label">
              Amount Column:
            </label>
            <input
              id="amount-index"
              type="number"
              className="form-input"
              value={amountIndex}
              onChange={e => { onAmountIndexChange(parseInt(e.target.value) || 0) }}
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <textarea
          className="form-textarea"
          value={csvContent}
          onChange={e => { onCsvChange(e.target.value) }}
          rows={10}
          placeholder="Paste your CSV data here..."
        />
      </div>

      {previewTransactions.length > 0 && (
        <div>
          <h3 className="section-subheader">Preview (first 3 rows):</h3>
          <div className="preview-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Exclude</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {previewTransactions.map(t => (
                  <tr key={t.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={t.excluded}
                        disabled
                        readOnly
                      />
                    </td>
                    <td>{t.date}</td>
                    <td>{t.description}</td>
                    <td>{t.category}</td>
                    <td>{t.amount}</td>
                    <td>
                      {t.isValid ? (
                        <span className="status-badge status-valid">✓ Valid</span>
                      ) : (
                        <span className="status-badge status-error">
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

      <div className="action-buttons">
        <button className="btn btn-outline" onClick={onFillExample}>
          Fill with Example Data
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleAddTransactions}
          disabled={csvContent.trim().length === 0}
        >
          Add transactions
        </button>
      </div>
    </div>
  ) 
}

export { CSVInputPreview }
