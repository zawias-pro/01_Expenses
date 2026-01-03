import type { Transaction } from './types.ts'
import { validateTransaction } from './validation.ts'

const parseCSVLine = (line: string, delimiter: string = ';'): Transaction => {
  // Simple CSV parser for the specific format:
  // 2025-12-12;"Description";"Account";"Category";-5 000,00 PLN;;
  const parts = line.split(delimiter)
  const clean = (s: string) => s.replace(/^"|"$/g, '').trim()

  // Handle cases where we don't have enough parts
  const date = parts.length > 0 ? clean(parts[0]) : ''
  const description = parts.length > 1 ? clean(parts[1]) : ''
  const account = parts.length > 2 ? clean(parts[2]) : ''
  const category = parts.length > 3 ? clean(parts[3]) : ''
  const amount = parts.length > 4 ? clean(parts[4]) : ''

  // Check for insufficient parts
  let validation = validateTransaction(date, description, account, category, amount, line)

  // Additional validation for insufficient CSV parts
  if (parts.length < 5 && line.trim()) {
    validation = { isValid: false, error: `Insufficient CSV columns (expected 5, got ${parts.length})` }
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    date,
    description,
    account,
    category,
    amount,
    excluded: !validation.isValid, // Automatically exclude invalid rows
    isValid: validation.isValid,
    validationError: validation.error,
  }
}

export { parseCSVLine }
