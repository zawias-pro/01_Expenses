import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { db } from '../../db.ts'
import { TopBar } from './TopBar.tsx'

describe('TopBar', () => {
  beforeEach(async () => {
    await db.transactions.clear()
    await db.categories.clear()
  })

  it('shows transaction and category counts', async () => {
    await db.transactions.add({ amount: 10, description: 'coffee', categoryId: null, importedAt: 0, accountId: null })
    await db.categories.add({ name: 'food' })

    render(<TopBar />)

    expect(await screen.findByText('Transactions: 1')).toBeInTheDocument()
    expect(await screen.findByText('Categories: 1')).toBeInTheDocument()
  })
})