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

let importSeq = 0

const seedImport = async (overrides: { name?: string | null; importedAt?: number; accountId?: number | null } = {}) => {
  importSeq += 1
  const importedAt = overrides.importedAt ?? importSeq * 1000
  const name = 'name' in overrides ? (overrides.name as string | null) : `import-${importSeq}`
  return db.imports.add({
    importedAt,
    name,
    accountId: overrides.accountId ?? null,
  })
}

const seedTx = async (id: number, amount: number, description: string, extra: {
  categoryId?: number | null
  date?: string
  importId?: number
} = {}) => {
  const importId = extra.importId ?? (await seedImport())
  return db.transactions.add({
    id,
    amount,
    description,
    categoryId: extra.categoryId ?? null,
    date: extra.date ?? '1970-01-01',
    importId,
  })
}

describe('TransactionsTable', () => {
  beforeEach(async () => {
    resetFilters()
    await db.transactions.clear()
    await db.categories.clear()
    await db.accounts.clear()
    await db.imports.clear()
    importSeq = 0
  })

  it('renders transactions with category and account names', async () => {
    await db.categories.add({ id: 1, name: 'food' })
    await db.accounts.add({ id: 1, name: 'Revolut' })
    const importId = await db.imports.add({ importedAt: 0, name: 'import-1', accountId: 1 })
    await seedTx(1, 10, 'coffee', { categoryId: 1, importId })

    render(<TransactionsTable />)

    expect(await screen.findByText('coffee')).toBeInTheDocument()
    expect(await screen.findByText('food')).toBeInTheDocument()
    expect(screen.getByText('Revolut')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('filters by amount via the modal', async () => {
    const user = userEvent.setup()
    await seedTx(1, 10, 'low')
    await seedTx(2, 50, 'mid')
    await seedTx(3, 90, 'high')

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
    await seedTx(1, 10, 'lunch', { categoryId: 1 })
    await seedTx(2, 20, 'bus', { categoryId: 2 })
    await seedTx(3, 30, 'none')

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
    const withAccountImportId = await db.imports.add({ importedAt: 1000, name: 'with-import', accountId: 1 })
    const noAccountImportId = await db.imports.add({ importedAt: 2000, name: 'without-import', accountId: null })
    await seedTx(1, 10, 'with', { importId: withAccountImportId })
    await seedTx(2, 20, 'without', { importId: noAccountImportId })

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
    await seedTx(1, 10, 'TEST-0001')
    await seedTx(2, 20, 'TEST-0002')
    await seedTx(3, 30, 'Coffee')

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
    const namedImportId = await seedImport({ name: 'January', importedAt: 1000 })
    const unnamedImportId = await seedImport({ name: null, importedAt: 2000 })
    await seedTx(1, 10, 'jan', { importId: namedImportId })
    await seedTx(2, 20, 'unnamed', { importId: unnamedImportId })

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
    const janImportId = await seedImport({ name: 'January', importedAt })
    const febImportId = await seedImport({ name: 'February', importedAt: otherImportedAt })
    await seedTx(1, 10, 'sel', { importId: janImportId })
    await seedTx(2, 20, 'oth', { importId: febImportId })

    useAppStore.getState().focusImport(importedAt)
    render(<TransactionsTable />)

    expect(await screen.findByText('sel')).toBeInTheDocument()
    expect(screen.queryByText('oth')).not.toBeInTheDocument()
  })

  it('filters by date via the modal', async () => {
    const user = userEvent.setup()
    await seedTx(1, 10, 'jan', { date: '2026-01-01' })
    await seedTx(2, 20, 'feb', { date: '2026-02-01' })

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
    await seedTx(1, 10, 'a')
    await seedTx(2, 20, 'b')

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
    await seedTx(1, 10, 'a')

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
})