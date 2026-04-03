import type { MonthlySummary, AllDataSummary } from '../types.ts'

/**
 * Example:
 * Input: [
 *   { year: 2025, month: 1, totalExpenses: 1000, totalIncome: 2000, balance: 1000, categories: { 'cat_food': 500, 'cat_transport': 500 } },
 *   { year: 2025, month: 2, totalExpenses: 1500, totalIncome: 2500, balance: 1000, categories: { 'cat_food': 800, 'cat_entertainment': 700 } }
 * ]
 * Output: {
 *   totalExpenses: 2500,
 *   totalIncome: 4500,
 *   balance: 2000,
 *   categories: { 'cat_food': 1300, 'cat_transport': 500, 'cat_entertainment': 700 }
 * }
 */
const aggregateAllData = (summaries: MonthlySummary[]): AllDataSummary => {
  const allData = { expenses: 0, income: 0, categories: {} as Record<string, number> }

  summaries.forEach(s => {
    allData.expenses += s.totalExpenses
    allData.income += s.totalIncome

    Object.entries(s.categories).forEach(([cat, amount]) => {
      allData.categories[cat] = (allData.categories[cat] || 0) + amount
    })
  })

  return {
    totalExpenses: allData.expenses,
    totalIncome: allData.income,
    balance: allData.income - allData.expenses,
    categories: allData.categories,
  }
}

export { aggregateAllData }
