import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Modal } from './Modal.tsx'

describe('Modal', () => {
  it('renders the title and children', () => {
    render(
      <Modal title="Duplicate rows" onClose={() => {}}>
        content here
      </Modal>,
    )

    expect(screen.getByText('Duplicate rows')).toBeInTheDocument()
    expect(screen.getByText('content here')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal title="T" onClose={onClose}>
        x
      </Modal>,
    )

    fireEvent.click(screen.getByLabelText('Close'))

    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onClose when the overlay is clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal title="T" onClose={onClose}>
        x
      </Modal>,
    )

    fireEvent.click(screen.getByRole('dialog').parentElement!)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('hides the close button and ignores Escape when not closable', () => {
    const onClose = vi.fn()
    render(
      <Modal title="T" onClose={onClose} closable={false}>
        x
      </Modal>,
    )

    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not call onClose when clicking inside the dialog', () => {
    const onClose = vi.fn()
    render(
      <Modal title="T" onClose={onClose}>
        x
      </Modal>,
    )

    fireEvent.click(screen.getByRole('dialog'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose on Escape', () => {
    const onClose = vi.fn()
    render(
      <Modal title="T" onClose={onClose}>
        x
      </Modal>,
    )

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onClose).toHaveBeenCalled()
  })
})