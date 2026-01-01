import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

interface Transaction {
  index: number;
  date: string;
  description: string;
  account: string;
  category: string;
  amount: string;
  empty1: string;
  empty2: string;
}

interface MonthlySummary {
  month: number;
  totalExpenses: number;
  totalIncome: number;
  balance: number;
}

/**
 * Converts Polish number format to a JavaScript number
 * Examples: "1 234,56 PLN" -> 1234.56, "-1 234,56 PLN" -> -1234.56
 */
export function parsePolishAmount(amountStr: string): number {
  // Remove " PLN" suffix and trim
  const cleanAmount = amountStr.replace(' PLN', '').trim();

  // Handle negative numbers (start with -)
  const isNegative = cleanAmount.startsWith('-');
  const amountWithoutSign = isNegative ? cleanAmount.substring(1) : cleanAmount;

  // Replace spaces with empty string and comma with dot
  const standardFormat = amountWithoutSign.replace(/\s/g, '').replace(',', '.');

  const parsed = parseFloat(standardFormat);
  return isNegative ? -parsed : parsed;
}

/**
 * Extracts month from date string (YYYY-MM-DD format)
 */
export function getMonthFromDate(dateStr: string): number {
  const date = new Date(dateStr);
  return date.getMonth() + 1; // getMonth() returns 0-11, we want 1-12
}

/**
 * Processes CSV file and generates monthly summary
 */
export async function processCSV(csvPath: string): Promise<MonthlySummary[]> {
  const monthlyData: Map<number, { expenses: number; income: number }> = new Map();

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv({
        separator: '|',
        headers: ['index', 'date', 'description', 'account', 'category', 'amount', 'empty1', 'empty2'],
        skipEmptyLines: true
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

/**
 * Formats number for output (Polish format with spaces and comma)
 */
export function formatPolishNumber(num: number): string {
  return num.toLocaleString('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Outputs monthly summary in CSV format
 */
function outputSummary(summaries: MonthlySummary[]): void {
  console.log('Month; Total expenses; Total income; Balance');

  for (const summary of summaries) {
    console.log(
      `${summary.month}; ${formatPolishNumber(summary.totalExpenses)}; ${formatPolishNumber(summary.totalIncome)}; ${formatPolishNumber(summary.balance)}`
    );
  }
}

// Main execution
async function main() {
  const csvPath = process.argv[2];

  if (!csvPath) {
    console.error('Please provide path');
    process.exit(1);
  }

  const absolutePath = path.resolve(csvPath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  try {
    const summaries = await processCSV(absolutePath);
    outputSummary(summaries);
  } catch (error) {
    console.error('Error processing CSV:', error);
    process.exit(1);
  }
}

main();
