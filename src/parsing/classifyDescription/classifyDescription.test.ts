import { test } from 'node:test'
import assert from 'node:assert'
import { classifyDescription } from './classifyDescription.ts'

test('classifyDescription - matches keywords correctly', () => {
  const rules = { 'housing': ['czynsz'], 'finance': ['revolut'] }
  assert.strictEqual(classifyDescription('PRZELEW ZA CZYNSZ', rules), 'housing')
  assert.strictEqual(classifyDescription('Revolut**1234', rules), 'finance')
  assert.strictEqual(classifyDescription('some random transaction', rules), 'others')
})

test('classifyDescription - is case insensitive', () => {
  const rules = { 'housing': ['czynsz'] }
  assert.strictEqual(classifyDescription('CZYNSZ', rules), 'housing')
  assert.strictEqual(classifyDescription('czynsz', rules), 'housing')
  assert.strictEqual(classifyDescription('Czynsz', rules), 'housing')
})
