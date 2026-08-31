import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { db } from '../../db.ts'
import { Accounts } from './Accounts.tsx'

const addAccount = (name: string) => {
  fireEvent.change(screen.getByPlaceholderText('Account name'), { target: { value: name } })
  fireEvent.click(screen.getByRole('button', { name: 'Add' }))
}

describe('Accounts', () => {
  beforeEach(async () => {
    await db.accounts.clear()
  })

  it('adds an account', async () => {
    render(<Accounts />)

    addAccount('  Revolut  ')

    expect(await screen.findByText('Revolut')).toBeInTheDocument()
  })

  it('rejects an empty name in a modal', async () => {
    render(<Accounts />)

    addAccount('   ')

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Account name is empty')).toBeInTheDocument()
    expect(await db.accounts.count()).toBe(0)
  })

  it('rejects a duplicate name case-insensitively in a modal', async () => {
    await db.accounts.add({ name: 'Revolut' })
    render(<Accounts />)
    await screen.findByText('Revolut')

    addAccount('revolut')

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Account with this name already exists')).toBeInTheDocument()
    expect(await db.accounts.count()).toBe(1)
  })

  it('rejects a name longer than 1000 characters in a modal', async () => {
    render(<Accounts />)

    addAccount('a'.repeat(1001))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/Account name is too long/)).toBeInTheDocument()
    expect(await db.accounts.count()).toBe(0)
  })

  it('closes the modal via the close button', async () => {
    render(<Accounts />)

    addAccount('   ')
    await screen.findByRole('dialog')

    fireEvent.click(screen.getByLabelText('Close'))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows an empty state', async () => {
    render(<Accounts />)

    expect(await screen.findByText('No accounts')).toBeInTheDocument()
  })
})