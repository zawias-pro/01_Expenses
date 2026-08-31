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
    await db.transactions.add({ id: 1, amount: 10, description: 'coffee', categoryId: 1, accountId: 1, importedAt: 0 })

    render(<TransactionsTable />)

    expect(await screen.findByText('coffee')).toBeInTheDocument()
    expect(await screen.findByText('food')).toBeInTheDocument()
    expect(screen.getByText('Revolut')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('filters by amount via the modal', async () => {
    const user = userEvent.setup()
    await db.transactions.add({ id: 1, amount: 10, description: 'low', categoryId: null, accountId: null, importedAt: 0 })
    await db.transactions.add({ id: 2, amount: 50, description: 'mid', categoryId: null, accountId: null, importedAt: 0 })
    await db.transactions.add({ id: 3, amount: 90, description: 'high', categoryId: null, accountId: null, importedAt: 0 })

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

  it('shows an empty state when there are no transactions', async () => {
    render(<TransactionsTable />)

    expect(await screen.findByText('No transactions')).toBeInTheDocument()
  })
})