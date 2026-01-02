import * as fs from 'fs';
import csv from 'csv-parser';
import { getMonthFromDate } from './getMonthFromDate.ts';
import { parsePolishAmount } from './parsePolishAmount.ts';
import { classifyTransaction } from './classifyTransaction.ts';

interface MonthlySummary {
  month: number;
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  categories: Map<string, number>;
}

const processCSV = async (csvPath: string): Promise<MonthlySummary[]> => {
  const monthlyData: Map<
    number,
    { expenses: number; income: number; categories: Map<string, number> }
  > = new Map();

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(
        csv({
          separator: ';',
          headers: ['date', 'description', 'account', 'category', 'amount', 'empty1', 'empty2'],
        }),
      )
      .on('data', (data: any) => {
        try {
          const month = getMonthFromDate(data.date);
          const amount = parsePolishAmount(data.amount);
          const category = classifyTransaction(data);

          if (!monthlyData.has(month)) {
            monthlyData.set(month, { expenses: 0, income: 0, categories: new Map() });
          }

          const monthData = monthlyData.get(month)!;

          if (amount < 0) {
            const absAmount = Math.abs(amount);
            monthData.expenses += absAmount;

            const currentCatTotal = monthData.categories.get(category) || 0;
            monthData.categories.set(category, currentCatTotal + absAmount);
          } else {
            monthData.income += amount;
          }
        } catch (error) {
          console.warn('Skipping invalid row:', data, error);
        }
      })
      .on('end', () => {
        const summaries: MonthlySummary[] = [];
        const sortedMonths = Array.from(monthlyData.keys()).sort((a, b) => a - b);

        for (const month of sortedMonths) {
          const data = monthlyData.get(month)!;
          summaries.push({
            month,
            totalExpenses: data.expenses,
            totalIncome: data.income,
            balance: data.income - data.expenses,
            categories: data.categories,
          });
        }

        resolve(summaries);
      })
      .on('error', reject);
  });
};

export { processCSV };
export type { MonthlySummary };
