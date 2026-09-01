import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateFilterForm } from './DateFilterForm.tsx'

describe('DateFilterForm', () => {
  it('applies the entered from and to dates', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    render(<DateFilterForm filter={{ from: '', to: '' }} onApply={onApply} onClose={() => {}} />)

    await user.type(screen.getByLabelText('From'), '2026-01-01')
    await user.type(screen.getByLabelText('To'), '2026-01-31')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onApply).toHaveBeenCalledWith({ from: '2026-01-01', to: '2026-01-31' })
  })

  it('clears the draft without applying', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    render(<DateFilterForm filter={{ from: '2026-01-01', to: '2026-01-31' }} onApply={onApply} onClose={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Clear' }))
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onApply).toHaveBeenCalledWith({ from: '', to: '' })
  })
})