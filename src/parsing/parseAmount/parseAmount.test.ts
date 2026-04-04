import { test } from 'node:test'
import assert from 'node:assert'
import { parseAmount } from './parseAmount.ts'

test('positive amount', () => {
  assert.strictEqual(parseAmount('1 234,56 PLN'), 1234.56)
  assert.strictEqual(parseAmount('5000,00 PLN'), 5000.0)
  assert.strictEqual(parseAmount('2 241,61 PLN'), 2241.61)
  assert.strictEqual(parseAmount('2 241,61 CHF'), 2241.61)
  assert.strictEqual(parseAmount('$2241.61 CHF'), 2241.61)
  assert.strictEqual(parseAmount('amount is: 2241.61 CHF'), 2241.61)
})

test('negative amount', () => {
  assert.strictEqual(parseAmount('-5 000,00 PLN'), -5000.0)
  assert.strictEqual(parseAmount('-450,00 PLN'), -450.0)
  assert.strictEqual(parseAmount('-1500,00 PLN'), -1500.0)
})

test('edge cases', () => {
  assert.strictEqual(parseAmount('0,00 PLN'), 0.0)
  assert.strictEqual(parseAmount('-0,00 PLN'), -0.0)
  assert.strictEqual(parseAmount('100 PLN'), 100.0)
})

test('invalid amount throws', () => {
  assert.throws(() => parseAmount('invalid'), /Invalid amount: invalid/)
  assert.throws(() => parseAmount('abc PLN'), /Invalid amount: abc PLN/)
})
