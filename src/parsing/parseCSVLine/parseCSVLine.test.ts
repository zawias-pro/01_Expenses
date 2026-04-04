import { test } from 'node:test'
import assert from 'node:assert'
import { parseCSVLine } from './parseCSVLine.ts'

const parse = (line: string) => parseCSVLine({
  line,
  delimiter: ';',
  dateIndex: 0,
  descriptionIndex: 1,
  amountIndex: 4,
})

test('parseCSVLine - parses valid CSV line', () => {
  const line = '2025-12-12;"Description";"Account";"Category";-5 000,00 PLN;;'
  const result = parse(line)
  assert.strictEqual(result.date, '2025-12-12')
  assert.strictEqual(result.description, 'Description')
  assert.strictEqual(result.category, null)
  assert.strictEqual(result.amount, -5000)
  assert.strictEqual(result.validationError, undefined)
  assert(typeof result.id === 'string')
})

test('parseCSVLine - marks insufficient columns as invalid', () => {
  const line = 'invalid'
  const result = parse(line)
  assert.strictEqual(result.validationError, 'Insufficient CSV columns (need at least 5, got 1)')
})

test('parseCSVLine - marks empty line as invalid', () => {
  const line = ''
  const result = parse(line)
  assert.strictEqual(result.validationError, 'Empty line')
})

test('parseCSVLine - handles user example invalid rows', () => {
  // Test the user's example: "xd", "r", "r", "r"
  const testCases = [
    { input: 'xd', expectedError: 'Insufficient CSV columns (need at least 5, got 1)' },
    { input: 'r', expectedError: 'Insufficient CSV columns (need at least 5, got 1)' },
  ]

  testCases.forEach(({ input, expectedError }) => {
    const result = parse(input)
    assert.strictEqual(result.validationError, expectedError, `Expected correct error message for "${input}"`)
  })
})

test('parseCSVLine - marks invalid date as excluded', () => {
  const line = 'invalid-date;"Description";"Account";"Category";-5 000,00 PLN;;'
  const result = parse(line)
  assert.strictEqual(result.validationError, 'Invalid date format: invalid-date')
})

test('parseCSVLine - marks missing amount as excluded', () => {
  const line = '2025-12-12;"Description";"Account";"Category";;'
  const result = parse(line)
  assert.strictEqual(result.validationError, 'Amount is required')
})

test('parseCSVLine - marks invalid amount as excluded', () => {
  const line = '2025-12-12;"Description";"Account";"Category";invalid-amount;;'
  const result = parse(line)
  assert.strictEqual(result.validationError, 'Invalid amount format: invalid-amount')
})

test('parseCSVLine - handles quotes correctly', () => {
  const line = '2025-12-12;"Test "quoted" text";"Account";"Category";100,00 PLN;;'
  const result = parse(line)
  assert.strictEqual(result.description, 'Test "quoted" text')
})

test('parseCSVLine - generates hash for transactions', () => {
  const line = '2025-12-12;"Description";"Account";"Category";-5 000,00 PLN;;'
  const result = parse(line)
  assert(typeof result.hash === 'string')
  assert.strictEqual(result.hash.length, 16)
  // Same input should produce same hash
  const result2 = parse(line)
  assert.strictEqual(result.hash, result2.hash)
  // Different input should produce different hash
  const line2 = '2025-12-13;"Description";"Account";"Category";-5 000,00 PLN;;'
  const result3 = parse(line2)
  assert.notStrictEqual(result.hash, result3.hash)
})
