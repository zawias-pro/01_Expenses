import { test } from 'node:test'
import assert from 'node:assert'
import { parsePolishAmount } from './parsePolishAmount.ts'

test('parsePolishAmount - positive amount', () => {
  assert.strictEqual(parsePolishAmount('1 234,56 PLN'), 1234.56)
  assert.strictEqual(parsePolishAmount('5000,00 PLN'), 5000.0)
  assert.strictEqual(parsePolishAmount('2 241,61 PLN'), 2241.61)
})

test('parsePolishAmount - negative amount', () => {
  assert.strictEqual(parsePolishAmount('-5 000,00 PLN'), -5000.0)
  assert.strictEqual(parsePolishAmount('-450,00 PLN'), -450.0)
  assert.strictEqual(parsePolishAmount('-1500,00 PLN'), -1500.0)
})

test('parsePolishAmount - edge cases', () => {
  assert.strictEqual(parsePolishAmount('0,00 PLN'), 0.0)
  assert.strictEqual(parsePolishAmount('-0,00 PLN'), -0.0)
  assert.strictEqual(parsePolishAmount('100 PLN'), 100.0)
})

test('parsePolishAmount - invalid amount throws', () => {
  assert.throws(() => parsePolishAmount('invalid'), /Invalid amount: invalid/)
  assert.throws(() => parsePolishAmount('abc PLN'), /Invalid amount: abc PLN/)
})

