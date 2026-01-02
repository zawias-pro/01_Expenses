/**
 * Classifies a transaction row into a category.
 * Currently hardcoded to return "others".
 */
const classifyTransaction = (row: any): string => {
  return 'others';
};

export { classifyTransaction };
