import * as fs from 'fs';
import * as path from 'path';
import type { MonthlySummary } from './processCSV.ts';
import { formatPolishNumber } from './formatPolishNumber.ts';

const saveResults = (summaries: MonthlySummary[]): void => {
  const resultDir = path.resolve('result');

  if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir);
  }

  // 1. Save general summary
  const summaryHeader = 'Month;Total expenses;Total income;Balance\n';
  const summaryRows = summaries
    .map(
      (s) =>
        `${s.month};${formatPolishNumber(s.totalExpenses)};${formatPolishNumber(
          s.totalIncome,
        )};${formatPolishNumber(s.balance)}`,
    )
    .join('\n');
  fs.writeFileSync(path.join(resultDir, 'summary.csv'), summaryHeader + summaryRows);

  // 2. Save category breakdown for each month
  for (const summary of summaries) {
    let content = `${summary.month}\n`;
    const categoryRows = Array.from(summary.categories.entries())
      .map(([cat, amount]) => `${cat} ${formatPolishNumber(amount)}`)
      .join('\n');
    content += categoryRows;

    fs.writeFileSync(path.join(resultDir, `month_${summary.month}.csv`), content);
  }
};

export { saveResults };
