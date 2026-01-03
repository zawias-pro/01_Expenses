import { test } from 'node:test'
import assert from 'node:assert'
import { parseCSVLine } from './parseCSVLine.ts'

test('parseCSVLine - parses valid CSV line', () => {
  const line = '2025-12-12;"Description";"Account";"Category";-5 000,00 PLN;;'
  const result = parseCSVLine(line, ';')
  assert(result !== null)
  assert.strictEqual(result?.date, '2025-12-12')
  assert.strictEqual(result?.description, 'Description')
  assert.strictEqual(result?.account, 'Account')
  assert.strictEqual(result?.category, 'Category')
  assert.strictEqual(result?.amount, '-5 000,00 PLN')
  assert.strictEqual(result?.excluded, false)
  assert.strictEqual(result?.isValid, true)
  assert.strictEqual(result?.validationError, undefined)
  assert(typeof result?.id === 'string')
})

test('parseCSVLine - marks insufficient columns as invalid', () => {
  const line = 'invalid'
  const result = parseCSVLine(line, ';')
  assert.strictEqual(result.isValid, false)
  assert.strictEqual(result.excluded, true)
  assert.strictEqual(result.validationError, 'Insufficient CSV columns (expected 5, got 1)')
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
    { input: 'xd', expectedError: 'Insufficient CSV columns (expected 5, got 1)' },
    { input: 'r', expectedError: 'Insufficient CSV columns (expected 5, got 1)' },
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
  assert(result !== null)
  assert.strictEqual(result?.isValid, false)
  assert.strictEqual(result?.excluded, true)
  assert.strictEqual(result?.validationError, 'Invalid date format: invalid-date')
})

test('parseCSVLine - marks missing amount as excluded', () => {
  const line = '2025-12-12;"Description";"Account";"Category";;'
  const result = parseCSVLine(line, ';')
  assert(result !== null)
  assert.strictEqual(result?.isValid, false)
  assert.strictEqual(result?.excluded, true)
  assert.strictEqual(result?.validationError, 'Amount is required')
})

test('parseCSVLine - marks invalid amount as excluded', () => {
  const line = '2025-12-12;"Description";"Account";"Category";invalid-amount;;'
  const result = parseCSVLine(line, ';')
  assert(result !== null)
  assert.strictEqual(result?.isValid, false)
  assert.strictEqual(result?.excluded, true)
  assert.strictEqual(result?.validationError, 'Invalid amount format: invalid-amount')
})

test('parseCSVLine - handles quotes correctly', () => {
  const line = '2025-12-12;"Test "quoted" text";"Account";"Category";100,00 PLN;;'
  const result = parseCSVLine(line, ';')
  assert(result !== null)
  assert.strictEqual(result?.description, 'Test "quoted" text')
})
