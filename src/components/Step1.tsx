import { parseCSVLine } from '../parsing/parseCSVLine/parseCSVLine.ts'
import { classifyDescription } from '../parsing/classifyDescription/classifyDescription.ts'
import { parseRules } from '../parsing/parseRules/parseRules.ts'
import type { Transaction } from '../parsing/types.ts'
import rulesContent from '../rules.csv?raw'

const RULES = parseRules(rulesContent)

const Step1 = ({ csvContent, delimiter, onCsvChange, onDelimiterChange, onFillExample, onNext, rules }: {
  csvContent: string
  delimiter: string
  onCsvChange: (content: string) => void
  onDelimiterChange: (delimiter: string) => void
  onFillExample: () => void
  onNext?: () => void
  rules: Record<string, string>
}) => {
  // Parse preview transactions from first 3 rows and classify categories
  const getPreviewTransactions = (): Transaction[] => {
    if (!csvContent.trim()) return []

    const lines = csvContent.split('\n').filter(line => line.trim())
    return lines.slice(0, 3).map(line => {
      const parsed = parseCSVLine(line, delimiter)
      return {
        ...parsed,
        category: classifyDescription(parsed.description, rules)
      }
    })
  }

  const previewTransactions = getPreviewTransactions()

  return (
    <div>
      <h2>CSV Input & Preview</h2>

      <div>
        <label htmlFor="delimiter-select">
          CSV Delimiter:
        </label>
        <select
          id="delimiter-select"
          value={delimiter}
          onChange={e => { onDelimiterChange(e.target.value) }}
        >
          <option value=";">Semicolon (;)</option>
          <option value=",">Comma (,)</option>
          <option value="\t">Tab</option>
          <option value="|">Pipe (|)</option>
        </select>
      </div>

      <textarea
        value={csvContent}
        onChange={e => { onCsvChange(e.target.value) }}
        rows={10}
        style={{ width: '100%' }}
        placeholder="Paste your CSV data here..."
      />

      {previewTransactions.length > 0 && (
        <div>
          <h3>Preview (first 3 rows):</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table>
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
                        <span>✓ Valid</span>
                      ) : (
                        <span>
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

      <div>
        <button onClick={onFillExample}>
          Fill with Example Data
        </button>
      </div>
    </div>
  )
}

export { Step1 }
