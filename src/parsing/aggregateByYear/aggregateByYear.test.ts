import { test } from 'node:test'
import assert from 'node:assert'
import { aggregateByYear } from './aggregateByYear.ts'
import type { MonthlySummary } from '../types.ts'

test('aggregateByYear - aggregates monthly summaries by year', () => {
  const monthlySummaries: MonthlySummary[] = [
    { year: 2024, month: 1, totalExpenses: 1000, totalIncome: 2000, balance: 1000, categories: { 'cat1': 1000 } },
    { year: 2024, month: 2, totalExpenses: 500, totalIncome: 1500, balance: 1000, categories: { 'cat1': 300, 'cat2': 200 } },
    { year: 2025, month: 1, totalExpenses: 800, totalIncome: 1200, balance: 400, categories: { 'cat1': 800 } },
  ]

  const result = aggregateByYear(monthlySummaries)

  assert.strictEqual(result.length, 2)

  const year2024 = result.find(s => s.year === 2024)
  assert(year2024 !== undefined)
  assert.strictEqual(year2024.totalExpenses, 1500)
  assert.strictEqual(year2024.totalIncome, 3500)
  assert.strictEqual(year2024.balance, 2000)
  assert.strictEqual(year2024.categories.cat1, 1300)
  assert.strictEqual(year2024.categories.cat2, 200)

  const year2025 = result.find(s => s.year === 2025)
  assert(year2025 !== undefined)
  assert.strictEqual(year2025.totalExpenses, 800)
  assert.strictEqual(year2025.totalIncome, 1200)
  assert.strictEqual(year2025.balance, 400)
  assert.strictEqual(year2025.categories.cat1, 800)
})
