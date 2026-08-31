import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FilterButton } from './FilterButton.tsx'

describe('FilterButton', () => {
  it('renders the label and is not active by default', () => {
    render(<FilterButton active={false} label="Filter" title="Filter by amount" onClick={() => {}} />)

    const button = screen.getByRole('button', { name: 'Filter by amount' })
    expect(button.textContent).toBe('Filter')
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows the active state when filtering is applied', () => {
    render(<FilterButton active label="Filter" title="Filter by amount" onClick={() => {}} />)

    expect(screen.getByRole('button', { name: 'Filter by amount' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<FilterButton active={false} label="Filter" title="Filter by amount" onClick={onClick} />)

    screen.getByRole('button', { name: 'Filter by amount' }).click()

    expect(onClick).toHaveBeenCalled()
  })
})