import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { db } from '../../db.ts'
import { TransactionsTable } from './TransactionsTable.tsx'

describe('TransactionsTable', () => {
  beforeEach(async () => {
    await db.transactions.clear()
    await db.categories.clear()
  })

  it('renders transactions with category names', async () => {
    await db.categories.add({ id: 1, name: 'food' })
    await db.transactions.add({ id: 1, amount: 10, description: 'coffee', categoryId: 1, importedAt: 0 })

    render(<TransactionsTable />)

    expect(await screen.findByText('coffee')).toBeInTheDocument()
    expect(await screen.findByText('food')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows an empty state when there are no transactions', async () => {
    render(<TransactionsTable />)

    expect(await screen.findByText('No transactions')).toBeInTheDocument()
  })
})