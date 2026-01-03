import { test } from 'node:test'
import assert from 'node:assert'
import { parseRules } from './parseRules.ts'

test('parseRules - parses rules correctly', () => {
  const content = 'keyword1;category1\nkeyword2;category2\n'
  const rules = parseRules(content)
  assert.strictEqual(rules.keyword1, 'category1')
  assert.strictEqual(rules.keyword2, 'category2')
})

test('parseRules - handles empty lines', () => {
  const content = 'keyword1;category1\n\nkeyword2;category2'
  const rules = parseRules(content)
  assert.strictEqual(rules.keyword1, 'category1')
  assert.strictEqual(rules.keyword2, 'category2')
})
