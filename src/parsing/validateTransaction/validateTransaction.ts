import { getMonthFromDate } from '../getMonthFromDate/getMonthFromDate.ts'
import { parsePolishAmount } from '../parsePolishAmount/parsePolishAmount.ts'

/**
 * Example:
 * Input: "2025-12-12", "Description", "Category", "-5000,00 PLN", "original line"
 * Output: { isValid: true } or { isValid: false, error: "error message" }
 */
const validateTransaction = (date: string, description: string, category: string, amount: string, originalLine: string): { isValid: boolean; error?: string } => {
  if (!originalLine.trim()) {
    return { isValid: false, error: 'Empty line' }
  }

  if (!date.trim()) {
    return { isValid: false, error: 'Date is required' }
  }

  try {
    getMonthFromDate(date)
  } catch {
    return { isValid: false, error: `Invalid date format: ${date}` }
  }

  if (!description.trim()) {
    return { isValid: false, error: 'Description is required' }
  }

  if (!category.trim()) {
    return { isValid: false, error: 'Category is required' }
  }

  if (!amount.trim()) {
    return { isValid: false, error: 'Amount is required' }
  }

  try {
    parsePolishAmount(amount)
  } catch {
    return { isValid: false, error: `Invalid amount format: ${amount}` }
  }

  return { isValid: true }
}

export { validateTransaction }
