import { parseCSVLine } from '../../parsing/parseCSVLine/parseCSVLine.ts'
import { classifyDescription } from '../../parsing/classifyDescription/classifyDescription.ts'
import { parsePolishAmount } from '../../parsing/parsePolishAmount/parsePolishAmount.ts'
import { hashTransaction } from '../../parsing/hashTransaction/hashTransaction.ts'
import type { Transaction } from '../../parsing/types.ts'
import { useStore, useAllRules, useCategoryMetadata } from '../../store/useStore.ts'
import { CSVConfigControls } from './components/CSVConfigControls.tsx'
import { CSVPreviewTable } from './components/CSVPreviewTable.tsx'
import { SectionHeader } from '../../components/SectionHeader/SectionHeader.tsx'
import { Button } from '../../components/Button/Button.tsx'
import { TextArea } from '../../components/Input/Input.tsx'
import { EXAMPLE_CSV } from './exampleCsv.ts'
import styles from './CSVInputPreview.module.css'

const CSVInputPreview = () => {
  const csvContent = useStore((state) => state.csvContent)
  const delimiter = useStore((state) => state.delimiter)
  const dateIndex = useStore((state) => state.dateIndex)
  const descriptionIndex = useStore((state) => state.descriptionIndex)
  const amountIndex = useStore((state) => state.amountIndex)
  const transactions = useStore((state) => state.transactions)
  const setCsvContent = useStore((state) => state.setCsvContent)
  const setTransactions = useStore((state) => state.setTransactions)

  const allRules = useAllRules()
  const categoryMetadata = useCategoryMetadata()

  const getPreviewTransactions = (): Transaction[] => {
    if (!csvContent.trim()) return []

    const lines = csvContent.split('\n').filter(line => line.trim())
    return lines.slice(0, 3).map(line => {
      const parsed = parseCSVLine(line, delimiter, dateIndex, descriptionIndex, amountIndex)
      return {
        ...parsed,
        category: classifyDescription(parsed.description, allRules, categoryMetadata)
      }
    })
  }

  const previewTransactions = getPreviewTransactions()

  const handleFillExample = () => {
    setCsvContent(EXAMPLE_CSV)
  }

  const handleAddTransactions = () => {
    if (!csvContent.trim()) {
      alert('Please paste CSV data before adding transactions.')
      return
    }

    const hasErrors = getPreviewTransactions().some(t => !t.isValid)
    if (hasErrors) {
      alert('Please fix all errors in the CSV before adding transactions. Check the preview for details.')
      return
    }

    const lines = csvContent.split('\n').filter((l) => l.trim())
    if (lines.length === 0) return

    const parsedWithIndex = lines.map((line, index) => ({
      transaction: parseCSVLine(line, delimiter, dateIndex, descriptionIndex, amountIndex),
      originalLine: line,
      lineIndex: index
    }))

    const validWithIndex = parsedWithIndex.filter(item => item.transaction.isValid)
    const invalidCount = parsedWithIndex.length - validWithIndex.length

    const classified = validWithIndex.map((item) => {
      const t = item.transaction
      const category = classifyDescription(t.description, allRules, categoryMetadata)
      let excluded = false
      try {
        const amount = parsePolishAmount(t.amount)
        if (amount > 0) excluded = true
      } catch {
        // ignore
      }
      return {
        transaction: {
          ...t,
          category,
          excluded,
          addedAt: new Date().toISOString(),
        },
        originalLine: item.originalLine,
        lineIndex: item.lineIndex
      }
    })

    if (classified.length === 0) return

    const existingHashes = new Set(transactions.map(t => {
      if (!t.hash) return hashTransaction(t.date, t.description, t.amount)
      return t.hash
    }))
    const duplicates: typeof classified = []
    const unique: typeof classified = []

    classified.forEach(item => {
      if (existingHashes.has(item.transaction.hash)) {
        duplicates.push(item)
      } else {
        unique.push(item)
        existingHashes.add(item.transaction.hash)
      }
    })

    const messages: string[] = []
    if (invalidCount > 0) {
      messages.push(`Found ${String(invalidCount)} invalid transaction(s) that were not added.`)
    }
    if (duplicates.length > 0) {
      messages.push(`Found ${String(duplicates.length)} duplicate transaction(s) that were not added.`)
    }
    if (messages.length > 0) {
      const uniqueCount = unique.length
      if (uniqueCount > 0) {
        messages.push(`Added: ${String(uniqueCount)} valid transaction(s)`)
      } else {
        messages.push(`No transactions were added. Please fix errors in the CSV preview.`)
      }
      window.alert(messages.join('\n\n'))
    }

    if (unique.length > 0) {
      setTransactions([...transactions, ...unique.map(item => item.transaction)])
    }

    const linesToRemove = new Set(unique.map(item => item.lineIndex))
    const remainingLines = lines.filter((_, index) => !linesToRemove.has(index))
    setCsvContent(remainingLines.join('\n'))
  }

  return (
    <>
      <SectionHeader>
        CSV Input
      </SectionHeader>
      <p>
        Paste CSV data below to add transactions. Transactions will be appended, not replaced.
      </p>
      <CSVConfigControls />

      <div className={styles['formGroup']}>
        <TextArea
          value={csvContent}
          onChange={e => { setCsvContent(e.target.value) }}
          rows={10}
          placeholder="Paste your CSV data here..."
          style={{ marginBottom: 0 }}
        />
      </div>

      <CSVPreviewTable transactions={previewTransactions} />

      <div className="action-buttons">
        <Button onClick={handleFillExample}>
          Fill with Example Data
        </Button>
        <Button
          onClick={handleAddTransactions}
          disabled={csvContent.trim().length === 0}
        >
          Add transactions
        </Button>
      </div>
    </>
  )
}

export { CSVInputPreview }
