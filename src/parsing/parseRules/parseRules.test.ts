import { test } from 'node:test'
import assert from 'node:assert'
import { parseRules } from './parseRules.ts'
import { getCategoryIdFromName } from '../categoryUtils.ts'

test('parseRules - parses rules correctly', () => {
  const content = 'keyword1;category1\nkeyword2;category2\n'
  const { rules, metadata } = parseRules(content)
  // Find category IDs by name since IDs are now unique
  const category1Id = getCategoryIdFromName('category1', metadata)
  const category2Id = getCategoryIdFromName('category2', metadata)
  assert(category1Id !== null, 'category1 should exist')
  assert(category2Id !== null, 'category2 should exist')
  assert.deepStrictEqual(rules[category1Id], ['keyword1'])
  assert.deepStrictEqual(rules[category2Id], ['keyword2'])
  assert.strictEqual(metadata[category1Id], 'category1')
  assert.strictEqual(metadata[category2Id], 'category2')
})

test('parseRules - handles empty lines', () => {
  const content = 'keyword1;category1\n\nkeyword2;category2'
  const { rules, metadata } = parseRules(content)
  // Find category IDs by name since IDs are now unique
  const category1Id = getCategoryIdFromName('category1', metadata)
  const category2Id = getCategoryIdFromName('category2', metadata)
  assert(category1Id !== null, 'category1 should exist')
  assert(category2Id !== null, 'category2 should exist')
  assert.deepStrictEqual(rules[category1Id], ['keyword1'])
  assert.deepStrictEqual(rules[category2Id], ['keyword2'])
  assert.strictEqual(metadata[category1Id], 'category1')
  assert.strictEqual(metadata[category2Id], 'category2')
})
