import { parseCSVLine } from '../../parsing/parseCSVLine/parseCSVLine.ts'
import { classifyDescription } from '../../parsing/classifyDescription/classifyDescription.ts'
import type { Transaction } from '../../parsing/types.ts'
import type { CategoryMetadata } from '../../parsing/categoryTypes.ts'
import { CSVConfigControls } from './components/CSVConfigControls.tsx'
import { CSVPreviewTable } from './components/CSVPreviewTable.tsx'

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
  rules,
  categoryMetadata
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
  categoryMetadata: CategoryMetadata
}) => {
  // Parse preview transactions from first 3 rows and classify categories
  const getPreviewTransactions = (): Transaction[] => {
    if (!csvContent.trim()) return []

    const lines = csvContent.split('\n').filter(line => line.trim())
    return lines.slice(0, 3).map(line => {
      const parsed = parseCSVLine(line, delimiter, dateIndex, descriptionIndex, amountIndex)
      return {
        ...parsed,
        category: classifyDescription(parsed.description, rules, categoryMetadata)
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

      <CSVConfigControls
        delimiter={delimiter}
        dateIndex={dateIndex}
        descriptionIndex={descriptionIndex}
        amountIndex={amountIndex}
        onDelimiterChange={onDelimiterChange}
        onDateIndexChange={onDateIndexChange}
        onDescriptionIndexChange={onDescriptionIndexChange}
        onAmountIndexChange={onAmountIndexChange}
      />

      <div className="form-group">
        <textarea
          className="form-textarea"
          value={csvContent}
          onChange={e => { onCsvChange(e.target.value) }}
          rows={10}
          placeholder="Paste your CSV data here..."
        />
      </div>

      <CSVPreviewTable transactions={previewTransactions} />

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
