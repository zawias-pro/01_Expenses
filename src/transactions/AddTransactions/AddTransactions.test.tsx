import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AddTransactions } from './AddTransactions.tsx'

const pasteCsv = (value: string) => {
  render(<AddTransactions />)
  const textarea = screen.getByPlaceholderText('Paste CSV here')
  fireEvent.change(textarea, { target: { value } })
}

describe('AddTransactions', () => {
  it('renders a preview from pasted csv', () => {
    pasteCsv('lunch;25\ncoffee;10')

    expect(screen.getByText('lunch')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('coffee')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows default option values', () => {
    render(<AddTransactions />)

    expect(screen.getByDisplayValue(';')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
  })

  it('does not crash on messy input', () => {
    pasteCsv(';;;"unterminated\nno-col\n')

    expect(screen.getByText('CSV separator')).toBeInTheDocument()
  })

  it('shows empty preview when there is no input', () => {
    render(<AddTransactions />)

    expect(screen.getByText('No rows')).toBeInTheDocument()
  })
})