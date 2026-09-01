import { useState } from 'react'
import type { Account } from '../../Account.ts'
import { db } from '../../../db.ts'
import { AccountForm } from '../AccountForm/AccountForm.tsx'

const AccountEditForm = ({ account, onClose }: {
  account: Account
  onClose: () => void
}) => {
  const [name, setName] = useState(account.name)
  const [error, setError] = useState('')

  const apply = async () => {
    const trimmed = name.trim()
    if (trimmed === '') {
      setError('Account name is empty')
      return
    }
    if (trimmed.length > 1000) {
      setError('Account name is too long (max 1000 characters)')
      return
    }
    const normalized = trimmed.toLowerCase()
    const existing = await db.accounts.toArray()
    const clash = existing.some(
      (existingAccount) =>
        existingAccount.id !== account.id && existingAccount.name.toLowerCase() === normalized,
    )
    if (clash) {
      setError('Account with this name already exists')
      return
    }
    await db.accounts.update(account.id, { name: trimmed })
    onClose()
  }

  return (
    <AccountForm
      name={name}
      error={error}
      submitLabel="Save"
      onNameChange={(value) => {
        setName(value)
        setError('')
      }}
      onSubmit={() => void apply()}
    />
  )
}

export { AccountEditForm }