import { test } from 'node:test'
import assert from 'node:assert'
import { classifyTransaction } from './classifyTransaction.ts'

test('classifyTransaction - uses rules from rules.csv', () => {
  // Description containing "Czynsz" (mapped to housing in rules.csv)
  assert.strictEqual(classifyTransaction({ description: 'PRZELEW ZA CZYNSZ' }), 'housing')
  // Description containing "Revolut" (mapped to finance)
  assert.strictEqual(classifyTransaction({ description: 'Revolut**1234' }), 'finance')
  // No match
  assert.strictEqual(classifyTransaction({ description: 'some random transaction' }), 'others')
})
