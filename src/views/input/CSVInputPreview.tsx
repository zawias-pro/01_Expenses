import { parseCSVLine } from '../../parsing/parseCSVLine/parseCSVLine.ts'
import { classifyDescription } from '../../parsing/classifyDescription/classifyDescription.ts'
import type { Transaction } from '../../parsing/types.ts'
import type { CategoryMetadata } from '../../parsing/categoryTypes.ts'
import { CSVConfigControls } from './components/CSVConfigControls.tsx'
import { CSVPreviewTable } from './components/CSVPreviewTable.tsx'
import { SectionHeader } from '../../components/Header/Header.tsx'
import { Button } from '../../components/Button/Button.tsx'
import { TextArea } from '../../components/Input/Input.tsx'
import styles from './CSVInputPreview.module.css'

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
    <div className={styles.section}>
      <SectionHeader>CSV Input</SectionHeader>
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

      <div className={styles.formGroup}>
        <TextArea
          value={csvContent}
          onChange={e => { onCsvChange(e.target.value) }}
          rows={10}
          placeholder="Paste your CSV data here..."
          style={{ marginBottom: 0 }}
        />
      </div>

      <CSVPreviewTable transactions={previewTransactions} />

      <div className="action-buttons">
        <Button variant="outline" onClick={onFillExample}>
          Fill with Example Data
        </Button>
        <Button 
          onClick={handleAddTransactions}
          disabled={csvContent.trim().length === 0}
        >
          Add transactions
        </Button>
      </div>
    </div>
  ) 
}

export { CSVInputPreview }
