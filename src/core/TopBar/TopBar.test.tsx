import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { db } from '../../db.ts'
import { TopBar } from './TopBar.tsx'

describe('TopBar', () => {
  beforeEach(async () => {
    await db.transactions.clear()
    await db.categories.clear()
    await db.imports.clear()
  })

  it('shows transaction and category counts', async () => {
    const importId = await db.imports.add({ importedAt: 0, name: null, accountId: null })
    await db.transactions.add({ amount: 10, description: 'coffee', categoryId: null, date: '1970-01-01', importId })
    await db.categories.add({ name: 'food', matcher: 'coffee' })

    render(<TopBar />)

    expect(await screen.findByText('Transactions: 1 (1 unclassified)')).toBeInTheDocument()
    expect(await screen.findByText('Amount: 10,00 (10,00 unclassified)')).toBeInTheDocument()
    expect(await screen.findByText('Categories: 1')).toBeInTheDocument()
  })

  it('classifies transactions and shows a done modal', async () => {
    const user = userEvent.setup()
    const importId = await db.imports.add({ importedAt: 0, name: null, accountId: null })
    await db.transactions.bulkAdd([
      { id: 1, amount: 10, description: 'coffeeshop', categoryId: null, date: '2026-01-01', importId },
      { id: 2, amount: 20, description: 'TEST-0001', categoryId: null, date: '2026-01-01', importId },
      { id: 3, amount: 30, description: 'groceries', categoryId: null, date: '2026-01-01', importId },
    ])
    await db.categories.add({ id: 1, name: 'Coffee', matcher: 'coffee' })
    await db.categories.add({ id: 2, name: 'Tests', matcher: 'TEST-*' })

    render(<TopBar />)
    await user.click(screen.getByRole('button', { name: 'Classify' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Classifying…')).toBeInTheDocument()

    await waitFor(async () => {
      const txs = await db.transactions.toArray()
      expect(txs.find((t) => t.id === 1)?.categoryId).toBe(1)
      expect(txs.find((t) => t.id === 2)?.categoryId).toBe(2)
      expect(txs.find((t) => t.id === 3)?.categoryId).toBeNull()
    })

    expect(await within(dialog).findByText('Done')).toBeInTheDocument()
  })
})