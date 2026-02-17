import { useState } from 'react'
import type { View } from '../store/useStore.ts'
import './App.css'
import styles from './App.module.css'
import { CSVInputPreview } from '../views/input/CSVInputPreview.tsx'
import { TransactionsTable } from '../views/table/TransactionsTable.tsx'
import { DataByPeriod } from '../views/data-by-period/DataByPeriod.tsx'
import { CumulativeBarChart } from '../views/data-cumulative/CumulativeBarChart.tsx'
import { Categories } from '../views/categories/Categories.tsx'
import { Budget } from '../views/budget/Budget.tsx'
import { useStore, useAllRules, useSummaries } from '../store/useStore.ts'
import { ErrorBoundary } from "../components/ErrorBoundary/ErrorBoundary.tsx"
import { Sidebar } from "../components/Sidebar/Sidebar.tsx"

const App = () => {
  const [view, setView] = useState<View>('csv')

  const transactions = useStore((state) => state.transactions)
  const customRules = useStore((state) => state.customRules)
  const updateCategory = useStore((state) => state.updateCategory)
  const removeCategory = useStore((state) => state.removeCategory)
  const renameCategory = useStore((state) => state.renameCategory)
  const replaceCategories = useStore((state) => state.replaceCategories)

  const allRules = useAllRules()
  const summaries = useSummaries()

  return (
    <ErrorBoundary>
    <div className={styles['appContainer']}>
      <Sidebar view={view} onViewChange={setView} />

      {/* Main Content */}
      <div className={styles['mainContent']}>
        <div className={styles['contentContainer']}>
        {view === 'csv' && <CSVInputPreview />}

        {view === 'categories' && (
          <Categories
            rules={allRules}
            customRules={customRules}
            onUpdateCategory={updateCategory}
            onRemoveCategory={removeCategory}
            onRenameCategory={renameCategory}
            onReplaceCategories={replaceCategories}
          />
        )}

        {view === 'transactions' && (
          <TransactionsTable transactions={transactions} />
        )}

        {view === 'summary' && summaries && (
          <DataByPeriod
            summaries={summaries}
            transactions={transactions}
          />
        )}

        {view === 'chart' && summaries && (
          <CumulativeBarChart
            summaries={summaries}
            onBack={() => {}}
          />
        )}

        {view === 'budget' && (
          <Budget />
        )}
        </div>
      </div>
    </div>
    </ErrorBoundary>
  )
}

export { App }
