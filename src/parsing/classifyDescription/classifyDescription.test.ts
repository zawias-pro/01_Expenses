import { test } from 'node:test'
import assert from 'node:assert'
import { classifyDescription } from './classifyDescription.ts'
import { generateCategoryId } from '../categoryUtils.ts'
import type { CategoryMetadata } from '../categoryTypes.ts'

test('classifyDescription - matches keywords correctly', () => {
  const housingId = generateCategoryId('housing')
  const financeId = generateCategoryId('finance')
  const othersId = generateCategoryId('others')
  const rules = { [housingId]: ['czynsz'], [financeId]: ['revolut'] }
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
  const housingId = generateCategoryId('housing')
  const rules = { [housingId]: ['czynsz'] }
  const metadata: CategoryMetadata = {
    [housingId]: 'housing',
    [generateCategoryId('others')]: 'others'
  }
  assert.strictEqual(classifyDescription('CZYNSZ', rules, metadata), housingId)
  assert.strictEqual(classifyDescription('czynsz', rules, metadata), housingId)
  assert.strictEqual(classifyDescription('Czynsz', rules, metadata), housingId)
})
