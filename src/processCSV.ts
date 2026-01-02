import * as fs from 'fs';
import csv from 'csv-parser';
import { getMonthFromDate } from './getMonthFromDate.ts';
import { parsePolishAmount } from './parsePolishAmount.ts';

interface MonthlySummary {
  month: number;
  totalExpenses: number;
  totalIncome: number;
  balance: number;
}

const processCSV = async (csvPath: string): Promise<MonthlySummary[]> => {
  const monthlyData: Map<number, { expenses: number; income: number }> = new Map();

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
          });
        }

        resolve(summaries);
      })
      .on('error', reject);
  });
};

export { processCSV };
export type { MonthlySummary };
