import { useState } from 'react'
import type { Category } from '../../Category.ts'
import { db } from '../../../db.ts'
import { CategoryForm } from '../CategoryForm/CategoryForm.tsx'

const validate = (rawName: string, matcher: string) => {
  const name = rawName.trim()
  if (name === '') {
    return 'Category name is empty'
  }
  if (name.length > 1000) {
    return 'Category name is too long (max 1000 characters)'
  }
  if (matcher.trim() === '') {
    return 'Matcher must not be empty'
  }
  return ''
}

const CategoryEditForm = ({ category, onClose }: {
  category: Category
  onClose: () => void
}) => {
  const [name, setName] = useState(category.name)
  const [matcher, setMatcher] = useState(category.matcher)
  const [error, setError] = useState('')

  const apply = async () => {
    const validationError = validate(name, matcher)
    if (validationError) {
      setError(validationError)
      return
    }
    const trimmed = name.trim()
    const normalized = trimmed.toLowerCase()
    const existing = await db.categories.toArray()
    const clash = existing.some(
      (existingCategory) =>
        existingCategory.id !== category.id &&
        existingCategory.name.toLowerCase() === normalized,
    )
    if (clash) {
      setError('Category with this name already exists')
      return
    }
    await db.categories.update(category.id, { name: trimmed, matcher: matcher.trim() })
    onClose()
  }

  return (
    <CategoryForm
      name={name}
      matcher={matcher}
      error={error}
      submitLabel="Save"
      onNameChange={(value) => {
        setName(value)
        setError('')
      }}
      onMatcherChange={(value) => {
        setMatcher(value)
        setError('')
      }}
      onSubmit={() => void apply()}
    />
  )
}

export { CategoryEditForm }