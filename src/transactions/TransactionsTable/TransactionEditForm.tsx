import { useState } from 'react'
import { db } from '../../db.ts'
import type { Category } from '../../categories/Category.ts'
import type { Transaction } from '../Transaction.ts'
import { formatDate } from '../../core/formatDate.ts'
import styles from './TransactionEditForm.module.css'

const TransactionEditForm = ({ transaction, categories, onClose }: {
  transaction: Transaction
  categories: Category[]
  onClose: () => void
}) => {
  const originalDate = transaction.date
  const originalCategoryId = transaction.categoryId
  const originalCategory = categories.find((c) => c.id === originalCategoryId)?.name ?? 'No category'

  const hasCustomDate = transaction.customDate != null
  const hasCustomCategory = transaction.customCategoryId != null

  const [overrideDate, setOverrideDate] = useState(hasCustomDate)
  const [overrideCategory, setOverrideCategory] = useState(hasCustomCategory)
  const [customDate, setCustomDate] = useState(transaction.customDate ?? transaction.date)
  const initialCustomCategoryId = (() => {
    if (transaction.customCategoryId != null) {
      return String(transaction.customCategoryId)
    }
    if (originalCategoryId !== null) {
      return String(originalCategoryId)
    }
    return ''
  })()
  const [customCategoryId, setCustomCategoryId] = useState(initialCustomCategoryId)
  const [comment, setComment] = useState(transaction.comment ?? '')
  const [error, setError] = useState('')

  const handleSave = async () => {
    const trimmedComment = comment.trim()
    const normalizedComment = trimmedComment === '' ? null : trimmedComment

    let normalizedDate: string | null = null
    if (overrideDate) {
      if (customDate === '') {
        setError('Custom date is required when override is checked')
        return
      }
      const valid = /^\d{4}-\d{2}-\d{2}$/.test(customDate)
      if (!valid) {
        setError('Invalid date')
        return
      }
      normalizedDate = customDate
    }

    let normalizedCategoryId: number | null = null
    if (overrideCategory) {
      if (customCategoryId === '') {
        normalizedCategoryId = null
      } else {
        const parsed = Number(customCategoryId)
        if (Number.isNaN(parsed)) {
          setError('Invalid category')
          return
        }
        const exists = categories.some((c) => c.id === parsed)
        if (!exists) {
          setError('Category does not exist')
          return
        }
        normalizedCategoryId = parsed
      }
    }

    await db.transactions.update(transaction.id, {
      customDate: normalizedDate,
      customCategoryId: normalizedCategoryId,
      comment: normalizedComment,
    })
    onClose()
  }

  const handleClear = () => {
    setOverrideDate(false)
    setOverrideCategory(false)
    setCustomDate('')
    setCustomCategoryId('')
    setComment('')
    setError('')
  }

  return (
    <div className={styles.form}>
      <div className={styles.row}>
        <span className={styles.label}>Date: {formatDate(originalDate)}</span>
        <label className={styles.checkbox}>
          <input type="checkbox" checked={overrideDate} onChange={(e) => setOverrideDate(e.target.checked)} />
          <span>Override</span>
        </label>
      </div>
      <label className={styles.field}>
        <span>Custom date</span>
        <input
          type="date"
          value={customDate}
          disabled={!overrideDate}
          onChange={(event) => {
            setCustomDate(event.target.value)
            setError('')
          }}
        />
      </label>

      <div className={styles.row}>
        <span className={styles.label}>Category: {originalCategory}</span>
        <label className={styles.checkbox}>
          <input type="checkbox" checked={overrideCategory} onChange={(e) => setOverrideCategory(e.target.checked)} />
          <span>Override</span>
        </label>
      </div>
      <label className={styles.field}>
        <span>Custom category</span>
        <select
          value={customCategoryId}
          disabled={!overrideCategory}
          onChange={(event) => {
            setCustomCategoryId(event.target.value)
            setError('')
          }}
        >
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span>Comment</span>
        <textarea
          value={comment}
          onChange={(event) => {
            setComment(event.target.value)
            setError('')
          }}
          rows={3}
          placeholder="Empty means no comment"
        />
      </label>
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.actions}>
        <button type="button" onClick={() => void handleClear()}>
          Clear
        </button>
        <button type="button" onClick={() => void handleSave()}>
          Save
        </button>
      </div>
    </div>
  )
}

export { TransactionEditForm }
