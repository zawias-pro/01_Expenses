import { describe, expect, it } from 'vitest'
import { parseCsv } from './parseCsv.ts'

const baseOptions = { delimiter: ';', descriptionColumn: 1, amountColumn: 2 }

describe('parseCsv', () => {
  it('parses rows with default settings', () => {
    expect(parseCsv('lunch;25\ncoffee;10', baseOptions)).toEqual([
      { description: 'lunch', amountText: '25', amount: 25, line: 'lunch;25', error: undefined },
      { description: 'coffee', amountText: '10', amount: 10, line: 'coffee;10', error: undefined },
    ])
  })

  it('honors custom columns', () => {
    expect(parseCsv('25;lunch\n10;coffee', { delimiter: ';', descriptionColumn: 2, amountColumn: 1 })).toEqual([
      { description: 'lunch', amountText: '25', amount: 25, line: '25;lunch', error: undefined },
      { description: 'coffee', amountText: '10', amount: 10, line: '10;coffee', error: undefined },
    ])
  })

  it('returns empty for empty input', () => {
    expect(parseCsv('', baseOptions)).toEqual([])
    expect(parseCsv('   \n  ', baseOptions)).toEqual([])
  })

  it('skips empty lines', () => {
    expect(parseCsv('lunch;25\n\n\ncoffee;10\n', baseOptions)).toEqual([
      { description: 'lunch', amountText: '25', amount: 25, line: 'lunch;25', error: undefined },
      { description: 'coffee', amountText: '10', amount: 10, line: 'coffee;10', error: undefined },
    ])
  })

  it('accepts comma as a decimal separator', () => {
    expect(parseCsv('lunch;10,50\ncoffee;1,25', baseOptions)).toEqual([
      { description: 'lunch', amountText: '10,50', amount: 10.5, line: 'lunch;10,50', error: undefined },
      { description: 'coffee', amountText: '1,25', amount: 1.25, line: 'coffee;1,25', error: undefined },
    ])
  })

  it('marks invalid rows', () => {
    expect(parseCsv('lunch;25\nnoamount\nnondigit;abc', baseOptions)).toEqual([
      { description: 'lunch', amountText: '25', amount: 25, line: 'lunch;25', error: undefined },
      { description: 'noamount', amountText: '', amount: null, line: 'noamount', error: 'Amount is empty' },
      { description: 'nondigit', amountText: 'abc', amount: null, line: 'nondigit;abc', error: 'Amount is not a number' },
    ])
  })

  it('keeps a valid amount when only the description is missing', () => {
    expect(parseCsv(';42.00', baseOptions)).toEqual([
      { description: '', amountText: '42.00', amount: 42, line: ';42.00', error: 'Description is empty' },
    ])
  })

  it('does not crash on messy input', () => {
    expect(() => parseCsv('a;b;"unterminated\n;;;', baseOptions)).not.toThrow()
  })

  it('treats one line as one row regardless of delimiter', () => {
    const source = 'a;"x;y"\nb\nc;2'
    expect(parseCsv(source, baseOptions)).toHaveLength(3)
    expect(parseCsv(source, { delimiter: ',', descriptionColumn: 1, amountColumn: 2 })).toHaveLength(3)
  })
})