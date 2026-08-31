import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImportedAtFilterForm } from './ImportedAtFilterForm.tsx'

describe('ImportedAtFilterForm', () => {
  it('applies the entered from and to datetimes', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    render(<ImportedAtFilterForm filter={{ from: '', to: '' }} onApply={onApply} onClose={() => {}} />)

    await user.type(screen.getByLabelText('From'), '2026-01-01T10:30')
    await user.type(screen.getByLabelText('To'), '2026-01-31T18:00')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onApply).toHaveBeenCalledWith({ from: '2026-01-01T10:30', to: '2026-01-31T18:00' })
  })

  it('pre-fills both fields from an applied filter', () => {
    render(<ImportedAtFilterForm filter={{ from: '2026-01-05T09:15', to: '2026-01-05T09:15' }} onApply={() => {}} onClose={() => {}} />)

    expect(screen.getByLabelText('From')).toHaveValue('2026-01-05T09:15')
    expect(screen.getByLabelText('To')).toHaveValue('2026-01-05T09:15')
  })

  it('clears the draft without applying', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    render(<ImportedAtFilterForm filter={{ from: '2026-01-01T10:30', to: '2026-01-31T18:00' }} onApply={onApply} onClose={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Clear' }))
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onApply).toHaveBeenCalledWith({ from: '', to: '' })
  })
})