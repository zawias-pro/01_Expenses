import { test } from 'node:test'
import assert from 'node:assert'
import { getCategories } from './getCategories.ts'

test('getCategories - extracts unique categories from rules', () => {
  const rules = { 'walmart': 'grocery', 'vodafone': 'mobile', 'transfer': 'transfers', 'biedronka': 'grocery' }
  const categories = getCategories(rules)

  assert.deepStrictEqual(categories, ['grocery', 'mobile', 'others', 'transfers'])
})
