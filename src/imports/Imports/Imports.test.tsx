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
      dateFilter: { from: '', to: '' },
      importFilter: new Set(),
    })
    await db.transactions.clear()
    await db.imports.clear()
    await db.accounts.clear()
    txSeq = 0
  })

  let txSeq = 0

  const seed = async (importOverrides: { name?: string | null; importedAt?: number; accountId?: number | null }, txCount = 1) => {
    const importedAt = importOverrides.importedAt ?? 1000
    const importId = await db.imports.add({
      importedAt,
      name: 'name' in importOverrides ? (importOverrides.name as string | null) : 'seed',
      accountId: importOverrides.accountId ?? null,
    })
    const nextIds = Array.from({ length: txCount }, () => {
      txSeq += 1
      return txSeq
    })
    await db.transactions.bulkAdd(
      nextIds.map((id, index) => ({
        id,
        amount: 10 * (index + 1),
        description: `tx-${id}`,
        categoryId: null,
        date: '2026-01-01',
        importId,
      })),
    )
    return importId
  }

  it('lists imports with names, timestamps, counts and accounts', async () => {
    await db.accounts.add({ id: 1, name: 'Revolut' })
    const janId = await seed({ name: 'January', importedAt: 1000, accountId: 1 }, 2)
    await seed({ name: 'February', importedAt: 2000 })
    await seed({ name: null, importedAt: 3000 })

    render(<Imports />)

    expect(await screen.findByText('January')).toBeInTheDocument()
    expect(screen.getByText('February')).toBeInTheDocument()
    expect(screen.getByText('Unnamed import')).toBeInTheDocument()
    expect(screen.getByText('Revolut')).toBeInTheDocument()

    const unnamedRow = screen.getByText('Unnamed import').closest('tr')!
    expect(within(unnamedRow).getByText('No account')).toBeInTheDocument()

    const janRow = screen.getByText('January').closest('tr')!
    expect(within(janRow).getByText('2')).toBeInTheDocument()
    expect(janId).toBeGreaterThan(0)
  })

  it('shows the import id column', async () => {
    const id = await seed({ name: 'January', importedAt: 1000 })

    render(<Imports />)
    const janRow = (await screen.findByText('January')).closest('tr')!
    expect(within(janRow).getByText(String(id))).toBeInTheDocument()
  })

  it('deletes only imports with no transactions, after confirmation', async () => {
    const user = userEvent.setup()
    await seed({ name: 'Empty', importedAt: 1000 }, 0)
    await seed({ name: 'Full', importedAt: 2000 }, 2)

    render(<Imports />)
    const emptyRow = (await screen.findByText('Empty')).closest('tr')!
    const fullRow = screen.getByText('Full').closest('tr')!

    expect(within(emptyRow).getByRole('button', { name: 'Delete' })).toBeEnabled()
    expect(within(fullRow).getByRole('button', { name: 'Delete' })).toBeDisabled()

    await user.click(within(emptyRow).getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Yes, delete' }))

    expect(await screen.findByText('Full')).toBeInTheDocument()
    expect(screen.queryByText('Empty')).not.toBeInTheDocument()
    expect(await db.imports.count()).toBe(1)
  })

  it('keeps the import when delete is cancelled', async () => {
    const user = userEvent.setup()
    await seed({ name: 'Empty', importedAt: 1000 }, 0)

    render(<Imports />)
    const emptyRow = (await screen.findByText('Empty')).closest('tr')!
    await user.click(within(emptyRow).getByRole('button', { name: 'Delete' }))
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'No' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await db.imports.count()).toBe(1)
  })

  it('focuses an import: goes to table view, resets filters, sets import filter', async () => {
    const user = userEvent.setup()
    const importId = await seed({ name: 'January', importedAt: 1000 })

    useAppStore.getState().setDescriptionFilter('foo')
    useAppStore.getState().setCategoryFilter(new Set(['1']))

    render(<Imports />)
    const januaryRow = (await screen.findByText('January')).closest('tr')!
    await user.click(within(januaryRow).getByRole('button', { name: 'Focus' }))

    const state = useAppStore.getState()
    expect(state.view).toBe('table')
    expect(state.descriptionFilter).toBe('')
    expect(state.categoryFilter.size).toBe(0)
    expect(state.importFilter).toEqual(new Set([String(importId)]))
  })

  it('renames an import with a name and account', async () => {
    const user = userEvent.setup()
    await db.accounts.add({ id: 1, name: 'Revolut' })
    await seed({ name: 'January', importedAt: 1000 })

    render(<Imports />)
    const januaryRow = (await screen.findByText('January')).closest('tr')!
    await user.click(within(januaryRow).getByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByRole('dialog')
    await user.clear(within(dialog).getByLabelText('Name'))
    await user.type(within(dialog).getByLabelText('Name'), 'February 2026')
    await user.selectOptions(within(dialog).getByLabelText('Account'), '1')
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))

    const imports = await db.imports.toArray()
    expect(imports).toHaveLength(1)
    expect(imports[0].name).toBe('February 2026')
    expect(imports[0].accountId).toBe(1)
  })

  it('allows clearing the name to become an unnamed import', async () => {
    const user = userEvent.setup()
    await seed({ name: 'January', importedAt: 1000 })

    render(<Imports />)
    const januaryRow = (await screen.findByText('January')).closest('tr')!
    await user.click(within(januaryRow).getByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByRole('dialog')
    await user.clear(within(dialog).getByLabelText('Name'))
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))

    const imports = await db.imports.toArray()
    expect(imports[0].name).toBeNull()
  })
})