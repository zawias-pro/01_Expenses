import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAppStore } from '../../appStore.ts'
import { db } from '../../db.ts'
import { TransactionsTable } from './TransactionsTable.tsx'

const resetFilters = () => {
  useAppStore.setState({
    amountFilter: { min: '', max: '' },
    categoryFilter: new Set(),
    accountFilter: new Set(),
    descriptionFilter: '',
    importedAtFilter: { from: '', to: '' },
    dateFilter: { from: '', to: '' },
    importNameFilter: new Set(),
  })
}

describe('TransactionsTable', () => {
  beforeEach(async () => {
    resetFilters()
    await db.transactions.clear()
    await db.categories.clear()
    await db.accounts.clear()
  })

  it('renders transactions with category and account names', async () => {
    await db.categories.add({ id: 1, name: 'food' })
    await db.accounts.add({ id: 1, name: 'Revolut' })
    await db.transactions.add({ id: 1, amount: 10, description: 'coffee', categoryId: 1, accountId: 1, date: new Date(0).toISOString(), importedAt: 0, importName: null })

    render(<TransactionsTable />)

    expect(await screen.findByText('coffee')).toBeInTheDocument()
    expect(await screen.findByText('food')).toBeInTheDocument()
    expect(screen.getByText('Revolut')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('filters by amount via the modal', async () => {
    const user = userEvent.setup()
    await db.transactions.add({ id: 1, amount: 10, description: 'low', categoryId: null, accountId: null, date: new Date(0).toISOString(), importedAt: 0, importName: null })
    await db.transactions.add({ id: 2, amount: 50, description: 'mid', categoryId: null, accountId: null, date: new Date(0).toISOString(), importedAt: 0, importName: null })
    await db.transactions.add({ id: 3, amount: 90, description: 'high', categoryId: null, accountId: null, date: new Date(0).toISOString(), importedAt: 0, importName: null })

    render(<TransactionsTable />)
    expect(await screen.findByText('low')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Filter by amount' }))
    await screen.findByRole('dialog')
    await user.type(screen.getByLabelText('Min amount'), '40')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText('mid')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
    expect(screen.queryByText('low')).not.toBeInTheDocument()
  })

  it('filters by category via checkboxes', async () => {
    const user = userEvent.setup()
    await db.categories.add({ id: 1, name: 'food' })
    await db.categories.add({ id: 2, name: 'transport' })
    await db.transactions.add({ id: 1, amount: 10, description: 'lunch', categoryId: 1, accountId: null, date: new Date(0).toISOString(), importedAt: 0, importName: null })
    await db.transactions.add({ id: 2, amount: 20, description: 'bus', categoryId: 2, accountId: null, date: new Date(0).toISOString(), importedAt: 0, importName: null })
    await db.transactions.add({ id: 3, amount: 30, description: 'none', categoryId: null, accountId: null, date: new Date(0).toISOString(), importedAt: 0, importName: null })

    render(<TransactionsTable />)
    expect(await screen.findByText('lunch')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Filter by category' }))
    await screen.findByRole('dialog')
    await user.click(screen.getByLabelText('transport'))
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText('bus')).toBeInTheDocument()
    expect(screen.queryByText('lunch')).not.toBeInTheDocument()
    expect(screen.queryByText('none')).not.toBeInTheDocument()
  })

  it('filters by account including the no-account option', async () => {
    const user = userEvent.setup()
    await db.accounts.add({ id: 1, name: 'Revolut' })
    await db.transactions.add({ id: 1, amount: 10, description: 'with', categoryId: null, accountId: 1, date: new Date(0).toISOString(), importedAt: 0, importName: null })
    await db.transactions.add({ id: 2, amount: 20, description: 'without', categoryId: null, accountId: null, date: new Date(0).toISOString(), importedAt: 0, importName: null })

    render(<TransactionsTable />)
    expect(await screen.findByText('with')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Filter by account' }))
    await screen.findByRole('dialog')
    await user.click(screen.getByLabelText('No account'))
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText('without')).toBeInTheDocument()
    expect(screen.queryByText('with')).not.toBeInTheDocument()
  })

  it('filters by description with a keyword and with a glob', async () => {
    const user = userEvent.setup()
    await db.transactions.add({ id: 1, amount: 10, description: 'TEST-0001', categoryId: null, accountId: null, date: new Date(0).toISOString(), importedAt: 0, importName: null })
    await db.transactions.add({ id: 2, amount: 20, description: 'TEST-0002', categoryId: null, accountId: null, date: new Date(0).toISOString(), importedAt: 0, importName: null })
    await db.transactions.add({ id: 3, amount: 30, description: 'Coffee', categoryId: null, accountId: null, date: new Date(0).toISOString(), importedAt: 0, importName: null })

    render(<TransactionsTable />)
    expect(await screen.findByText('TEST-0001')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Filter by description' }))
    await screen.findByRole('dialog')
    await user.type(screen.getByPlaceholderText('e.g. TEST-*'), 'TEST-*')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText('TEST-0002')).toBeInTheDocument()
    expect(screen.queryByText('Coffee')).not.toBeInTheDocument()
  })

  it('filters by import name including unnamed', async () => {
    const user = userEvent.setup()
    await db.transactions.add({ id: 1, amount: 10, description: 'jan', categoryId: null, accountId: null, importName: 'January', date: new Date(0).toISOString(), importedAt: 1000 })
    await db.transactions.add({ id: 2, amount: 20, description: 'unnamed', categoryId: null, accountId: null, importName: null, date: new Date(0).toISOString(), importedAt: 2000 })

    render(<TransactionsTable />)
    expect(await screen.findByText('jan')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Filter by import name' }))
    await screen.findByRole('dialog')
    await user.click(screen.getByLabelText('Unnamed import'))
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText('unnamed')).toBeInTheDocument()
    expect(screen.queryByText('jan')).not.toBeInTheDocument()
  })

  it('filters by imported at via the store (focus)', async () => {
    const importedAt = new Date(2026, 0, 5, 10, 30, 12, 500).getTime()
    const otherImportedAt = new Date(2026, 1, 5, 10, 30).getTime()
    await db.transactions.add({ id: 1, amount: 10, description: 'sel', categoryId: null, accountId: null, importName: 'January', date: new Date(0).toISOString(), importedAt })
    await db.transactions.add({ id: 2, amount: 20, description: 'oth', categoryId: null, accountId: null, importName: 'February', date: new Date(0).toISOString(), importedAt: otherImportedAt })

    useAppStore.getState().focusImport(importedAt)
    render(<TransactionsTable />)

    expect(await screen.findByText('sel')).toBeInTheDocument()
    expect(screen.queryByText('oth')).not.toBeInTheDocument()
  })

  it('filters by date via the modal', async () => {
    const user = userEvent.setup()
    await db.transactions.add({ id: 1, amount: 10, description: 'jan', categoryId: null, accountId: null, date: '2026-01-01', importedAt: 0, importName: null })
    await db.transactions.add({ id: 2, amount: 20, description: 'feb', categoryId: null, accountId: null, date: '2026-02-01', importedAt: 0, importName: null })

    render(<TransactionsTable />)
    expect(await screen.findByText('jan')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Filter by date' }))
    await screen.findByRole('dialog')
    await user.type(screen.getByLabelText('From'), '2026-02-01')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText('feb')).toBeInTheDocument()
    expect(screen.queryByText('jan')).not.toBeInTheDocument()
  })

  it('shows an empty state when there are no transactions', async () => {
    render(<TransactionsTable />)

    expect(await screen.findByText('No transactions')).toBeInTheDocument()
  })

  it('deletes selected transactions after confirmation', async () => {
    const user = userEvent.setup()
    await db.transactions.add({ id: 1, amount: 10, description: 'a', categoryId: null, accountId: null, date: new Date(0).toISOString(), importedAt: 0, importName: null })
    await db.transactions.add({ id: 2, amount: 20, description: 'b', categoryId: null, accountId: null, date: new Date(0).toISOString(), importedAt: 0, importName: null })

    render(<TransactionsTable />)
    await screen.findByText('a')

    const firstRowCheckbox = screen.getAllByRole('row')[1].querySelector('input[type=checkbox]') as Element
    await user.click(firstRowCheckbox)
    expect(screen.getByText('1 selected')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Yes, delete' }))

    await screen.findByText('b')
    expect(screen.queryByText('a')).not.toBeInTheDocument()
    expect(await db.transactions.count()).toBe(1)
  })

  it('keeps selection when delete is cancelled', async () => {
    const user = userEvent.setup()
    await db.transactions.add({ id: 1, amount: 10, description: 'a', categoryId: null, accountId: null, date: new Date(0).toISOString(), importedAt: 0, importName: null })

    render(<TransactionsTable />)
    await screen.findByText('a')

    const firstRowCheckbox = screen.getAllByRole('row')[1].querySelector('input[type=checkbox]') as Element
    await user.click(firstRowCheckbox)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'No' }))

    expect(screen.getByText('1 selected')).toBeInTheDocument()
    expect(await db.transactions.count()).toBe(1)
  })

  it('sets account on selected transactions after confirmation', async () => {
    const user = userEvent.setup()
    await db.accounts.add({ id: 1, name: 'Revolut' })
    await db.transactions.add({ id: 1, amount: 10, description: 'a', categoryId: null, accountId: null, date: new Date(0).toISOString(), importedAt: 0, importName: null })
    await db.transactions.add({ id: 2, amount: 20, description: 'b', categoryId: null, accountId: null, date: new Date(0).toISOString(), importedAt: 0, importName: null })

    render(<TransactionsTable />)
    await screen.findByText('a')

    const firstRowCheckbox = screen.getAllByRole('row')[1].querySelector('input[type=checkbox]') as Element
    await user.click(firstRowCheckbox)

    await user.click(screen.getByRole('button', { name: 'Set account' }))
    await screen.findByRole('dialog')
    await user.selectOptions(screen.getByLabelText('Account'), '1')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    const rows = await db.transactions.toArray()
    expect(rows.find((row) => row.id === 1)!.accountId).toBe(1)
    expect(rows.find((row) => row.id === 2)!.accountId).toBeNull()
  })
})