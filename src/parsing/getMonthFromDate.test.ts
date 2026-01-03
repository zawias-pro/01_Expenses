import { test } from 'node:test'
import assert from 'node:assert'
import { getMonthFromDate } from './getMonthFromDate.ts'
import { getYearFromDate } from './calculations.ts'

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

test('getYearFromDate - extracts year correctly', () => {
  assert.strictEqual(getYearFromDate('2025-12-12'), 2025)
  assert.strictEqual(getYearFromDate('2024-11-18'), 2024)
  assert.strictEqual(getYearFromDate('2023-10-11'), 2023)
  assert.strictEqual(getYearFromDate('2026-09-14'), 2026)
  assert.strictEqual(getYearFromDate('2022-01-01'), 2022)
})

test('getYearFromDate - invalid date throws', () => {
  assert.throws(() => getYearFromDate('invalid-date'), /Invalid date: invalid-date/)
})
