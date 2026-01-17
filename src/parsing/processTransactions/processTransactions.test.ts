import { test } from 'node:test'
import assert from 'node:assert'
import { processTransactions } from './processTransactions.ts'
import type { Transaction } from '../types.ts'
import { generateCategoryId } from '../categoryUtils.ts'
import type { CategoryMetadata } from '../categoryTypes.ts'

test('processTransactions - processes transactions correctly', () => {
  const category1Id = generateCategoryId()
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2025-12-12',
      description: 'Test expense',
      account: 'Account1',
      category: category1Id,
      amount: '-5 000,00 PLN',
      excluded: false,
      isValid: true,
      overridden: false,
      overrideMode: false,
    },
    {
      id: '2',
      date: '2025-12-12',
      description: 'Test income',
      account: 'Account1',
      category: category1Id,
      amount: '2 000,00 PLN',
      excluded: false,
      isValid: true,
      overridden: false,
      overrideMode: false,
    },
    {
      id: '3',
      date: '2025-11-11',
      description: 'Another expense',
      account: 'Account1',
      category: category1Id,
      amount: '-1 000,00 PLN',
      excluded: false,
      isValid: true,
      overridden: false,
      overrideMode: false,
    },
  ]
  const othersId = generateCategoryId()
  const rules = { [category1Id]: ['test'], [othersId]: [] }
  const metadata: CategoryMetadata = {
    [category1Id]: 'Category1',
    [othersId]: 'others'
  }
  const result = processTransactions(transactions, rules, metadata)

  assert(result.length === 2)
  const dec = result.find(s => s.year === 2025 && s.month === 12)
  const nov = result.find(s => s.year === 2025 && s.month === 11)

  assert(dec !== undefined)
  assert.strictEqual(dec.totalExpenses, 5000)
  assert.strictEqual(dec.totalIncome, 2000)
  assert.strictEqual(dec.balance, -3000)

  assert(nov !== undefined)
  assert.strictEqual(nov.totalExpenses, 1000)
  assert.strictEqual(nov.totalIncome, 0)
  assert.strictEqual(nov.balance, -1000)
})

test('processTransactions - processes all transactions passed to it', () => {
  const category1Id = generateCategoryId()
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2025-12-12',
      description: 'Test expense',
      account: 'Account1',
      category: category1Id,
      amount: '-5 000,00 PLN',
      excluded: true,
      isValid: true,
      overridden: false,
      overrideMode: false,
    },
    {
      id: '2',
      date: '2025-12-12',
      description: 'Test income',
      account: 'Account1',
      category: category1Id,
      amount: '2 000,00 PLN',
      excluded: false,
      isValid: true,
      overridden: false,
      overrideMode: false,
    },
  ]
  const othersId = generateCategoryId()
  const rules = { [othersId]: [] }
  const metadata: CategoryMetadata = {
    [category1Id]: 'Category1',
    [othersId]: 'others'
  }
  // Note: processTransactions processes all transactions - filtering excluded ones
  // should happen before calling this function
  const result = processTransactions(transactions, rules, metadata)

  assert(result.length === 1)
  const dec = result[0]
  // Both transactions are processed regardless of excluded flag
  assert.strictEqual(dec.totalExpenses, 5000)
  assert.strictEqual(dec.totalIncome, 2000)
})

test('processTransactions - classifies categories from description and respects overrides', () => {
  const groceryId = generateCategoryId()
  const othersId = generateCategoryId()
  const customCategoryId = generateCategoryId()
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2025-12-12',
      description: 'BIEDRONKA purchase',
      account: 'Account1',
      category: othersId,
      amount: '-100,00 PLN',
      excluded: false,
      isValid: true,
      overridden: false,
      overrideMode: false,
    },
    {
      id: '2',
      date: '2025-12-12',
      description: 'Random transaction',
      account: 'Account1',
      category: othersId,
      amount: '-50,00 PLN',
      excluded: false,
      isValid: true,
      overridden: false,
      overrideMode: false,
    },
    {
      id: '3',
      date: '2025-12-12',
      description: 'Another transaction',
      account: 'Account1',
      category: customCategoryId,
      amount: '-25,00 PLN',
      excluded: false,
      isValid: true,
      overridden: true, // Manually overridden
      overrideMode: false,
    },
  ]
  const rules = { [groceryId]: ['biedronka'], [othersId]: [] }
  const metadata: CategoryMetadata = {
    [groceryId]: 'grocery',
    [othersId]: 'others',
    [customCategoryId]: 'custom-category'
  }
  const result = processTransactions(transactions, rules, metadata)

  assert(result.length === 1)
  const dec = result[0]
  // BIEDRONKA should be classified as "grocery"
  assert.strictEqual(dec.categories['grocery'], 100)
  // Random transaction should default to "others"
  assert.strictEqual(dec.categories['others'], 50)
  // Overridden transaction should use the overridden category
  assert.strictEqual(dec.categories['custom-category'], 25)
})
