import * as Papa from 'papaparse'

type CsvOptions = {
  delimiter: string
  descriptionColumn: number
  amountColumn: number
  dateColumn: number
}

type ParsedRow = {
  description: string
  amountText: string
  amount: number | null
  dateText: string
  date: string | null
  line: string
  error?: string
}

const sanitizeAmount = (amountText: string) => amountText.replace(/[^0-9.,-]/g, '')

const parseAmount = (amountText: string) => {
  const sanitized = sanitizeAmount(amountText)
  if (sanitized === '') {
    return NaN
  }
  const amount = Number(sanitized)
  if (Number.isFinite(amount)) {
    return amount
  }
  if (sanitized.includes(',')) {
    const commaAmount = Number(sanitized.replace(',', '.'))
    if (Number.isFinite(commaAmount)) {
      return commaAmount
    }
  }
  return NaN
}

const formatDateOnly = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const parseDate = (dateText: string) => {
  const isoDateOnly = dateText.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoDateOnly) {
    return `${isoDateOnly[1]}-${isoDateOnly[2].padStart(2, '0')}-${isoDateOnly[3].padStart(2, '0')}`
  }
  const date = new Date(dateText)
  return Number.isNaN(date.getTime()) ? null : formatDateOnly(date)
}

const parseCsv = (source: string, { delimiter, descriptionColumn, amountColumn, dateColumn }: CsvOptions): ParsedRow[] => {
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
  const dateIndex = dateColumn - 1
  const lines = trimmed.split('\n').filter((line) => line.trim() !== '')

  return rows
    .map((row, index) => {
      const description = (row[descriptionIndex] ?? '').trim()
      const amountText = (row[amountIndex] ?? '').trim()
      const dateText = (row[dateIndex] ?? '').trim()

      if (description === '' && amountText === '' && dateText === '') {
        return null
      }

      const amount = amountText === '' ? NaN : parseAmount(amountText)
      const date = dateText === '' ? null : parseDate(dateText)

      let error: string | undefined
      if (description === '') {
        error = 'Description is empty'
      } else if (amountText === '') {
        error = 'Amount is empty'
      } else if (!Number.isFinite(amount)) {
        error = 'Amount is not a number'
      } else if (dateText === '') {
        error = 'Date is empty'
      } else if (date === null) {
        error = 'Date is not a valid date'
      }

      return {
        description,
        amountText,
        amount: Number.isFinite(amount) ? amount : null,
        dateText,
        date,
        line: lines[index] ?? '',
        error,
      }
    })
    .filter((row) => row !== null)
}

export type { ParsedRow }
export { parseCsv }