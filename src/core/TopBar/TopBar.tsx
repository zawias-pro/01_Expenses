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

const formatAmount = (value: number) => value.toFixed(2).replace('.', ',')

const TopBar = () => {
  const stats = useLiveQuery(async () => {
    const transactions = (await db.transactions.toArray()).filter((tx) => !tx.ignored)
    const total = transactions.length
    let unclassifiedCount = 0
    let totalAmount = 0
    let unclassifiedAmount = 0
    for (const tx of transactions) {
      const effectiveCategoryId = (tx.customCategoryId ?? null) !== null ? (tx.customCategoryId as number) : tx.categoryId
      const isUnclassified = effectiveCategoryId === null
      if (isUnclassified) {
        unclassifiedCount += 1
        unclassifiedAmount += tx.amount
      }
      totalAmount += tx.amount
    }
    return { total, unclassifiedCount, totalAmount, unclassifiedAmount }
  }, [], { total: 0, unclassifiedCount: 0, totalAmount: 0, unclassifiedAmount: 0 })
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
      <span className={styles.count}>
        Transactions: {stats.total} ({stats.unclassifiedCount} unclassified)
      </span>
      <span className={styles.count}>
        Amount: {formatAmount(stats.totalAmount)} ({formatAmount(stats.unclassifiedAmount)} unclassified)
      </span>
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