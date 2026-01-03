import type { MonthlySummary, YearlySummary, AllDataSummary } from './types.ts'

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

export { aggregateByYear, aggregateAllData }
