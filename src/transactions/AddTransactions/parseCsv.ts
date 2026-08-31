import * as Papa from 'papaparse'

type CsvOptions = {
  delimiter: string
  descriptionColumn: number
  amountColumn: number
}

type ParsedRow = {
  description: string
  amountText: string
  amount: number | null
  error?: string
}

const parseAmount = (amountText: string) => {
  const amount = Number(amountText)
  if (Number.isFinite(amount)) {
    return amount
  }
  if (amountText.includes(',')) {
    const commaAmount = Number(amountText.replace(',', '.'))
    if (Number.isFinite(commaAmount)) {
      return commaAmount
    }
  }
  return NaN
}

const parseCsv = (source: string, { delimiter, descriptionColumn, amountColumn }: CsvOptions): ParsedRow[] => {
  const trimmed = source.trim()
  if (trimmed === '') {
    return []
  }

  let rows: string[][]
  try {
    const result = Papa.parse<string[]>(trimmed, {
      delimiter: delimiter.length === 1 ? delimiter : undefined,
      quoteChar: '',
      skipEmptyLines: 'greedy',
    })
    rows = result.data
  } catch {
    return []
  }

  const descriptionIndex = descriptionColumn - 1
  const amountIndex = amountColumn - 1

  return rows
    .map((row) => {
      const description = (row[descriptionIndex] ?? '').trim()
      const amountText = (row[amountIndex] ?? '').trim()

      if (description === '' && amountText === '') {
        return null
      }
      if (description === '') {
        return { description, amountText, amount: null, error: 'Description is empty' }
      }
      if (amountText === '') {
        return { description, amountText, amount: null, error: 'Amount is empty' }
      }

      const amount = parseAmount(amountText)
      if (!Number.isFinite(amount)) {
        return { description, amountText, amount: null, error: 'Amount is not a number' }
      }

      return { description, amountText, amount, error: undefined }
    })
    .filter((row) => row !== null)
}

export type { ParsedRow }
export { parseCsv }