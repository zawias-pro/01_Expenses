import { test } from 'node:test'
import assert from 'node:assert'
import { formatPolishNumber } from './formatPolishNumber.ts'

test('formatPolishNumber - formats correctly', () => {
  assert.strictEqual(formatPolishNumber(1234.56), '1234,56')
  assert.strictEqual(formatPolishNumber(5000), '5000,00')
  assert.strictEqual(formatPolishNumber(-450), '-450,00')
  assert.strictEqual(formatPolishNumber(0), '0,00')
})

