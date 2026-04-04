import { test } from 'node:test'
import assert from 'node:assert'
import { processTransactions } from './processTransactions.ts'
import type { Transaction } from '../types.ts'
import { NO_CATEGORY_ID } from '../types.ts'
import { generateCategoryId } from '../categoryUtils.ts'

const createTransaction = (transaction: Omit<Transaction, 'comment' | 'addedAt'>): Transaction => ({
  ...transaction,
  comment: null,
  addedAt: '2025-01-01T00:00:00.000Z',
})

test('processTransactions - processes transactions correctly', () => {
  const category1Id = generateCategoryId()
  const transactions: Transaction[] = [
    createTransaction({
      id: '1',
      date: '2025-12-12',
      originalDate: '2025-12-12',
      description: 'Test expense',
      category: category1Id,
      originalCategory: category1Id,
      amount: '-5 000,00 PLN',
      excluded: false,
      hash: '111',
    }),
    createTransaction({
      id: '2',
      date: '2025-12-12',
      originalDate: '2025-12-12',
      description: 'Test income',
      category: category1Id,
      originalCategory: category1Id,
      amount: '2 000,00 PLN',
      excluded: false,
      hash: '222',
    }),
    createTransaction({
      id: '3',
      date: '2025-11-11',
      originalDate: '2025-11-11',
      description: 'Another expense',
      category: category1Id,
      originalCategory: category1Id,
      amount: '-1 000,00 PLN',
      excluded: false,
      hash: '333',
    }),
  ]
  const result = processTransactions(transactions)

  assert(result.length === 2)
  const dec = result.find(s => s.year === 2025 && s.month === 12)
  const nov = result.find(s => s.year === 2025 && s.month === 11)

  assert(dec !== undefined)
  assert.strictEqual(dec.totalExpenses, 5000)
  assert.strictEqual(dec.totalIncome, 2000)
  assert.strictEqual(dec.balance, -3000)
  assert.strictEqual(dec.categories[category1Id], 5000)

  assert(nov !== undefined)
  assert.strictEqual(nov.totalExpenses, 1000)
  assert.strictEqual(nov.totalIncome, 0)
  assert.strictEqual(nov.balance, -1000)
  assert.strictEqual(nov.categories[category1Id], 1000)
})

test('processTransactions - processes all transactions passed to it', () => {
  const category1Id = generateCategoryId()
  const transactions: Transaction[] = [
    createTransaction({
      id: '1',
      date: '2025-12-12',
      originalDate: '2025-12-12',
      description: 'Test expense',
      category: category1Id,
      originalCategory: category1Id,
      amount: '-5 000,00 PLN',
      excluded: true,
      hash: '111',
    }),
    createTransaction({
      id: '2',
      date: '2025-12-12',
      originalDate: '2025-12-12',
      description: 'Test income',
      category: category1Id,
      originalCategory: category1Id,
      amount: '2 000,00 PLN',
      excluded: false,
      hash: '222',
    }),
  ]
  // Note: processTransactions processes all transactions - filtering excluded ones
  // should happen before calling this function
  const result = processTransactions(transactions)

  assert(result.length === 1)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const dec = result[0]!
  // Both transactions are processed regardless of excluded flag
  assert.strictEqual(dec.totalExpenses, 5000)
  assert.strictEqual(dec.totalIncome, 2000)
})

test('processTransactions - uses current categories and respects overrides', () => {
  const groceryId = generateCategoryId()
  const othersId = generateCategoryId()
  const customCategoryId = generateCategoryId()
  const transactions: Transaction[] = [
    createTransaction({
      id: '1',
      date: '2025-12-12',
      originalDate: '2025-12-12',
      description: 'BIEDRONKA purchase',
      category: groceryId,
      originalCategory: groceryId,
      amount: '-100,00 PLN',
      excluded: false,
      hash: '111',
    }),
    createTransaction({
      id: '2',
      date: '2025-12-12',
      originalDate: '2025-12-12',
      description: 'Random transaction',
      category: null,
      originalCategory: null,
      amount: '-50,00 PLN',
      excluded: false,
      hash: '222',
    }),
    createTransaction({
      id: '3',
      date: '2025-12-12',
      originalDate: '2025-12-12',
      description: 'Another transaction',
      category: customCategoryId,
      originalCategory: othersId,
      amount: '-25,00 PLN',
      excluded: false,
      hash: '333',
    }),
  ]
  const result = processTransactions(transactions)

  assert(result.length === 1)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const dec = result[0]!
  // Category totals use the current category stored on each transaction.
  assert.strictEqual(dec.categories[groceryId], 100)
  assert.strictEqual(dec.categories[NO_CATEGORY_ID], 50)
  assert.strictEqual(dec.categories[customCategoryId], 25)
})
