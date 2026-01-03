import { test } from 'node:test'
import assert from 'node:assert'
import { processCSV } from './processCSV.ts'
import * as fs from 'fs'
import * as path from 'path'

test('processCSV - processes example file correctly', async () => {
  const csvPath = path.resolve('examples/1.csv')

  if (!fs.existsSync(csvPath)) {
    console.warn('Example CSV file not found, skipping integration test')
    return
  }

  const summaries = await processCSV(csvPath)

  // Verify we got results
  assert(summaries.length > 0, 'Should have at least one month')

  // Verify structure
  for (const summary of summaries) {
    assert(typeof summary.month === 'number', 'Month should be a number')
    assert(summary.month >= 1 && summary.month <= 12, 'Month should be 1-12')
    assert(typeof summary.totalExpenses === 'number', 'Total expenses should be a number')
    assert(typeof summary.totalIncome === 'number', 'Total income should be a number')
    assert(typeof summary.balance === 'number', 'Balance should be a number')
    assert.strictEqual(
      summary.balance,
      summary.totalIncome - summary.totalExpenses,
      'Balance should equal income minus expenses',
    )
  }

  // Verify months are sorted
  const months = summaries.map((s) => s.month)
  const sortedMonths = [...months].sort((a, b) => a - b)
  assert.deepStrictEqual(months, sortedMonths, 'Months should be sorted')

  // Based on the example CSV, we should have specific months
  const monthSet = new Set(months)
  assert(
    monthSet.has(9) || monthSet.has(10) || monthSet.has(11) || monthSet.has(12),
    'Should have at least one of the months from the example',
  )
})
