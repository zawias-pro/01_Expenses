import * as path from 'path';
import * as fs from 'fs';
import { processCSV } from './processCSV.ts';
import { outputSummary } from './outputSummary.ts';

const main = async (): Promise<void> => {
  const csvPath = process.argv[2];

  if (!csvPath) {
    console.error('Please provide path');
    process.exit(1);
    return;
  }

  const absolutePath = path.resolve(csvPath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
    return;
  }

  try {
    const summaries = await processCSV(absolutePath);
    outputSummary(summaries);
  } catch (error) {
    console.error('Error processing CSV:', error);
    process.exit(1);
  }
};

if (process.argv[1] && process.argv[1].endsWith('cli.ts')) {
  main();
}

export { main };

