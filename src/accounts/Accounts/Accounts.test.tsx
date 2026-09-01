import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { db } from '../../db.ts'
import { Accounts } from './Accounts.tsx'

describe('Accounts', () => {
  beforeEach(async () => {
    await db.accounts.clear()
    await db.imports.clear()
  })

  it('adds an account via the form', async () => {
    const user = userEvent.setup()
    render(<Accounts />)

    await user.type(screen.getByLabelText('Name'), '  Revolut  ')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Revolut')).toBeInTheDocument()
  })

  it('rejects an empty name in a modal', async () => {
    const user = userEvent.setup()
    render(<Accounts />)

    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Account name is empty')).toBeInTheDocument()
    expect(await db.accounts.count()).toBe(0)
  })

  it('rejects a duplicate name case-insensitively in a modal', async () => {
    const user = userEvent.setup()
    await db.accounts.add({ name: 'Revolut' })
    render(<Accounts />)
    await screen.findByText('Revolut')

    await user.type(screen.getByLabelText('Name'), 'revolut')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Account with this name already exists')).toBeInTheDocument()
    expect(await db.accounts.count()).toBe(1)
  })

  it('rejects a name longer than 1000 characters in a modal', async () => {
    const user = userEvent.setup()
    render(<Accounts />)

    await user.type(screen.getByLabelText('Name'), 'a'.repeat(1001))
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText(/Account name is too long/)).toBeInTheDocument()
    expect(await db.accounts.count()).toBe(0)
  })

  it('shows an empty state', async () => {
    render(<Accounts />)

    expect(await screen.findByText('No accounts')).toBeInTheDocument()
  })

  it('renames an account via the edit modal', async () => {
    const user = userEvent.setup()
    await db.accounts.add({ name: 'Revolut' })

    render(<Accounts />)
    const row = (await screen.findByText('Revolut')).closest('tr')!
    await user.click(within(row).getByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByRole('dialog')
    await user.clear(within(dialog).getByLabelText('Name'))
    await user.type(within(dialog).getByLabelText('Name'), 'Revolut PRO')
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))

    expect(await db.accounts.toArray()).toEqual([expect.objectContaining({ name: 'Revolut PRO' })])
    expect(await screen.findByText('Revolut PRO')).toBeInTheDocument()
  })

  it('rejects a duplicate name when renaming', async () => {
    const user = userEvent.setup()
    await db.accounts.add({ id: 1, name: 'Revolut' })
    await db.accounts.add({ id: 2, name: 'ING' })

    render(<Accounts />)
    await screen.findByText('Revolut')
    const row = screen.getByText('Revolut').closest('tr')!
    await user.click(within(row).getByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByRole('dialog')
    await user.clear(within(dialog).getByLabelText('Name'))
    await user.type(within(dialog).getByLabelText('Name'), 'ing')
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))

    expect(await within(dialog).findByText('Account with this name already exists')).toBeInTheDocument()
  })

  it('shows import counts and disables delete for accounts with imports', async () => {
    const user = userEvent.setup()
    await db.accounts.add({ id: 1, name: 'Busy' })
    await db.imports.add({ importedAt: 0, name: null, accountId: 1 })
    await db.imports.add({ importedAt: 1, name: null, accountId: 1 })
    await db.accounts.add({ id: 2, name: 'Free' })

    render(<Accounts />)
    const busyRow = (await screen.findByText('Busy')).closest('tr')!
    const freeRow = screen.getByText('Free').closest('tr')!

    expect(within(busyRow).getByText('2')).toBeInTheDocument()
    expect(within(busyRow).getByRole('button', { name: 'Delete' })).toBeDisabled()
    expect(within(freeRow).getByRole('button', { name: 'Delete' })).toBeEnabled()

    await user.click(within(freeRow).getByRole('button', { name: 'Delete' }))
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Yes, delete' }))

    expect(screen.queryByText('Free')).not.toBeInTheDocument()
    expect(screen.getByText('Busy')).toBeInTheDocument()
    expect(await db.accounts.count()).toBe(1)
  })
})