import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { db } from '../../db.ts'
import { AddTransactions } from './AddTransactions.tsx'

const pasteCsv = (value: string) => {
  render(<AddTransactions />)
  const textarea = screen.getByPlaceholderText('Paste CSV here')
  fireEvent.change(textarea, { target: { value } })
}

describe('AddTransactions', () => {
  beforeEach(async () => {
    await db.transactions.clear()
    await db.categories.clear()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('renders a preview from pasted csv', () => {
    pasteCsv('lunch;25\ncoffee;10,50')

    expect(screen.getByText('lunch')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('coffee')).toBeInTheDocument()
    expect(screen.getByText('10.5')).toBeInTheDocument()
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

  it('shows the amount even when the description is missing', () => {
    pasteCsv(';42.00')

    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('fills the textarea from a preset', () => {
    render(<AddTransactions />)

    fireEvent.click(screen.getByText('Fill with Example 1'))

    const textarea = screen.getByPlaceholderText('Paste CSV here') as HTMLTextAreaElement
    expect(textarea.value).toContain('TEST-0001;10')
    expect(screen.getAllByRole('row')).toHaveLength(11)
  })

  it('renders the Import button below the preview', () => {
    render(<AddTransactions />)

    fireEvent.click(screen.getByText('Fill with Example 1'))

    expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument()
  })

  it('imports valid rows with a shared importedAt timestamp', async () => {
    pasteCsv('lunch;25\ncoffee;10')

    fireEvent.click(screen.getByRole('button', { name: 'Import' }))

    await waitFor(async () => {
      const transactions = await db.transactions.toArray()
      expect(transactions).toHaveLength(2)
      expect(transactions[0].categoryId).toBeNull()
      expect(transactions[0].importedAt).toEqual(transactions[1].importedAt)
    })
  })

  it('clears the textarea after a successful import', async () => {
    pasteCsv('lunch;25')

    fireEvent.click(screen.getByRole('button', { name: 'Import' }))

    await waitFor(async () => {
      expect(await db.transactions.count()).toBe(1)
    })
    expect((screen.getByPlaceholderText('Paste CSV here') as HTMLTextAreaElement).value).toBe('')
  })

  it('aborts and alerts when any row is invalid', async () => {
    pasteCsv('lunch;25\nbad;abc')

    fireEvent.click(screen.getByRole('button', { name: 'Import' }))

    expect(window.alert).toHaveBeenCalled()
    expect(await db.transactions.count()).toBe(0)
  })
})