import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { db } from '../../db.ts'
import { AddTransactions } from './AddTransactions.tsx'

const pasteCsv = (value: string) => {
  render(<AddTransactions />)
  const textarea = screen.getByPlaceholderText('Paste CSV here')
  fireEvent.change(textarea, { target: { value } })
}

describe('AddTransactions', () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    await db.transactions.clear()
    await db.categories.clear()
    await db.accounts.clear()
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

  it('defaults to no account and imports with null accountId', async () => {
    pasteCsv('lunch;25')

    expect(screen.getByLabelText('Account')).toHaveValue('')

    fireEvent.click(screen.getByRole('button', { name: 'Import' }))

    await waitFor(async () => {
      const transactions = await db.transactions.toArray()
      expect(transactions).toHaveLength(1)
      expect(transactions[0].accountId).toBeNull()
    })
  })

  it('imports with the selected account', async () => {
    const accountId = await db.accounts.add({ name: 'Revolut' })
    pasteCsv('lunch;25')

    await screen.findByRole('option', { name: 'Revolut' })
    fireEvent.change(screen.getByLabelText('Account'), { target: { value: String(accountId) } })

    fireEvent.click(screen.getByRole('button', { name: 'Import' }))

    await waitFor(async () => {
      const transactions = await db.transactions.toArray()
      expect(transactions).toHaveLength(1)
      expect(transactions[0].accountId).toBe(accountId)
    })
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

  it('shows a modal listing duplicates and imports all when chosen', async () => {
    await db.transactions.add({ amount: 25, description: 'lunch', categoryId: null, importedAt: 0, accountId: null })
    pasteCsv('lunch;25')

    fireEvent.click(screen.getByRole('button', { name: 'Import' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText('lunch')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Import all' }))

    await waitFor(async () => {
      expect(await db.transactions.count()).toBe(2)
    })
  })

  it('skips duplicates and imports the rest when chosen', async () => {
    await db.transactions.add({ amount: 25, description: 'lunch', categoryId: null, importedAt: 0, accountId: null })
    pasteCsv('lunch;25\ncoffee;10')

    fireEvent.click(screen.getByRole('button', { name: 'Import' }))

    await screen.findByRole('dialog')
    fireEvent.click(screen.getByRole('button', { name: 'Skip duplicates' }))

    await waitFor(async () => {
      const transactions = await db.transactions.toArray()
      expect(transactions).toHaveLength(2)
      expect(transactions.filter((t) => t.description === 'coffee')).toHaveLength(1)
      expect(transactions.filter((t) => t.description === 'lunch')).toHaveLength(1)
    })
    const textarea = screen.getByPlaceholderText('Paste CSV here') as HTMLTextAreaElement
    expect(textarea.value).toBe('lunch;25')
    expect((screen.getByPlaceholderText('Paste CSV here') as HTMLTextAreaElement).value).not.toContain('coffee;10')
  })

  it('aborts the import when the modal is closed', async () => {
    await db.transactions.add({ amount: 25, description: 'lunch', categoryId: null, importedAt: 0, accountId: null })
    pasteCsv('lunch;25')

    fireEvent.click(screen.getByRole('button', { name: 'Import' }))

    await screen.findByRole('dialog')
    fireEvent.click(screen.getByLabelText('Close'))

    await waitFor(async () => {
      expect(await db.transactions.count()).toBe(1)
    })
  })

  it('does not show the modal when there are no duplicates', async () => {
    pasteCsv('coffee;10')

    fireEvent.click(screen.getByRole('button', { name: 'Import' }))

    await waitFor(async () => {
      expect(await db.transactions.count()).toBe(1)
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})