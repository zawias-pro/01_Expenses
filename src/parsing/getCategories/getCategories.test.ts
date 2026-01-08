import { test } from 'node:test'
import assert from 'node:assert'
import { getCategories } from './getCategories.ts'

test('getCategories - extracts unique categories from rules', () => {
  const rules = { 'grocery': ['walmart', 'biedronka'], 'mobile': ['vodafone'], 'transfers': ['transfer'] }
  const categories = getCategories(rules)

  assert.deepStrictEqual(categories, ['grocery', 'mobile', 'others', 'transfers'])
})
