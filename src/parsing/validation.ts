import { getMonthFromDate } from './getMonthFromDate.ts'
import { parsePolishAmount } from './parsePolishAmount.ts'

const validateTransaction = (date: string, description: string, account: string, category: string, amount: string, originalLine: string): { isValid: boolean; error?: string } => {
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

  if (!account.trim()) {
    return { isValid: false, error: 'Account is required' }
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
