import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Modal } from '../../components/Modal/Modal.tsx'
import { db } from '../../db.ts'
import { categoryMatchesDescription } from '../../transactions/classify.ts'
import styles from './TopBar.module.css'

const classifyAllTransactions = async () => {
  const [transactions, categories] = await Promise.all([
    db.transactions.toArray(),
    db.categories.toArray(),
  ])
  for (const transaction of transactions) {
    const category = categories.find((category) =>
      categoryMatchesDescription(category.matcher, transaction.description),
    )
    if (category) {
      await db.transactions.update(transaction.id, { categoryId: category.id })
    } else {
      await db.transactions.update(transaction.id, { categoryId: null })
    }
  }
}

const TopBar = () => {
  const transactionCount = useLiveQuery(() => db.transactions.count(), [], 0)
  const categoryCount = useLiveQuery(() => db.categories.count(), [], 0)

  const [classifyState, setClassifyState] = useState<'idle' | 'running' | 'done'>('idle')

  const handleClassify = async () => {
    setClassifyState('running')
    try {
      await classifyAllTransactions()
    } finally {
      setClassifyState('done')
    }
  }

  return (
    <header className={styles.topbar}>
      <span className={styles.count}>Transactions: {transactionCount}</span>
      <span className={styles.count}>Categories: {categoryCount}</span>
      <button type="button" onClick={() => void handleClassify()}>
        Classify
      </button>
      {classifyState !== 'idle' ? (
        <Modal
          title="Classifying transactions"
          onClose={() => setClassifyState('idle')}
          closable={classifyState === 'done'}
        >
          {classifyState === 'running' ? <p>Classifying…</p> : <p>Done</p>}
        </Modal>
      ) : null}
    </header>
  )
}

export { TopBar }