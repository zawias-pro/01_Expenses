import { parseCSVLine } from "../../parsing/parseCSVLine/parseCSVLine.ts"
import { classifyDescription } from "../../parsing/classifyDescription/classifyDescription.ts"
import { parseAmount } from "../../parsing/parseAmount/parseAmount.ts"
import { hashTransaction } from "../../parsing/hashTransaction/hashTransaction.ts"
import type { Transaction } from "../../parsing/types.ts"

const addTransactions = (
  csvContent: string,
  setCsvContent: (content: string) => void,
  setTransactions: (transactions: Transaction[]) => void,
  transactions: Transaction[],
  delimiter: string,
  dateIndex: number,
  descriptionIndex: number,
  amountIndex: number,
  allRules: Record<string, string[]>,
  allowDuplicates: boolean,
) => {
  const lines = csvContent.split('\n')

  const parsedWithIndex = lines.map((line, index) => ({
    transaction: parseCSVLine(line, delimiter, dateIndex, descriptionIndex, amountIndex),
    originalLine: line,
    lineIndex: index
  }))

  const validWithIndex = parsedWithIndex.filter(item => item.transaction.isValid)
  const invalidCount = parsedWithIndex.length - validWithIndex.length

  const classified = validWithIndex.map((item) => {
    const t = item.transaction
    const category = classifyDescription(t.description, allRules)
    let excluded = false
    try {
      const amount = parseAmount(t.amount)
      if (amount > 0) {
        excluded = true
      }
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

  const existingHashes = new Set(transactions.map(t => {
    if (!t.hash) return hashTransaction(t.date, t.description, t.amount)
    return t.hash
  }))
  const duplicates: typeof classified = []
  const unique: typeof classified = []

  classified.forEach(item => {
    if (!allowDuplicates&&existingHashes.has(item.transaction.hash)) {
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
    setTransactions([
      ...transactions,
      ...unique.map(item => item.transaction)
    ])
  }

  const linesToRemove = new Set(unique.map(item => item.lineIndex))
  const remainingLines = lines.filter((_, index) => !linesToRemove.has(index))
  setCsvContent(remainingLines.join('\n'))
}

export {addTransactions}
