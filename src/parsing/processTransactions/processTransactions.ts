import type { Transaction, MonthlySummary } from '../types.ts'
import type { CategoryMetadata } from '../categoryTypes.ts'
import { getMonthFromDate } from '../getMonthFromDate/getMonthFromDate.ts'
import { parsePolishAmount } from '../parsePolishAmount/parsePolishAmount.ts'
import { classifyDescription } from '../classifyDescription/classifyDescription.ts'
import { getYearFromDate } from '../getYearFromDate/getYearFromDate.ts'
import { getCategoryNameFromId } from '../categoryUtils.ts'

/**
 * Example:
 * Input: [
 *   { id: "1", date: "2025-12-12", description: "Purchase", account: "Bank", category: "cat_others", amount: "-50,00 PLN", excluded: false, isValid: true, validationError: undefined, overridden: false }
 * ], { "cat_xyz": ["biedronka"] }, { "cat_xyz": "grocery", "cat_others": "others" }
 * Output: [
 *   { year: 2025, month: 12, totalExpenses: 50, totalIncome: 0, balance: -50, categories: { "others": 50 } }
 * ]
 * Note: categories in MonthlySummary use names for display, not IDs
 */
const processTransactions = (
  transactions: Transaction[], 
  rules: Record<string, string[]>, // category ID -> keywords
  metadata: CategoryMetadata // category ID -> category name
): MonthlySummary[] => {
  const monthlyData: Record<string, { expenses: number; income: number; categories: Record<string, number> }> = {}

  transactions.forEach(t => {
    try {
      const year = getYearFromDate(t.date)
      const month = getMonthFromDate(t.date)
      const amount = parsePolishAmount(t.amount)
      // Use the transaction's category ID if it was manually overridden
      // Otherwise, classify based on description (defaults to "others" ID if no match)
      const categoryId = t.overridden ? t.category : classifyDescription(t.description, rules)
      // Convert ID to name for display in summary
      const categoryName = getCategoryNameFromId(categoryId, metadata)

      const key = `${year.toString()}-${month.toString()}`
      const data = monthlyData[key] ??= { expenses: 0, income: 0, categories: {} }
      if (amount < 0) {
        const absAmount = Math.abs(amount)
        data.expenses += absAmount
        data.categories[categoryName] = (data.categories[categoryName] || 0) + absAmount
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
        categories: data.categories, // Uses names for display
      }
    })
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })
}

export { processTransactions }
