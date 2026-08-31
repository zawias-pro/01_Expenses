import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DescriptionFilterForm } from './DescriptionFilterForm.tsx'

describe('DescriptionFilterForm', () => {
  it('applies the entered keyword', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    const onClose = vi.fn()
    render(<DescriptionFilterForm value="" onApply={onApply} onClose={onClose} />)

    await user.type(screen.getByPlaceholderText('e.g. TEST-*'), 'coffee')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onApply).toHaveBeenCalledWith('coffee')
    expect(onClose).toHaveBeenCalled()
  })

  it('clears the draft without applying', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    render(<DescriptionFilterForm value="abc" onApply={onApply} onClose={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Clear' }))
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onApply).toHaveBeenCalledTimes(1)
    expect(onApply).toHaveBeenCalledWith('')
  })
})