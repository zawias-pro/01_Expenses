import type { MonthlySummary, YearlySummary } from '../types.ts'

/**
 * Example:
 * Input: [
 *   { year: 2025, month: 1, totalExpenses: 1000, totalIncome: 2000, balance: 1000, categories: { 'food': 500, 'transport': 500 } },
 *   { year: 2025, month: 2, totalExpenses: 1500, totalIncome: 2500, balance: 1000, categories: { 'food': 800, 'entertainment': 700 } }
 * ]
 * Output: [
 *   { year: 2025, totalExpenses: 2500, totalIncome: 4500, balance: 2000, categories: { 'food': 1300, 'transport': 500, 'entertainment': 700 } }
 * ]
 */
const aggregateByYear = (summaries: MonthlySummary[]): YearlySummary[] => {
  const yearlyData: Record<number, { expenses: number; income: number; categories: Record<string, number> }> = {}

  summaries.forEach(s => {
    if (!yearlyData[s.year]) {
      yearlyData[s.year] = { expenses: 0, income: 0, categories: {} }
    }

    const data = yearlyData[s.year]
    data.expenses += s.totalExpenses
    data.income += s.totalIncome

    Object.entries(s.categories).forEach(([cat, amount]) => {
      data.categories[cat] = (data.categories[cat] || 0) + amount
    })
  })

  return Object.entries(yearlyData)
    .map(([year, data]) => ({
      year: parseInt(year),
      totalExpenses: data.expenses,
      totalIncome: data.income,
      balance: data.income - data.expenses,
      categories: data.categories,
    }))
    .sort((a, b) => a.year - b.year)
}

export { aggregateByYear }
