import { test } from 'node:test'
import assert from 'node:assert'
import { formatNumber } from './formatNumber.ts'

test('formatNumber', () => {
  assert.strictEqual(formatNumber(1/3), '0.33')
  assert.strictEqual(formatNumber(1234.56), '1234.56')
  assert.strictEqual(formatNumber(5000), '5000.00')
  assert.strictEqual(formatNumber(-450), '-450.00')
  assert.strictEqual(formatNumber(0), '0.00')
})
