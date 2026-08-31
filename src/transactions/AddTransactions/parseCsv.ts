import * as Papa from 'papaparse'

type CsvOptions = {
  delimiter: string
  descriptionColumn: number
  amountColumn: number
}

const parseCsv = (source: string, { delimiter, descriptionColumn, amountColumn }: CsvOptions) => {
  const trimmed = source.trim()
  if (trimmed === '') {
    return []
  }

  let rows: string[][]
  try {
    const result = Papa.parse<string[]>(trimmed, {
      delimiter: delimiter.length === 1 ? delimiter : undefined,
      skipEmptyLines: 'greedy',
    })
    rows = result.data
  } catch {
    return []
  }

  const descriptionIndex = descriptionColumn - 1
  const amountIndex = amountColumn - 1

  return rows
    .map((row) => ({
      description: (row[descriptionIndex] ?? '').trim(),
      amount: (row[amountIndex] ?? '').trim(),
    }))
    .filter((row) => row.description !== '' || row.amount !== '')
}

export { parseCsv }