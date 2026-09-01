import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Modal } from '../../components/Modal/Modal.tsx'
import { db } from '../../db.ts'
import type { Category } from '../Category.ts'
import { CategoryEditForm } from './CategoryEditForm/CategoryEditForm.tsx'
import { CategoryForm } from './CategoryForm/CategoryForm.tsx'
import styles from './Categories.module.css'

const categoryExists = async (rawName: string, excludeId?: number) => {
  const existing = await db.categories.toArray()
  const normalized = rawName.trim().toLowerCase()
  return existing.some(
    (category) => category.id !== excludeId && category.name.toLowerCase() === normalized,
  )
}

const Categories = () => {
  const data = useLiveQuery(
    async () => {
      const [categories, transactions] = await Promise.all([
        db.categories.toArray(),
        db.transactions.toArray(),
      ])
      return { categories, transactions }
    },
    [],
    { categories: [] as Category[], transactions: [] },
  )

  const [name, setName] = useState('')
  const [matcher, setMatcher] = useState('')
  const [addError, setAddError] = useState('')
  const [editing, setEditing] = useState<Category | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState<Category | null>(null)

  const txCounts = new Map<number, number>()
  for (const transaction of data.transactions) {
    if (transaction.categoryId !== null) {
      txCounts.set(transaction.categoryId, (txCounts.get(transaction.categoryId) ?? 0) + 1)
    }
  }

  const handleAdd = async () => {
    const trimmedName = name.trim()
    const trimmedMatcher = matcher.trim()
    if (trimmedName === '') {
      setAddError('Category name is empty')
      return
    }
    if (trimmedMatcher === '') {
      setAddError('Matcher must not be empty')
      return
    }
    if (await categoryExists(trimmedName)) {
      setAddError('Category with this name already exists')
      return
    }
    await db.categories.add({ name: trimmedName, matcher: trimmedMatcher })
    setName('')
    setMatcher('')
    setAddError('')
  }

  const handleDelete = async () => {
    if (!confirmingDelete) {
      return
    }
    await db.categories.delete(confirmingDelete.id)
    setConfirmingDelete(null)
  }

  return (
    <div className={styles.layout}>
      <CategoryForm
        name={name}
        matcher={matcher}
        error={addError}
        submitLabel="Add"
        onNameChange={(value) => {
          setName(value)
          setAddError('')
        }}
        onMatcherChange={(value) => {
          setMatcher(value)
          setAddError('')
        }}
        onSubmit={() => void handleAdd()}
      />
      {data.categories.length === 0 ? (
        <p className={styles.empty}>No categories</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Transactions</th>
              <th>Patterns</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>{txCounts.get(category.id) ?? 0}</td>
                <td className={styles.patterns}>{category.matcher.split(';').map((pattern) => pattern.trim()).filter(Boolean).join(', ')}</td>
                <td className={styles.actions}>
                  <button type="button" onClick={() => setEditing(category)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={(txCounts.get(category.id) ?? 0) > 0}
                    onClick={() => setConfirmingDelete(category)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editing ? (
        <Modal title="Edit category" onClose={() => setEditing(null)}>
          <CategoryEditForm category={editing} onClose={() => setEditing(null)} />
        </Modal>
      ) : null}
      {confirmingDelete ? (
        <Modal title="Delete category" onClose={() => setConfirmingDelete(null)}>
          <p>Delete category "{confirmingDelete.name}"?</p>
          <div className={styles.modalActions}>
            <button type="button" onClick={() => setConfirmingDelete(null)}>
              No
            </button>
            <button type="button" onClick={() => void handleDelete()}>
              Yes, delete
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

export { Categories }