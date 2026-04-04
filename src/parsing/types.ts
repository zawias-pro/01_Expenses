const NO_CATEGORY_KEY = '(no category)'
const NO_CATEGORY_ID = '__no_category__'
const NO_CATEGORY_FILTER_VALUE = '__no_category__'

interface Transaction {
  id: string
  hash: string
  date: string
  description: string
  category: string | null
  amount: string
  excluded: boolean
  isValid: boolean
  validationError?: string
  comment?: string
  originalDate: string
  originalCategory: string | null
  addedAt?: string
}

interface MonthlySummary {
  year: number
  month: number
  totalExpenses: number
  totalIncome: number
  balance: number
  categories: Record<string, number>
}

interface YearlySummary {
  year: number
  totalExpenses: number
  totalIncome: number
  balance: number
  categories: Record<string, number>
}

interface AllDataSummary {
  totalExpenses: number
  totalIncome: number
  balance: number
  categories: Record<string, number>
}

export {
  NO_CATEGORY_ID,
  NO_CATEGORY_KEY,
  NO_CATEGORY_FILTER_VALUE,
  type Transaction,
  type MonthlySummary,
  type YearlySummary,
  type AllDataSummary,
}
