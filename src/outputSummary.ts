import { MonthlySummary } from './processCSV.ts';
import { formatPolishNumber } from './formatPolishNumber.ts';

const outputSummary = (summaries: MonthlySummary[]): void => {
  console.log('Month; Total expenses; Total income; Balance');

  for (const summary of summaries) {
    console.log(
      `${summary.month}; ${formatPolishNumber(summary.totalExpenses)}; ${formatPolishNumber(
        summary.totalIncome,
      )}; ${formatPolishNumber(summary.balance)}`,
    );
  }
};

export { outputSummary };
