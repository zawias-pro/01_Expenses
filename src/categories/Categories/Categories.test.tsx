import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { db } from '../../db.ts'
import { Categories } from './Categories.tsx'

describe('Categories', () => {
  beforeEach(async () => {
    await db.categories.clear()
    await db.transactions.clear()
    await db.imports.clear()
  })

  it('adds a category via the form', async () => {
    const user = userEvent.setup()
    render(<Categories />)

    await user.type(screen.getByLabelText('Name'), 'Food')
    await user.type(screen.getByLabelText('Matcher'), 'coffee;lunch')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Food')).toBeInTheDocument()
    const imports = await db.categories.toArray()
    expect(imports).toHaveLength(1)
    expect(imports[0].matcher).toBe('coffee;lunch')
  })

  it('rejects empty matcher inline', async () => {
    const user = userEvent.setup()
    render(<Categories />)

    await user.type(screen.getByLabelText('Name'), 'Food')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Matcher must not be empty')).toBeInTheDocument()
    expect(await db.categories.count()).toBe(0)
  })

  it('rejects empty name inline', async () => {
    const user = userEvent.setup()
    render(<Categories />)

    await user.type(screen.getByLabelText('Matcher'), 'coffee')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Category name is empty')).toBeInTheDocument()
    expect(await db.categories.count()).toBe(0)
  })

  it('rejects a duplicate name', async () => {
    const user = userEvent.setup()
    await db.categories.add({ name: 'Food', matcher: 'coffee' })
    render(<Categories />)
    await screen.findByText('Food')

    await user.type(screen.getByLabelText('Name'), 'food')
    await user.type(screen.getByLabelText('Matcher'), 'tea')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Category with this name already exists')).toBeInTheDocument()
    expect(await db.categories.count()).toBe(1)
  })

  it('shows patterns split on semicolon', async () => {
    await db.categories.add({ name: 'Coop', matcher: 'coop; COOP*;' })

    render(<Categories />)
    const row = (await screen.findByText('Coop')).closest('tr')!
    expect(within(row).getByText('coop, COOP*')).toBeInTheDocument()
  })

  it('edits a category via the modal', async () => {
    const user = userEvent.setup()
    await db.categories.add({ name: 'Coop', matcher: 'coop' })

    render(<Categories />)
    const row = (await screen.findByText('Coop')).closest('tr')!
    await user.click(within(row).getByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByRole('dialog')
    await user.clear(within(dialog).getByLabelText('Name'))
    await user.type(within(dialog).getByLabelText('Name'), 'Supermarket')
    await user.clear(within(dialog).getByLabelText('Matcher'))
    await user.type(within(dialog).getByLabelText('Matcher'), 'super*')
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))

    expect(await db.categories.toArray()).toEqual([
      expect.objectContaining({ name: 'Supermarket', matcher: 'super*' }),
    ])
    expect(await screen.findByText('Supermarket')).toBeInTheDocument()
  })

  it('disables delete for categories bound to transactions and deletes free ones after confirm', async () => {
    const user = userEvent.setup()
    const importId = await db.imports.add({ importedAt: 0, name: null, accountId: null })
    await db.categories.add({ id: 1, name: 'Used', matcher: 'coffee' })
    await db.transactions.add({
      id: 10,
      amount: 10,
      description: 'coffee',
      categoryId: 1,
      date: '2026-01-01',
      importId,
    })
    await db.categories.add({ id: 2, name: 'Free', matcher: 'tea' })

    render(<Categories />)
    const usedRow = (await screen.findByText('Used')).closest('tr')!
    const freeRow = screen.getByText('Free').closest('tr')!

    expect(within(usedRow).getAllByText('1').length).toBeGreaterThanOrEqual(1)
    expect(within(usedRow).getByRole('button', { name: 'Delete' })).toBeDisabled()

    await user.click(within(freeRow).getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Yes, delete' }))

    expect(screen.queryByText('Free')).not.toBeInTheDocument()
    expect(screen.getByText('Used')).toBeInTheDocument()
    expect(await db.categories.count()).toBe(1)
  })

  it('shows an empty state', async () => {
    render(<Categories />)

    expect(await screen.findByText('No categories')).toBeInTheDocument()
  })
})