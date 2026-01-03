import type { Transaction, MonthlySummary } from '../types.ts'
import { getMonthFromDate } from '../getMonthFromDate/getMonthFromDate.ts'
import { parsePolishAmount } from '../parsePolishAmount/parsePolishAmount.ts'
import { classifyDescription } from '../classifyDescription/classifyDescription.ts'
import { getYearFromDate } from '../getYearFromDate/getYearFromDate.ts'

/**
 * Example:
 * Input: [
 *   { id: "1", date: "2025-12-12", description: "Purchase", account: "Bank", category: "grocery", amount: "-50,00 PLN", excluded: false, isValid: true, validationError: undefined, overridden: false }
 * ], { "biedronka": "grocery" }
 * Output: [
 *   { year: 2025, month: 12, totalExpenses: 50, totalIncome: 0, balance: -50, categories: { "grocery": 50 } }
 * ]
 */
const processTransactions = (transactions: Transaction[], rules: Record<string, string>): MonthlySummary[] => {
  const monthlyData: Record<string, { expenses: number; income: number; categories: Record<string, number> }> = {}

  transactions.forEach(t => {
    try {
      const year = getYearFromDate(t.date)
      const month = getMonthFromDate(t.date)
      const amount = parsePolishAmount(t.amount)
      // Use the transaction's category (which may have been overridden in step 2)
      // If no category is set, fall back to classification
      const category = t.category || classifyDescription(t.description, rules)

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

export { processTransactions }
