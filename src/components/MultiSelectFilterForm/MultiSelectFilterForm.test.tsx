import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiSelectFilterForm } from './MultiSelectFilterForm.tsx'

const options = [
  { value: '1', label: 'food' },
  { value: '2', label: 'transport' },
  { value: 'none', label: 'No category' },
]

describe('MultiSelectFilterForm', () => {
  it('applies the checked options', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    const onClose = vi.fn()
    render(<MultiSelectFilterForm options={options} selection={new Set()} onApply={onApply} onClose={onClose} />)

    await user.click(screen.getByLabelText('food'))
    await user.click(screen.getByLabelText('No category'))
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onApply).toHaveBeenCalledTimes(1)
    expect([...onApply.mock.calls[0][0]]).toEqual(['1', 'none'])
    expect(onClose).toHaveBeenCalled()
  })

  it('clears the draft without applying', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    const onClose = vi.fn()
    render(
      <MultiSelectFilterForm
        options={options}
        selection={new Set(['1'])}
        onApply={onApply}
        onClose={onClose}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Clear' }))
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onApply).toHaveBeenCalledTimes(1)
    expect(onApply.mock.calls[0][0].size).toBe(0)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('pre-checks the applied selection', () => {
    render(
      <MultiSelectFilterForm
        options={options}
        selection={new Set(['2'])}
        onApply={() => {}}
        onClose={() => {}}
      />,
    )

    expect(screen.getByLabelText('transport')).toBeChecked()
    expect(screen.getByLabelText('food')).not.toBeChecked()
  })
})