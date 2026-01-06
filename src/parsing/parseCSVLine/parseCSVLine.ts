import type { Transaction } from '../types.ts'
import { validateTransaction } from '../validateTransaction/validateTransaction.ts'

/**
 * Example:
 * Input: "2025-12-12;"JAN ADAM KOWALSKI, CZYNSZ NAJMU PRZELEW ZEWNĘTRZNY WYCHODZĄCY 74899274659992743764666621 ";"MojBank 1234 ... 5678";"Czynsz i wynajem";-5 000,00 PLN;;"
 * Output: {
 *   id: "abc123",
 *   date: "2025-12-12",
 *   description: "JAN ADAM KOWALSKI, CZYNSZ NAJMU PRZELEW ZEWNĘTRZNY WYCHODZĄCY 74899274659992743764666621",
 *   account: "",
 *   category: "others",
 *   amount: "-5 000,00 PLN",
 *   excluded: false,
 *   isValid: true,
 *   validationError: undefined,
 *   overridden: false
 * }
 */
const parseCSVLine = (
  line: string, 
  delimiter: string = ';',
  dateIndex: number = 0,
  descriptionIndex: number = 1,
  amountIndex: number = 4
): Transaction => {
  // Simple CSV parser with configurable column indices
  const parts = line.split(delimiter)
  const clean = (s: string) => s.replace(/^"|"$/g, '').trim()

  // Handle cases where we don't have enough parts
  const date = parts.length > dateIndex ? clean(parts[dateIndex]) : ''
  const description = parts.length > descriptionIndex ? clean(parts[descriptionIndex]) : ''
  // Account field is ignored - always set to empty string
  const account = ''
  // Category from CSV is ignored - always default to "others"
  const category = 'others'
  const amount = parts.length > amountIndex ? clean(parts[amountIndex]) : ''

  // Check for insufficient parts
  let validation = validateTransaction(date, description, category, amount, line)

  // Additional validation for insufficient CSV parts
  const maxIndex = Math.max(dateIndex, descriptionIndex, amountIndex)
  if (parts.length <= maxIndex && line.trim()) {
    validation = { isValid: false, error: `Insufficient CSV columns (need at least ${maxIndex + 1}, got ${parts.length.toString()})` }
  }

  return {
    id: Math.random().toString(36).substring(2, 11),
    date,
    description,
    account,
    category,
    amount,
    excluded: !validation.isValid, // Automatically exclude invalid rows
    isValid: validation.isValid,
    validationError: validation.error,
    overridden: false,
    overrideMode: false,
  }
}

export { parseCSVLine }
