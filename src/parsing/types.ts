interface Transaction {
  id: string
  hash: string
  date: string
  description: string
  account: string
  category: string
  amount: string
  excluded: boolean
  isValid: boolean
  validationError?: string
  overridden: boolean // Kept for backward compatibility - true if dateOverridden or categoryOverridden
  dateOverridden?: boolean
  categoryOverridden?: boolean
  overrideMode: boolean
  comment?: string
  originalDate?: string
  originalCategory?: string
  addedAt?: string // ISO timestamp when transaction was added
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

export type { Transaction, MonthlySummary, YearlySummary, AllDataSummary }
