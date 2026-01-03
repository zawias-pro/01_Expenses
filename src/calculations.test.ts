import { test } from 'node:test'
import assert from 'node:assert'
import { parseCSVLine, parseRules, classifyDescription, processTransactions } from './calculations.ts'
import type { Transaction } from './calculations.ts'

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

test('parseCSVLine - parses valid CSV line', () => {
  const line = '2025-12-12;"Description";"Account";"Category";-5 000,00 PLN;;'
  const result = parseCSVLine(line)
  assert(result !== null)
  assert.strictEqual(result?.date, '2025-12-12')
  assert.strictEqual(result?.description, 'Description')
  assert.strictEqual(result?.account, 'Account')
  assert.strictEqual(result?.category, 'Category')
  assert.strictEqual(result?.amount, '-5 000,00 PLN')
  assert.strictEqual(result?.excluded, false)
  assert(typeof result?.id === 'string')
})

test('parseCSVLine - returns null for invalid line', () => {
  const line = 'invalid'
  const result = parseCSVLine(line)
  assert.strictEqual(result, null)
})

test('parseCSVLine - handles quotes correctly', () => {
  const line = '2025-12-12;"Test "quoted" text";"Account";"Category";100,00 PLN;;'
  const result = parseCSVLine(line)
  assert(result !== null)
  assert.strictEqual(result?.description, 'Test "quoted" text')
})

test('classifyDescription - matches keywords correctly', () => {
  const rules = { 'czynsz': 'housing', 'revolut': 'finance' }
  assert.strictEqual(classifyDescription('PRZELEW ZA CZYNSZ', rules), 'housing')
  assert.strictEqual(classifyDescription('Revolut**1234', rules), 'finance')
  assert.strictEqual(classifyDescription('some random transaction', rules), 'others')
})

test('classifyDescription - is case insensitive', () => {
  const rules = { 'czynsz': 'housing' }
  assert.strictEqual(classifyDescription('CZYNSZ', rules), 'housing')
  assert.strictEqual(classifyDescription('czynsz', rules), 'housing')
  assert.strictEqual(classifyDescription('Czynsz', rules), 'housing')
})

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
    },
    {
      id: '2',
      date: '2025-12-12',
      description: 'Test income',
      account: 'Account1',
      category: 'Category1',
      amount: '2 000,00 PLN',
      excluded: false,
    },
    {
      id: '3',
      date: '2025-11-11',
      description: 'Another expense',
      account: 'Account1',
      category: 'Category1',
      amount: '-1 000,00 PLN',
      excluded: false,
    },
  ]
  const rules = { 'test': 'test-category' }
  const result = processTransactions(transactions, rules)
  
  assert(result.length === 2)
  const dec = result.find(s => s.month === 12)
  const nov = result.find(s => s.month === 11)
  
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
    },
    {
      id: '2',
      date: '2025-12-12',
      description: 'Test income',
      account: 'Account1',
      category: 'Category1',
      amount: '2 000,00 PLN',
      excluded: false,
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

test('processTransactions - handles invalid transactions gracefully', () => {
  const transactions: Transaction[] = [
    {
      id: '1',
      date: 'invalid-date',
      description: 'Test',
      account: 'Account1',
      category: 'Category1',
      amount: '-5 000,00 PLN',
      excluded: false,
    },
    {
      id: '2',
      date: '2025-12-12',
      description: 'Test',
      account: 'Account1',
      category: 'Category1',
      amount: 'invalid-amount',
      excluded: false,
    },
    {
      id: '3',
      date: '2025-12-12',
      description: 'Test',
      account: 'Account1',
      category: 'Category1',
      amount: '100,00 PLN',
      excluded: false,
    },
  ]
  const rules = {}
  const result = processTransactions(transactions, rules)
  
  // Should only process the valid transaction
  assert(result.length === 1)
  assert.strictEqual(result[0].totalIncome, 100)
})

test('processTransactions - sorts months correctly', () => {
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2025-12-12',
      description: 'Test',
      account: 'Account1',
      category: 'Category1',
      amount: '100,00 PLN',
      excluded: false,
    },
    {
      id: '2',
      date: '2025-01-01',
      description: 'Test',
      account: 'Account1',
      category: 'Category1',
      amount: '200,00 PLN',
      excluded: false,
    },
    {
      id: '3',
      date: '2025-06-15',
      description: 'Test',
      account: 'Account1',
      category: 'Category1',
      amount: '300,00 PLN',
      excluded: false,
    },
  ]
  const rules = {}
  const result = processTransactions(transactions, rules)
  
  assert.strictEqual(result.length, 3)
  assert.strictEqual(result[0].month, 1)
  assert.strictEqual(result[1].month, 6)
  assert.strictEqual(result[2].month, 12)
})

