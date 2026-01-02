import * as fs from 'fs';
import csv from 'csv-parser';
import { getMonthFromDate } from './getMonthFromDate.ts';
import { parsePolishAmount } from './parsePolishAmount.ts';

interface Transaction {
  date: string;
  description: string;
  account: string;
  category: string;
  amount: string;
  empty1: string;
  empty2: string;
}

export interface MonthlySummary {
  month: number;
  totalExpenses: number;
  totalIncome: number;
  balance: number;
}

/**
 * Processes CSV file and generates monthly summary
 */
export async function processCSV(csvPath: string): Promise<MonthlySummary[]> {
  const monthlyData: Map<number, { expenses: number; income: number }> = new Map();

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv({
        // The example CSV uses semicolons as separators
        separator: ';',
        // Correct headers to match the example CSV columns (no leading index column)
        headers: ['date', 'description', 'account', 'category', 'amount', 'empty1', 'empty2']
      }))
      .on('data', (data: Transaction) => {
        try {
          const month = getMonthFromDate(data.date);
          const amount = parsePolishAmount(data.amount);

          if (!monthlyData.has(month)) {
            monthlyData.set(month, { expenses: 0, income: 0 });
          }

          const monthData = monthlyData.get(month)!;

          if (amount < 0) {
            monthData.expenses += Math.abs(amount);
          } else {
            monthData.income += amount;
          }
        } catch (error) {
          console.warn(`Skipping invalid row:`, data, error);
        }
      })
      .on('end', () => {
        const summaries: MonthlySummary[] = [];

        // Sort months and create summaries
        const sortedMonths = Array.from(monthlyData.keys()).sort((a, b) => a - b);

        for (const month of sortedMonths) {
          const data = monthlyData.get(month)!;
          summaries.push({
            month,
            totalExpenses: data.expenses,
            totalIncome: data.income,
            balance: data.income - data.expenses
          });
        }

        resolve(summaries);
      })
      .on('error', reject);
  });
}
