import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aggregateAllData } from './aggregateAllData.ts'
import type { MonthlySummary } from '../types.ts'

test('aggregateAllData - aggregates all monthly summaries', () => {
  const monthlySummaries: MonthlySummary[] = [
    { year: 2024, month: 1, totalExpenses: 1000, totalIncome: 2000, balance: 1000, categories: { 'cat1': 1000 } },
    { year: 2024, month: 2, totalExpenses: 500, totalIncome: 1500, balance: 1000, categories: { 'cat1': 300, 'cat2': 200 } },
    { year: 2025, month: 1, totalExpenses: 800, totalIncome: 1200, balance: 400, categories: { 'cat1': 800 } },
  ]

  const result = aggregateAllData(monthlySummaries)

  assert.strictEqual(result.totalExpenses, 2300)
  assert.strictEqual(result.totalIncome, 4700)
  assert.strictEqual(result.balance, 2400)
  assert.strictEqual(result.categories.cat1, 2100)
  assert.strictEqual(result.categories.cat2, 200)
})
