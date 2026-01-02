import { parsePolishAmount } from './src/parsePolishAmount.ts';
import { getMonthFromDate } from './src/getMonthFromDate.ts';
import { formatPolishNumber } from './src/formatPolishNumber.ts';
import { processCSV } from './src/processCSV.ts';

console.log('parsePolishAmount tests:');
console.log(parsePolishAmount('1 234,56 PLN'));
console.log(parsePolishAmount('-5 000,00 PLN'));
console.log(parsePolishAmount('100 PLN'));

console.log('getMonthFromDate tests:');
console.log(getMonthFromDate('2025-12-12'));
console.log(getMonthFromDate('2025-01-01'));

console.log('formatPolishNumber tests:');
console.log(formatPolishNumber(1234.56));
console.log(formatPolishNumber(-450));

(async () => {
  try {
    console.log('processCSV test:');
    const summaries = await processCSV('examples/1.csv');
    console.log('summaries length', summaries.length);
    console.dir(summaries, { depth: null });
  } catch (e) {
    console.error('processCSV error', e);
  }
})();

