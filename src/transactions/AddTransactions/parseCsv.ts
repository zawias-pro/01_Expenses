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
  line: string
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
  const lines = trimmed.split('\n').filter((line) => line.trim() !== '')

  return rows
    .map((row, index) => {
      const description = (row[descriptionIndex] ?? '').trim()
      const amountText = (row[amountIndex] ?? '').trim()

      if (description === '' && amountText === '') {
        return null
      }

      const amount = amountText === '' ? NaN : parseAmount(amountText)

      let error: string | undefined
      if (description === '') {
        error = 'Description is empty'
      } else if (amountText === '') {
        error = 'Amount is empty'
      } else if (!Number.isFinite(amount)) {
        error = 'Amount is not a number'
      }

      return { description, amountText, amount: Number.isFinite(amount) ? amount : null, line: lines[index] ?? '', error }
    })
    .filter((row) => row !== null)
}

export type { ParsedRow }
export { parseCsv }