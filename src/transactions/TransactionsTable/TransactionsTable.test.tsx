import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { db } from '../../db.ts'
import { TransactionsTable } from './TransactionsTable.tsx'

describe('TransactionsTable', () => {
  beforeEach(async () => {
    await db.transactions.clear()
    await db.categories.clear()
    await db.accounts.clear()
  })

  it('renders transactions with category and account names', async () => {
    await db.categories.add({ id: 1, name: 'food' })
    await db.accounts.add({ id: 1, name: 'Revolut' })
    await db.transactions.add({ id: 1, amount: 10, description: 'coffee', categoryId: 1, accountId: 1, importedAt: 0, importName: null })

    render(<TransactionsTable />)

    expect(await screen.findByText('coffee')).toBeInTheDocument()
    expect(await screen.findByText('food')).toBeInTheDocument()
    expect(screen.getByText('Revolut')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('filters by amount via the modal', async () => {
    const user = userEvent.setup()
    await db.transactions.add({ id: 1, amount: 10, description: 'low', categoryId: null, accountId: null, importedAt: 0, importName: null })
    await db.transactions.add({ id: 2, amount: 50, description: 'mid', categoryId: null, accountId: null, importedAt: 0, importName: null })
    await db.transactions.add({ id: 3, amount: 90, description: 'high', categoryId: null, accountId: null, importedAt: 0, importName: null })

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
    await db.transactions.add({ id: 1, amount: 10, description: 'lunch', categoryId: 1, accountId: null, importedAt: 0, importName: null })
    await db.transactions.add({ id: 2, amount: 20, description: 'bus', categoryId: 2, accountId: null, importedAt: 0, importName: null })
    await db.transactions.add({ id: 3, amount: 30, description: 'none', categoryId: null, accountId: null, importedAt: 0, importName: null })

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
    await db.transactions.add({ id: 1, amount: 10, description: 'with', categoryId: null, accountId: 1, importedAt: 0, importName: null })
    await db.transactions.add({ id: 2, amount: 20, description: 'without', categoryId: null, accountId: null, importedAt: 0, importName: null })

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
    await db.transactions.add({ id: 1, amount: 10, description: 'TEST-0001', categoryId: null, accountId: null, importedAt: 0, importName: null })
    await db.transactions.add({ id: 2, amount: 20, description: 'TEST-0002', categoryId: null, accountId: null, importedAt: 0, importName: null })
    await db.transactions.add({ id: 3, amount: 30, description: 'Coffee', categoryId: null, accountId: null, importedAt: 0, importName: null })

    render(<TransactionsTable />)
    expect(await screen.findByText('TEST-0001')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Filter by description' }))
    await screen.findByRole('dialog')
    await user.type(screen.getByPlaceholderText('e.g. TEST-*'), 'TEST-*')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText('TEST-0002')).toBeInTheDocument()
    expect(screen.queryByText('Coffee')).not.toBeInTheDocument()
  })

  it('shows an empty state when there are no transactions', async () => {
    render(<TransactionsTable />)

    expect(await screen.findByText('No transactions')).toBeInTheDocument()
  })
})