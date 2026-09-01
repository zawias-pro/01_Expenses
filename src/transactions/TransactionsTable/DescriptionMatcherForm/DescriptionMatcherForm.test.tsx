import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DescriptionMatcherForm } from './DescriptionMatcherForm.tsx'
import type { Category } from '../../../categories/Category.ts'

const categories: Category[] = [
  { id: 1, name: 'Food', matcher: 'coffee' },
]

describe('DescriptionMatcherForm', () => {
  it('saves a pattern to an existing category', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue('')
    const onClose = vi.fn()
    render(
      <DescriptionMatcherForm
        pattern="*cafe*"
        categoryName="cafe"
        categories={categories}
        onSave={onSave}
        onClose={onClose}
      />,
    )

    await user.selectOptions(screen.getByLabelText('Category'), '1')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith({ categoryId: 1 }, '*cafe*')
    expect(onClose).toHaveBeenCalled()
  })

  it('creates a new category when New category is selected', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue('')
    const onClose = vi.fn()
    render(
      <DescriptionMatcherForm
        pattern="*cafe*"
        categoryName="cafe"
        categories={categories}
        onSave={onSave}
        onClose={onClose}
      />,
    )

    expect(screen.getByLabelText('Category name')).toHaveValue('cafe')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith({ newName: 'cafe' }, '*cafe*')
    expect(onClose).toHaveBeenCalled()
  })

  it('passes through a category name error from onSave', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue('Category with this name already exists')
    render(
      <DescriptionMatcherForm
        pattern="*cafe*"
        categoryName="cafe"
        categories={categories}
        onSave={onSave}
        onClose={() => {}}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Category with this name already exists')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Discard' })).toBeInTheDocument()
  })
})