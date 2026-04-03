import type { Transaction, MonthlySummary } from '../types.ts'
import { getMonthFromDate } from '../getMonthFromDate/getMonthFromDate.ts'
import { parsePolishAmount } from '../parsePolishAmount/parsePolishAmount.ts'
import { getYearFromDate } from '../getYearFromDate/getYearFromDate.ts'
import { getCategorySummaryKey } from '../categoryUtils.ts'

/**
 * Example:
 * Input: [
 *   { id: "1", date: "2025-12-12", description: "Purchase", account: "Bank", category: "cat_others", amount: "-50,00 PLN", excluded: false, isValid: true, validationError: undefined, overridden: false }
 * ], { "cat_xyz": ["biedronka"] }, { "cat_xyz": "grocery", "cat_others": "others" }
 * Output: [
 *   { year: 2025, month: 12, totalExpenses: 50, totalIncome: 0, balance: -50, categories: { "cat_others": 50 } }
 * ]
 * Note: categories in MonthlySummary use category IDs. Transactions without a
 * category use the NO_CATEGORY_ID sentinel key.
 */
const processTransactions = (
  transactions: Transaction[]
): MonthlySummary[] => {
  const monthlyData: Record<string, { expenses: number; income: number; categories: Record<string, number> }> = {}

  transactions.forEach(t => {
    try {
      const year = getYearFromDate(t.date)
      const month = getMonthFromDate(t.date)
      const amount = parsePolishAmount(t.amount)
      const categoryKey = getCategorySummaryKey(t.category)

      const key = `${year.toString()}-${month.toString()}`
      const data = monthlyData[key] ??= { expenses: 0, income: 0, categories: {} }
      if (amount < 0) {
        const absAmount = Math.abs(amount)
        data.expenses += absAmount
        data.categories[categoryKey] = (data.categories[categoryKey] || 0) + absAmount
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
      if(typeof year !== 'number') {throw new Error(`Invalid value: ${key}`)}
      if(typeof month !== 'number') {throw new Error(`Invalid value: ${key}`)}
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
      if(typeof a.year !=='number'){return 0}
      if(typeof b.year !=='number'){return 0}
      if(typeof a.month !=='number'){return 0}
      if(typeof b.month !=='number'){return 0}
      if (a.year !== b.year) {
        return a.year - b.year
      }
      return a.month - b.month
    })
}

export { processTransactions }
