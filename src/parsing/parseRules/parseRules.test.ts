import { test } from 'node:test'
import assert from 'node:assert'
import { parseRules } from './parseRules.ts'
import { generateCategoryId } from '../categoryUtils.ts'

test('parseRules - parses rules correctly', () => {
  const content = 'keyword1;category1\nkeyword2;category2\n'
  const { rules, metadata } = parseRules(content)
  const category1Id = generateCategoryId('category1')
  const category2Id = generateCategoryId('category2')
  assert.deepStrictEqual(rules[category1Id], ['keyword1'])
  assert.deepStrictEqual(rules[category2Id], ['keyword2'])
  assert.strictEqual(metadata[category1Id], 'category1')
  assert.strictEqual(metadata[category2Id], 'category2')
})

test('parseRules - handles empty lines', () => {
  const content = 'keyword1;category1\n\nkeyword2;category2'
  const { rules, metadata } = parseRules(content)
  const category1Id = generateCategoryId('category1')
  const category2Id = generateCategoryId('category2')
  assert.deepStrictEqual(rules[category1Id], ['keyword1'])
  assert.deepStrictEqual(rules[category2Id], ['keyword2'])
  assert.strictEqual(metadata[category1Id], 'category1')
  assert.strictEqual(metadata[category2Id], 'category2')
})
