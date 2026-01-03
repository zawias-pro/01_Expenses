import { getMonthFromDate } from './getMonthFromDate.ts'
import { parsePolishAmount } from './parsePolishAmount.ts'

const getYearFromDate = (dateStr: string): number => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`)
  }
  return date.getFullYear()
}

interface Transaction {
  id: string
  date: string
  description: string
  account: string
  category: string
  amount: string
  excluded: boolean
  isValid: boolean
  validationError?: string
}

interface MonthlySummary {
  year: number
  month: number
  totalExpenses: number
  totalIncome: number
  balance: number
  categories: Record<string, number>
}

const parseRules = (content: string): Record<string, string> => {
  const rules: Record<string, string> = {}
  const lines = content.split('\n')
  for (const line of lines) {
    const parts = line.split(';')
    if (parts.length >= 2) {
      const keyword = parts[0].trim()
      const category = parts[1].trim()
      if (keyword && category) {
        rules[keyword] = category
      }
    }
  }
  return rules
}

const validateTransaction = (date: string, description: string, account: string, category: string, amount: string, originalLine: string): { isValid: boolean; error?: string } => {
  if (!originalLine.trim()) {
    return { isValid: false, error: 'Empty line' }
  }

  if (!date.trim()) {
    return { isValid: false, error: 'Date is required' }
  }

  try {
    getMonthFromDate(date)
  } catch (e) {
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
  } catch (e) {
    return { isValid: false, error: `Invalid amount format: ${amount}` }
  }

  return { isValid: true }
}

const parseCSVLine = (line: string): Transaction => {
  // Simple CSV parser for the specific format:
  // 2025-12-12;"Description";"Account";"Category";-5 000,00 PLN;;
  const parts = line.split(';')
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

const classifyDescription = (description: string, rules: Record<string, string>): string => {
  const desc = description.toLowerCase()
  for (const [keyword, category] of Object.entries(rules)) {
    if (desc.includes(keyword.toLowerCase())) {
      return category
    }
  }
  return 'others'
}

const processTransactions = (transactions: Transaction[], rules: Record<string, string>): MonthlySummary[] => {
  const monthlyData: Record<string, { expenses: number; income: number; categories: Record<string, number> }> = {}

  transactions.forEach(t => {
    try {
      const year = getYearFromDate(t.date)
      const month = getMonthFromDate(t.date)
      const amount = parsePolishAmount(t.amount)
      const category = classifyDescription(t.description, rules)

      const key = `${year}-${month}`
      if (!monthlyData[key]) {
        monthlyData[key] = { expenses: 0, income: 0, categories: {} }
      }

      const data = monthlyData[key]
      if (amount < 0) {
        const absAmount = Math.abs(amount)
        data.expenses += absAmount
        data.categories[category] = (data.categories[category] || 0) + absAmount
      } else {
        data.income += amount
      }
    } catch (e) {
      console.warn('Skipping invalid transaction', t, e)
    }
  })

  return Object.entries(monthlyData)
    .map(([key, data]) => {
      const [year, month] = key.split('-').map(Number)
      return {
        year,
        month,
        totalExpenses: data.expenses,
        totalIncome: data.income,
        balance: data.income - data.expenses,
        categories: data.categories,
      }
    })
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })
}

export { parseCSVLine, classifyDescription, processTransactions, parseRules, getYearFromDate }
export type { Transaction, MonthlySummary }

