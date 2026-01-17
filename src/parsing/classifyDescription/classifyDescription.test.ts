import { test } from 'node:test'
import assert from 'node:assert'
import { classifyDescription } from './classifyDescription.ts'
import { generateCategoryId } from '../categoryUtils.ts'
import type { CategoryMetadata } from '../categoryTypes.ts'

test('classifyDescription - matches keywords correctly', () => {
  const housingId = generateCategoryId()
  const financeId = generateCategoryId()
  const othersId = generateCategoryId()
  const rules = { [housingId]: ['czynsz'], [financeId]: ['revolut'], [othersId]: [] }
  const metadata: CategoryMetadata = {
    [housingId]: 'housing',
    [financeId]: 'finance',
    [othersId]: 'others'
  }
  assert.strictEqual(classifyDescription('PRZELEW ZA CZYNSZ', rules, metadata), housingId)
  assert.strictEqual(classifyDescription('Revolut**1234', rules, metadata), financeId)
  assert.strictEqual(classifyDescription('some random transaction', rules, metadata), othersId)
})

test('classifyDescription - is case insensitive', () => {
  const housingId = generateCategoryId()
  const othersId = generateCategoryId()
  const rules = { [housingId]: ['czynsz'], [othersId]: [] }
  const metadata: CategoryMetadata = {
    [housingId]: 'housing',
    [othersId]: 'others'
  }
  assert.strictEqual(classifyDescription('CZYNSZ', rules, metadata), housingId)
  assert.strictEqual(classifyDescription('czynsz', rules, metadata), housingId)
  assert.strictEqual(classifyDescription('Czynsz', rules, metadata), housingId)
})
