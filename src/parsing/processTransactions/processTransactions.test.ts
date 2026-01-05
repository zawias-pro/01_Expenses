import { test } from 'node:test'
import assert from 'node:assert'
import { processTransactions } from './processTransactions.ts'
import type { Transaction } from '../types.ts'

test('processTransactions - processes transactions correctly', () => {
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2025-12-12',
      description: 'Test expense',
      account: 'Account1',
      category: 'Category1',
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
      category: 'Category1',
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
      category: 'Category1',
      amount: '-1 000,00 PLN',
      excluded: false,
      isValid: true,
      overridden: false,
      overrideMode: false,
    },
  ]
  const rules = { 'test': 'test-category' }
  const result = processTransactions(transactions, rules)

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
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2025-12-12',
      description: 'Test expense',
      account: 'Account1',
      category: 'Category1',
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
      category: 'Category1',
      amount: '2 000,00 PLN',
      excluded: false,
      isValid: true,
      overridden: false,
      overrideMode: false,
    },
  ]
  const rules = {}
  // Note: processTransactions processes all transactions - filtering excluded ones
  // should happen before calling this function
  const result = processTransactions(transactions, rules)

  assert(result.length === 1)
  const dec = result[0]
  // Both transactions are processed regardless of excluded flag
  assert.strictEqual(dec.totalExpenses, 5000)
  assert.strictEqual(dec.totalIncome, 2000)
})
