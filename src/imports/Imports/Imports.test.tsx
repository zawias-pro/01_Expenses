import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAppStore } from '../../appStore.ts'
import { db } from '../../db.ts'
import { Imports } from './Imports.tsx'

describe('Imports', () => {
  beforeEach(async () => {
    useAppStore.setState({
      view: 'table',
      amountFilter: { min: '', max: '' },
      categoryFilter: new Set(),
      accountFilter: new Set(),
      descriptionFilter: '',
      importedAtFilter: { from: '', to: '' },
      importNameFilter: new Set(),
    })
    await db.transactions.clear()
  })

  it('groups transactions by import name and timestamp', async () => {
    await db.transactions.bulkAdd([
      { id: 1, amount: 10, description: 'a', categoryId: null, accountId: null, importName: 'January', date: new Date(0).toISOString(), importedAt: 1000 },
      { id: 2, amount: 20, description: 'b', categoryId: null, accountId: null, importName: 'January', date: new Date(0).toISOString(), importedAt: 1000 },
      { id: 3, amount: 30, description: 'c', categoryId: null, accountId: null, importName: 'February', date: new Date(0).toISOString(), importedAt: 2000 },
      { id: 4, amount: 40, description: 'd', categoryId: null, accountId: null, importName: null, date: new Date(0).toISOString(), importedAt: 3000 },
    ])

    render(<Imports />)

    expect(await screen.findByText('January')).toBeInTheDocument()
    expect(screen.getByText('February')).toBeInTheDocument()
    expect(screen.getByText('Unnamed import')).toBeInTheDocument()
  })

  it('focuses an import: goes to table view, resets filters, sets importedAt range', async () => {
    const user = userEvent.setup()
    await db.transactions.bulkAdd([
      { id: 1, amount: 10, description: 'a', categoryId: null, accountId: null, importName: 'January', date: new Date(0).toISOString(), importedAt: 1000 },
      { id: 2, amount: 20, description: 'b', categoryId: null, accountId: null, importName: 'February', date: new Date(0).toISOString(), importedAt: 2000 },
    ])

    useAppStore.getState().setDescriptionFilter('foo')
    useAppStore.getState().setCategoryFilter(new Set(['1']))

    render(<Imports />)
    const januaryRow = (await screen.findByText('January')).closest('tr')!
    await user.click(within(januaryRow).getByRole('button', { name: 'Focus' }))

    const state = useAppStore.getState()
    expect(state.view).toBe('table')
    expect(state.descriptionFilter).toBe('')
    expect(state.categoryFilter.size).toBe(0)
    expect(state.importedAtFilter).toEqual({ from: expect.any(String), to: expect.any(String) })
    expect(state.importedAtFilter.from).toBe(state.importedAtFilter.to)
  })
})