import { test } from 'node:test';
import assert from 'node:assert';
import { parsePolishAmount } from './parsePolishAmount.ts';
import { getMonthFromDate } from './getMonthFromDate.ts';
import { formatPolishNumber } from './formatPolishNumber.ts';
import { processCSV } from './processCSV.ts';
import { classifyTransaction } from './classifyTransaction.ts';
import * as fs from 'fs';
import * as path from 'path';

test('classifyTransaction - uses rules from rules.csv', () => {
  // Description containing "Czynsz" (mapped to housing in rules.csv)
  assert.strictEqual(classifyTransaction({ description: 'PRZELEW ZA CZYNSZ' }), 'housing');
  // Description containing "Revolut" (mapped to finance)
  assert.strictEqual(classifyTransaction({ description: 'Revolut**1234' }), 'finance');
  // No match
  assert.strictEqual(classifyTransaction({ description: 'some random transaction' }), 'others');
});

test('parsePolishAmount - positive amount', () => {
  assert.strictEqual(parsePolishAmount('1 234,56 PLN'), 1234.56);
  assert.strictEqual(parsePolishAmount('5000,00 PLN'), 5000.0);
  assert.strictEqual(parsePolishAmount('2 241,61 PLN'), 2241.61);
});

test('parsePolishAmount - negative amount', () => {
  assert.strictEqual(parsePolishAmount('-5 000,00 PLN'), -5000.0);
  assert.strictEqual(parsePolishAmount('-450,00 PLN'), -450.0);
  assert.strictEqual(parsePolishAmount('-1500,00 PLN'), -1500.0);
});

test('parsePolishAmount - edge cases', () => {
  assert.strictEqual(parsePolishAmount('0,00 PLN'), 0.0);
  assert.strictEqual(parsePolishAmount('-0,00 PLN'), -0.0);
  assert.strictEqual(parsePolishAmount('100 PLN'), 100.0);
});

test('parsePolishAmount - invalid amount throws', () => {
  assert.throws(() => parsePolishAmount('invalid'), /Invalid amount: invalid/);
  assert.throws(() => parsePolishAmount('abc PLN'), /Invalid amount: abc PLN/);
});

test('getMonthFromDate - extracts month correctly', () => {
  assert.strictEqual(getMonthFromDate('2025-12-12'), 12);
  assert.strictEqual(getMonthFromDate('2025-11-18'), 11);
  assert.strictEqual(getMonthFromDate('2025-10-11'), 10);
  assert.strictEqual(getMonthFromDate('2025-09-14'), 9);
  assert.strictEqual(getMonthFromDate('2025-01-01'), 1);
});

test('getMonthFromDate - invalid date throws', () => {
  assert.throws(() => getMonthFromDate('invalid-date'), /Invalid date: invalid-date/);
});

test('formatPolishNumber - formats correctly', () => {
  assert.strictEqual(formatPolishNumber(1234.56), '1234,56');
  assert.strictEqual(formatPolishNumber(5000), '5000,00');
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
      'Balance should equal income minus expenses',
    );
  }

  // Verify months are sorted
  const months = summaries.map((s) => s.month);
  const sortedMonths = [...months].sort((a, b) => a - b);
  assert.deepStrictEqual(months, sortedMonths, 'Months should be sorted');

  // Based on the example CSV, we should have specific months
  const monthSet = new Set(months);
  assert(
    monthSet.has(9) || monthSet.has(10) || monthSet.has(11) || monthSet.has(12),
    'Should have at least one of the months from the example',
  );
});
