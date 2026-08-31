import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Modal } from '../../components/Modal/Modal.tsx'
import { db } from '../../db.ts'
import styles from './Accounts.module.css'

const MAX_NAME_LENGTH = 1000

const validateName = async (rawName: string, accounts: { id: number; name: string }[]) => {
  const name = rawName.trim()
  if (name === '') {
    return 'Account name is empty'
  }
  if (name.length > MAX_NAME_LENGTH) {
    return `Account name is too long (max ${MAX_NAME_LENGTH} characters)`
  }
  const normalized = name.toLowerCase()
  if (accounts.some((account) => account.name.toLowerCase() === normalized)) {
    return 'Account with this name already exists'
  }
  return ''
}

const Accounts = () => {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const accounts = useLiveQuery(() => db.accounts.toArray(), [], [])

  const handleAdd = async () => {
    const validationError = await validateName(name, accounts)
    if (validationError) {
      setError(validationError)
      return
    }
    await db.accounts.add({ name: name.trim() })
    setName('')
    setError('')
  }

  return (
    <div className={styles.layout}>
      <div className={styles.form}>
        <input
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setError('')
          }}
          placeholder="Account name"
        />
        <button type="button" onClick={handleAdd}>
          Add
        </button>
      </div>
      {error ? (
        <Modal title="Cannot add account" onClose={() => setError('')}>
          <p>{error}</p>
        </Modal>
      ) : null}
      <ul className={styles.list}>
        {accounts.length === 0 ? (
          <li className={styles.empty}>No accounts</li>
        ) : (
          accounts.map((account) => <li key={account.id}>{account.name}</li>)
        )}
      </ul>
    </div>
  )
}

export { Accounts }