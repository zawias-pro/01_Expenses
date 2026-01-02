import { getMonthFromDate } from './getMonthFromDate'
import { parsePolishAmount } from './parsePolishAmount'

interface Transaction {
  id: string;
  date: string;
  description: string;
  account: string;
  category: string;
  amount: string;
  excluded: boolean;
}

interface MonthlySummary {
  month: number;
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  categories: Record<string, number>;
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

const parseCSVLine = (line: string): Transaction | null => {
  // Simple CSV parser for the specific format: 
  // 2025-12-12;"Description";"Account";"Category";-5 000,00 PLN;;
  const parts = line.split(';')
  if (parts.length < 5) return null

  const clean = (s: string) => s.replace(/^"|"$/g, '').trim()

  return {
    id: Math.random().toString(36).substr(2, 9),
    date: clean(parts[0]),
    description: clean(parts[1]),
    account: clean(parts[2]),
    category: clean(parts[3]),
    amount: clean(parts[4]),
    excluded: false,
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
  const monthlyData: Record<number, { expenses: number; income: number; categories: Record<string, number> }> = {}

  transactions.forEach(t => {
    try {
      const month = getMonthFromDate(t.date)
      const amount = parsePolishAmount(t.amount)
      const category = classifyDescription(t.description, rules)

      if (!monthlyData[month]) {
        monthlyData[month] = { expenses: 0, income: 0, categories: {} }
      }

      const data = monthlyData[month]
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
    .map(([month, data]) => ({
      month: parseInt(month),
      totalExpenses: data.expenses,
      totalIncome: data.income,
      balance: data.income - data.expenses,
      categories: data.categories,
    }))
    .sort((a, b) => a.month - b.month)
}

export { parseCSVLine, classifyDescription, processTransactions, parseRules }
export type { Transaction, MonthlySummary }
