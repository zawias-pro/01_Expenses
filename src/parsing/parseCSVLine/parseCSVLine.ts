import { validateTransaction } from '../validateTransaction/validateTransaction.ts'
import { hashTransaction } from '../hashTransaction/hashTransaction.ts'

const parseCSVLine = ({
  line,
  delimiter,
  dateIndex,
  descriptionIndex,
  amountIndex,
}: {
  line: string,
  delimiter: string
  dateIndex: number
  descriptionIndex: number
  amountIndex: number
}) => {
  const parts = line.split(delimiter)
  const clean = (s: string) => s.replace(/^"|"$/g, '').trim()
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const date = parts.length > dateIndex ? clean(parts[dateIndex]!) : ''
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let description = parts.length > descriptionIndex ? clean(parts[descriptionIndex]!) : ''
  description = description.replace(/\s+/g, ' ').trim()
  const category: string | null = null
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const amount = parts.length > amountIndex ? clean(parts[amountIndex]!) : ''
  const hash = hashTransaction(date, description, amount)
  let validation = validateTransaction(date, description, amount, line)
  const maxIndex = Math.max(dateIndex, descriptionIndex, amountIndex)
  if (parts.length <= maxIndex && line.trim()) {
    validation = { isValid: false, error: `Insufficient CSV columns (need at least ${(maxIndex + 1).toString()}, got ${parts.length.toString()})` }
  }

  return {
    id: Math.random().toString(36).substring(2, 11),
    hash,
    date,
    description,
    category,
    amount,
    validationError: validation.error,
  }
}

export { parseCSVLine }
