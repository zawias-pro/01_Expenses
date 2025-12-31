import { test } from 'node:test';
import assert from 'node:assert';
import { parsePolishAmount, getMonthFromDate, formatPolishNumber, processCSV } from './index.js';
import * as fs from 'fs';
import * as path from 'path';

test('parsePolishAmount - positive amount', () => {
  assert.strictEqual(parsePolishAmount('1 234,56 PLN'), 1234.56);
  assert.strictEqual(parsePolishAmount('5000,00 PLN'), 5000.00);
  assert.strictEqual(parsePolishAmount('2 241,61 PLN'), 2241.61);
});

test('parsePolishAmount - negative amount', () => {
  assert.strictEqual(parsePolishAmount('-5 000,00 PLN'), -5000.00);
  assert.strictEqual(parsePolishAmount('-450,00 PLN'), -450.00);
  assert.strictEqual(parsePolishAmount('-1500,00 PLN'), -1500.00);
});

test('parsePolishAmount - edge cases', () => {
  assert.strictEqual(parsePolishAmount('0,00 PLN'), 0.00);
  assert.strictEqual(parsePolishAmount('-0,00 PLN'), -0.00);
  assert.strictEqual(parsePolishAmount('100 PLN'), 100.00);
});

test('getMonthFromDate - extracts month correctly', () => {
  assert.strictEqual(getMonthFromDate('2025-12-12'), 12);
  assert.strictEqual(getMonthFromDate('2025-11-18'), 11);
  assert.strictEqual(getMonthFromDate('2025-10-11'), 10);
  assert.strictEqual(getMonthFromDate('2025-09-14'), 9);
  assert.strictEqual(getMonthFromDate('2025-01-01'), 1);
});

test('formatPolishNumber - formats correctly', () => {
  assert.strictEqual(formatPolishNumber(1234.56), '1\u00A0234,56');
  assert.strictEqual(formatPolishNumber(5000), '5\u00A0000,00');
  assert.strictEqual(formatPolishNumber(-450), '-450,00');
  assert.strictEqual(formatPolishNumber(0), '0,00');
});

test('processCSV - processes example file correctly', async () => {
  const csvPath = path.resolve('examples/1.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.warn('Example CSV file not found, skipping integration test');
    return;
  }

  const summaries = await processCSV(csvPath);
  
  // Verify we got results
  assert(summaries.length > 0, 'Should have at least one month');
  
  // Verify structure
  for (const summary of summaries) {
    assert(typeof summary.month === 'number', 'Month should be a number');
    assert(summary.month >= 1 && summary.month <= 12, 'Month should be 1-12');
    assert(typeof summary.totalExpenses === 'number', 'Total expenses should be a number');
    assert(typeof summary.totalIncome === 'number', 'Total income should be a number');
    assert(typeof summary.balance === 'number', 'Balance should be a number');
    assert.strictEqual(
      summary.balance,
      summary.totalIncome - summary.totalExpenses,
      'Balance should equal income minus expenses'
    );
  }
  
  // Verify months are sorted
  const months = summaries.map(s => s.month);
  const sortedMonths = [...months].sort((a, b) => a - b);
  assert.deepStrictEqual(months, sortedMonths, 'Months should be sorted');
  
  // Based on the example CSV, we should have specific months
  const monthSet = new Set(months);
  assert(monthSet.has(9) || monthSet.has(10) || monthSet.has(11) || monthSet.has(12), 
    'Should have at least one of the months from the example');
});

