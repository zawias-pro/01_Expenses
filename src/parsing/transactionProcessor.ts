import type { Transaction, MonthlySummary } from './types.ts'
import { getMonthFromDate } from './getMonthFromDate.ts'
import { parsePolishAmount } from './parsePolishAmount.ts'
import { classifyDescription } from './classifier.ts'

const getYearFromDate = (dateStr: string): number => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`)
  }
  return date.getFullYear()
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

export { processTransactions, getYearFromDate }
