import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AmountFilterForm } from './AmountFilterForm.tsx'

describe('AmountFilterForm', () => {
  it('applies the entered min and max', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    const onClose = vi.fn()
    render(<AmountFilterForm filter={{ min: '', max: '' }} onApply={onApply} onClose={onClose} />)

    await user.type(screen.getByLabelText('Min amount'), '10')
    await user.type(screen.getByLabelText('Max amount'), '50')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onApply).toHaveBeenCalledWith({ min: '10', max: '50' })
    expect(onClose).toHaveBeenCalled()
  })

  it('clears the filter', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    const onClose = vi.fn()
    render(<AmountFilterForm filter={{ min: '10', max: '50' }} onApply={onApply} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onApply).toHaveBeenCalledWith({ min: '', max: '' })
    expect(onClose).toHaveBeenCalled()
  })

  it('trims whitespace from values', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    render(<AmountFilterForm filter={{ min: '', max: '' }} onApply={onApply} onClose={() => {}} />)

    await user.type(screen.getByLabelText('Min amount'), ' 10 ')
    await user.type(screen.getByLabelText('Max amount'), ' 50 ')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onApply).toHaveBeenCalledWith({ min: '10', max: '50' })
  })
})