import { useEffect } from 'react'
import './App.css'
import styles from './App.module.css'
import { CSVInputPreview } from '../views/input/CSVInputPreview.tsx'
import { TransactionsTable } from '../views/table/TransactionsTable.tsx'
import { DataByPeriod } from '../views/data-by-period/DataByPeriod.tsx'
import { CumulativeBarChart } from '../views/data-cumulative/CumulativeBarChart.tsx'
import { Categories } from '../views/categories/Categories.tsx'
import { Budget } from '../views/budget/Budget.tsx'
import { useStore, useAllRules, useSummaries, } from '../store/useStore.ts'
import { ErrorBoundary } from "../components/ErrorBoundary/ErrorBoundary.tsx"
import { Sidebar } from "../components/Sidebar/Sidebar.tsx"

const App = () => {
  const view = useStore((state) => state.view)
  const transactions = useStore((state) => state.transactions)
  const selectedMonth = useStore((state) => state.selectedMonth)
  const customRules = useStore((state) => state.customRules)

  const setSelectedMonth = useStore((state) => state.setSelectedMonth)
  const updateCategory = useStore((state) => state.updateCategory)
  const removeCategory = useStore((state) => state.removeCategory)
  const renameCategory = useStore((state) => state.renameCategory)
  const replaceCategories = useStore((state) => state.replaceCategories)

  const allRules = useAllRules()
  const summaries = useSummaries()

  useEffect(() => {
    if (summaries && summaries.length > 0) {
      const firstSummary = summaries[0]
      if (!firstSummary) return
      
      if (selectedMonth === null) {
        // Set to first available month if not set
        setSelectedMonth({ year: firstSummary.year, month: firstSummary.month })
      } else {
        // Validate that the selected month exists in the summaries
        const monthExists = summaries.some(
          (s) => s.year === selectedMonth.year && s.month === selectedMonth.month
        )
        if (!monthExists) {
          // If selected month doesn't exist, set to first available
          setSelectedMonth({ year: firstSummary.year, month: firstSummary.month })
        }
      }
    } else if (summaries === null || summaries.length === 0) {
      setSelectedMonth(null)
    }
  }, [summaries, selectedMonth, setSelectedMonth])

  return (
    <ErrorBoundary>
    <div className={styles['appContainer']}>
      <Sidebar />

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

        {view === 'summary' && summaries && selectedMonth && (
          <DataByPeriod
            summaries={summaries}
            selectedMonth={selectedMonth}
            transactions={transactions}
            onSelectionChange={(type, year, month) => {
              if (type === 'month' && year && month) {
                setSelectedMonth({ year, month })
              }
            }}
            onBack={() => {}}
            onNext={() => {}}
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
