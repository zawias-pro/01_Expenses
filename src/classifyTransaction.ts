import * as fs from 'fs';
import * as path from 'path';

/**
 * Loads classification rules from rules.csv
 */
const loadRules = (): Map<string, string> => {
  const rules = new Map<string, string>();
  const rulesPath = path.resolve('rules.csv');

  if (!fs.existsSync(rulesPath)) {
    return rules;
  }

  const content = fs.readFileSync(rulesPath, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const [keyword, category] = line.split(';');
    if (keyword && category) {
      rules.set(keyword.trim().toLowerCase(), category.trim());
    }
  }

  return rules;
};

const rules = loadRules();

/**
 * Classifies a transaction row into a category based on description.
 */
const classifyTransaction = (row: any): string => {
  const description = (row.description || '').toLowerCase();

  for (const [keyword, category] of rules.entries()) {
    if (description.includes(keyword)) {
      return category;
    }
  }

  return 'others';
};

export { classifyTransaction };
