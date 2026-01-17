import { test } from 'node:test'
import assert from 'node:assert'
import { parseCSVLine } from './parseCSVLine.ts'

test('parseCSVLine - parses valid CSV line', () => {
  const line = '2025-12-12;"Description";"Account";"Category";-5 000,00 PLN;;'
  const result = parseCSVLine(line, ';')
  assert.strictEqual(result.date, '2025-12-12')
  assert.strictEqual(result.description, 'Description')
  // Account field is ignored and always set to empty string
  assert.strictEqual(result.account, '')
  // Category from CSV is ignored, always defaults to "others" (as a placeholder, will be converted to ID during classification)
  assert.strictEqual(result.category, 'others')
  assert.strictEqual(result.amount, '-5 000,00 PLN')
  assert.strictEqual(result.excluded, false)
  assert.strictEqual(result.isValid, true)
  assert.strictEqual(result.validationError, undefined)
  assert(typeof result.id === 'string')
})

test('parseCSVLine - marks insufficient columns as invalid', () => {
  const line = 'invalid'
  const result = parseCSVLine(line, ';')
  assert.strictEqual(result.isValid, false)
  assert.strictEqual(result.excluded, true)
  assert.strictEqual(result.validationError, 'Insufficient CSV columns (need at least 5, got 1)')
})

test('parseCSVLine - marks empty line as invalid', () => {
  const line = ''
  const result = parseCSVLine(line, ';')
  assert.strictEqual(result.isValid, false)
  assert.strictEqual(result.excluded, true)
  assert.strictEqual(result.validationError, 'Empty line')
})

test('parseCSVLine - handles user example invalid rows', () => {
  // Test the user's example: "xd", "r", "r", "r"
  const testCases = [
    { input: 'xd', expectedError: 'Insufficient CSV columns (need at least 5, got 1)' },
    { input: 'r', expectedError: 'Insufficient CSV columns (need at least 5, got 1)' },
  ]

  testCases.forEach(({ input, expectedError }) => {
    const result = parseCSVLine(input, ';')
    assert.strictEqual(result.isValid, false, `Expected "${input}" to be invalid`)
    assert.strictEqual(result.excluded, true, `Expected "${input}" to be excluded`)
    assert.strictEqual(result.validationError, expectedError, `Expected correct error message for "${input}"`)
  })
})

test('parseCSVLine - marks invalid date as excluded', () => {
  const line = 'invalid-date;"Description";"Account";"Category";-5 000,00 PLN;;'
  const result = parseCSVLine(line, ';')
  assert.strictEqual(result.isValid, false)
  assert.strictEqual(result.excluded, true)
  assert.strictEqual(result.validationError, 'Invalid date format: invalid-date')
})

test('parseCSVLine - marks missing amount as excluded', () => {
  const line = '2025-12-12;"Description";"Account";"Category";;'
  const result = parseCSVLine(line, ';')
  assert.strictEqual(result.isValid, false)
  assert.strictEqual(result.excluded, true)
  assert.strictEqual(result.validationError, 'Amount is required')
})

test('parseCSVLine - marks invalid amount as excluded', () => {
  const line = '2025-12-12;"Description";"Account";"Category";invalid-amount;;'
  const result = parseCSVLine(line, ';')
  assert.strictEqual(result.isValid, false)
  assert.strictEqual(result.excluded, true)
  assert.strictEqual(result.validationError, 'Invalid amount format: invalid-amount')
})

test('parseCSVLine - handles quotes correctly', () => {
  const line = '2025-12-12;"Test "quoted" text";"Account";"Category";100,00 PLN;;'
  const result = parseCSVLine(line, ';')
  assert.strictEqual(result.description, 'Test "quoted" text')
})

test('parseCSVLine - initializes overrideMode to false', () => {
  const line = '2025-12-12;"Description";"Account";"Category";-5 000,00 PLN;;'
  const result = parseCSVLine(line, ';')
  assert.strictEqual(result.overrideMode, false)
})

test('parseCSVLine - initializes overrideMode to false for invalid transactions', () => {
  const line = 'invalid-date;"Description";"Account";"Category";-5 000,00 PLN;;'
  const result = parseCSVLine(line, ';')
  assert.strictEqual(result.overrideMode, false)
  assert.strictEqual(result.isValid, false)
})

test('parseCSVLine - generates hash for transactions', () => {
  const line = '2025-12-12;"Description";"Account";"Category";-5 000,00 PLN;;'
  const result = parseCSVLine(line, ';')
  assert(typeof result.hash === 'string')
  assert.strictEqual(result.hash.length, 16)
  // Same input should produce same hash
  const result2 = parseCSVLine(line, ';')
  assert.strictEqual(result.hash, result2.hash)
  // Different input should produce different hash
  const line2 = '2025-12-13;"Description";"Account";"Category";-5 000,00 PLN;;'
  const result3 = parseCSVLine(line2, ';')
  assert.notStrictEqual(result.hash, result3.hash)
})
