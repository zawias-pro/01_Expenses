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
  csvAccepted, 
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
  csvAccepted: boolean
  rules: Record<string, string>
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

  const handleConfirm = () => {
    const hasErrors = getPreviewTransactions().some(t => !t.isValid)
    
    if (hasErrors) {
      alert('Please fix all errors in the CSV before confirming. Check the preview for details.')
      return
    }

    if (csvContent.trim().length === 0) {
      alert('Please paste CSV data before confirming.')
      return
    }

    const confirmed = window.confirm('Are you sure you want to accept this CSV? Once accepted, the CSV cannot be modified later.')
    if (confirmed) {
      onCsvAccept()
    }
  }

  return (
    <div className="section">
      <h2 className="section-header">CSV Input & Preview</h2>

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
              disabled={csvAccepted}
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
              disabled={csvAccepted}
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
              disabled={csvAccepted}
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
              disabled={csvAccepted}
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
          readOnly={csvAccepted}
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
        <button className="btn btn-outline" onClick={onFillExample} disabled={csvAccepted}>
          Fill with Example Data
        </button>
        {!csvAccepted && (
          <button 
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={csvContent.trim().length === 0}
          >
            Confirm CSV
          </button>
        )}
      </div>
      {csvAccepted && (
        <div className="alert alert-success">
          ✓ CSV has been accepted and cannot be modified. Use "Clear & Start Over" to reset.
        </div>
      )}
    </div>
  ) 
}

export { CSVInputPreview }
