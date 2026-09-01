import { describe, expect, it } from 'vitest'
import { parseCsv } from './parseCsv.ts'

const baseOptions = { delimiter: ';', descriptionColumn: 1, amountColumn: 2, dateColumn: 3 }

describe('parseCsv', () => {
  it('parses rows with default settings', () => {
    expect(parseCsv('lunch;25;2026-01-01\ncoffee;10;2026-01-02', baseOptions)).toEqual([
      { description: 'lunch', amountText: '25', amount: 25, dateText: '2026-01-01', date: '2026-01-01', line: 'lunch;25;2026-01-01', error: undefined },
      { description: 'coffee', amountText: '10', amount: 10, dateText: '2026-01-02', date: '2026-01-02', line: 'coffee;10;2026-01-02', error: undefined },
    ])
  })

  it('honors custom columns', () => {
    expect(
      parseCsv('25;lunch;2026-01-01\n10;coffee;2026-01-02', {
        delimiter: ';',
        descriptionColumn: 2,
        amountColumn: 1,
        dateColumn: 3,
      }),
    ).toEqual([
      { description: 'lunch', amountText: '25', amount: 25, dateText: '2026-01-01', date: '2026-01-01', line: '25;lunch;2026-01-01', error: undefined },
      { description: 'coffee', amountText: '10', amount: 10, dateText: '2026-01-02', date: '2026-01-02', line: '10;coffee;2026-01-02', error: undefined },
    ])
  })

  it('returns empty for empty input', () => {
    expect(parseCsv('', baseOptions)).toEqual([])
    expect(parseCsv('   \n  ', baseOptions)).toEqual([])
  })

  it('skips empty lines', () => {
    expect(parseCsv('lunch;25;2026-01-01\n\n\ncoffee;10;2026-01-02\n', baseOptions)).toEqual([
      { description: 'lunch', amountText: '25', amount: 25, dateText: '2026-01-01', date: '2026-01-01', line: 'lunch;25;2026-01-01', error: undefined },
      { description: 'coffee', amountText: '10', amount: 10, dateText: '2026-01-02', date: '2026-01-02', line: 'coffee;10;2026-01-02', error: undefined },
    ])
  })

  it('accepts comma as a decimal separator', () => {
    expect(parseCsv('lunch;10,50;2026-01-01\ncoffee;1,25;2026-01-02', baseOptions)).toEqual([
      { description: 'lunch', amountText: '10,50', amount: 10.5, dateText: '2026-01-01', date: '2026-01-01', line: 'lunch;10,50;2026-01-01', error: undefined },
      { description: 'coffee', amountText: '1,25', amount: 1.25, dateText: '2026-01-02', date: '2026-01-02', line: 'coffee;1,25;2026-01-02', error: undefined },
    ])
  })

  it('parses loose date formats in local time', () => {
    expect(parseCsv('lunch;25;5 Mar 2026\ncoffee;10;3/5/2026', baseOptions)).toEqual([
      { description: 'lunch', amountText: '25', amount: 25, dateText: '5 Mar 2026', date: '2026-03-05', line: 'lunch;25;5 Mar 2026', error: undefined },
      { description: 'coffee', amountText: '10', amount: 10, dateText: '3/5/2026', date: '2026-03-05', line: 'coffee;10;3/5/2026', error: undefined },
    ])
  })

  it('marks invalid rows', () => {
    expect(parseCsv('lunch;25;2026-01-01\nnoamount\nnondigit;abc;2026-01-02', baseOptions)).toEqual([
      { description: 'lunch', amountText: '25', amount: 25, dateText: '2026-01-01', date: '2026-01-01', line: 'lunch;25;2026-01-01', error: undefined },
      { description: 'noamount', amountText: '', amount: null, dateText: '', date: null, line: 'noamount', error: 'Amount is empty' },
      { description: 'nondigit', amountText: 'abc', amount: null, dateText: '2026-01-02', date: '2026-01-02', line: 'nondigit;abc;2026-01-02', error: 'Amount is not a number' },
    ])
  })

  it('flags a missing date', () => {
    expect(parseCsv('lunch;25', baseOptions)).toEqual([
      { description: 'lunch', amountText: '25', amount: 25, dateText: '', date: null, line: 'lunch;25', error: 'Date is empty' },
    ])
  })

  it('flags an invalid date', () => {
    expect(parseCsv('lunch;25;not-a-date', baseOptions)).toEqual([
      { description: 'lunch', amountText: '25', amount: 25, dateText: 'not-a-date', date: null, line: 'lunch;25;not-a-date', error: 'Date is not a valid date' },
    ])
  })

  it('keeps a valid amount and date when only the description is missing', () => {
    expect(parseCsv(';42.00;2026-01-01', baseOptions)).toEqual([
      { description: '', amountText: '42.00', amount: 42, dateText: '2026-01-01', date: '2026-01-01', line: ';42.00;2026-01-01', error: 'Description is empty' },
    ])
  })

  it('accepts amounts with surrounding currency text', () => {
    expect(parseCsv('lunch;-1234,56 PLN;2026-01-01', baseOptions)).toEqual([
      { description: 'lunch', amountText: '-1234,56 PLN', amount: -1234.56, dateText: '2026-01-01', date: '2026-01-01', line: 'lunch;-1234,56 PLN;2026-01-01', error: undefined },
    ])
  })

  it('does not crash on messy input', () => {
    expect(() => parseCsv('a;b;"unterminated\n;;;', baseOptions)).not.toThrow()
  })

  it('treats one line as one row regardless of delimiter', () => {
    const source = 'a;"x;y"\nb\nc;2;3'
    expect(parseCsv(source, baseOptions)).toHaveLength(3)
    expect(
      parseCsv(source, { delimiter: ',', descriptionColumn: 1, amountColumn: 2, dateColumn: 3 }),
    ).toHaveLength(3)
  })
})