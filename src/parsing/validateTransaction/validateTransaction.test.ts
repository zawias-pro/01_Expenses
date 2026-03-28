import { test } from 'node:test'
import assert from 'node:assert'
import { validateTransaction } from './validateTransaction.ts'

test('validateTransaction - valid transaction', () => {
  const result = validateTransaction('2025-12-12', 'Description', '-5000,00 PLN', 'valid line')
  assert.strictEqual(result.isValid, true)
  assert.strictEqual(result.error, undefined)
})

test('validateTransaction - empty line', () => {
  const result = validateTransaction('', '', '', '')
  assert.strictEqual(result.isValid, false)
  assert.strictEqual(result.error, 'Empty line')
})

test('validateTransaction - missing date', () => {
  const result = validateTransaction('', 'Description', '-5000,00 PLN', 'line')
  assert.strictEqual(result.isValid, false)
  assert.strictEqual(result.error, 'Date is required')
})

test('validateTransaction - invalid date', () => {
  const result = validateTransaction('invalid-date', 'Description', '-5000,00 PLN', 'line')
  assert.strictEqual(result.isValid, false)
  assert.strictEqual(result.error, 'Invalid date format: invalid-date')
})

test('validateTransaction - missing description', () => {
  const result = validateTransaction('2025-12-12', '', '-5000,00 PLN', 'line')
  assert.strictEqual(result.isValid, false)
  assert.strictEqual(result.error, 'Description is required')
})

test('validateTransaction - missing amount', () => {
  const result = validateTransaction('2025-12-12', 'Description', '', 'line')
  assert.strictEqual(result.isValid, false)
  assert.strictEqual(result.error, 'Amount is required')
})

test('validateTransaction - invalid amount', () => {
  const result = validateTransaction('2025-12-12', 'Description', 'invalid-amount', 'line')
  assert.strictEqual(result.isValid, false)
  assert.strictEqual(result.error, 'Invalid amount format: invalid-amount')
})
