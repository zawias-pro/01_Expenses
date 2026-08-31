import { describe, expect, it } from 'vitest'
import { parseCsv } from './parseCsv.ts'

const baseOptions = { delimiter: ';', descriptionColumn: 1, amountColumn: 2 }

describe('parseCsv', () => {
  it('parses rows with default settings', () => {
    expect(parseCsv('lunch;25\ncoffee;10', baseOptions)).toEqual([
      { description: 'lunch', amount: '25' },
      { description: 'coffee', amount: '10' },
    ])
  })

  it('honors custom columns', () => {
    expect(parseCsv('25;lunch\n10;coffee', { delimiter: ';', descriptionColumn: 2, amountColumn: 1 })).toEqual([
      { description: 'lunch', amount: '25' },
      { description: 'coffee', amount: '10' },
    ])
  })

  it('returns empty for empty input', () => {
    expect(parseCsv('', baseOptions)).toEqual([])
    expect(parseCsv('   \n  ', baseOptions)).toEqual([])
  })

  it('skips empty lines', () => {
    expect(parseCsv('lunch;25\n\n\ncoffee;10\n', baseOptions)).toEqual([
      { description: 'lunch', amount: '25' },
      { description: 'coffee', amount: '10' },
    ])
  })

  it('does not crash on messy input', () => {
    expect(() => parseCsv('a;b;"unterminated\n;;;', baseOptions)).not.toThrow()
  })
})