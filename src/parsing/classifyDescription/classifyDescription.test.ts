import { test } from 'node:test'
import assert from 'node:assert'
import { classifyDescription } from './classifyDescription.ts'
import { generateCategoryId } from '../categoryUtils.ts'

test('classifyDescription - matches keywords correctly', () => {
  const housingId = generateCategoryId()
  const financeId = generateCategoryId()
  const rules = { [housingId]: ['czynsz'], [financeId]: ['revolut'] }
  assert.strictEqual(classifyDescription('PRZELEW ZA CZYNSZ', rules), housingId)
  assert.strictEqual(classifyDescription('Revolut**1234', rules), financeId)
  assert.strictEqual(classifyDescription('some random transaction', rules), null)
})

test('classifyDescription - is case insensitive', () => {
  const housingId = generateCategoryId()
  const rules = { [housingId]: ['czynsz'] }
  assert.strictEqual(classifyDescription('CZYNSZ', rules), housingId)
  assert.strictEqual(classifyDescription('czynsz', rules), housingId)
  assert.strictEqual(classifyDescription('Czynsz', rules), housingId)
})
