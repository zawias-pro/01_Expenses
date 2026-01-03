import { test } from 'node:test'
import assert from 'node:assert'
import { getMonthFromDate } from './getMonthFromDate.ts'

test('getMonthFromDate - extracts month correctly', () => {
  assert.strictEqual(getMonthFromDate('2025-12-12'), 12)
  assert.strictEqual(getMonthFromDate('2025-11-18'), 11)
  assert.strictEqual(getMonthFromDate('2025-10-11'), 10)
  assert.strictEqual(getMonthFromDate('2025-09-14'), 9)
  assert.strictEqual(getMonthFromDate('2025-01-01'), 1)
})

test('getMonthFromDate - invalid date throws', () => {
  assert.throws(() => getMonthFromDate('invalid-date'), /Invalid date: invalid-date/)
})
