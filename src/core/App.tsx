import { useEffect } from 'react'
import './App.css'
import styles from './App.module.css'
import { CSVInputPreview } from '../views/input/CSVInputPreview.tsx'
import { TransactionsTable } from '../views/table/TransactionsTable.tsx'
import { DataByPeriod } from '../views/data-by-period/DataByPeriod.tsx'
import { CumulativeBarChart } from '../views/data-cumulative/CumulativeBarChart.tsx'
import { Categories } from '../views/categories/Categories.tsx'
import { Budget } from '../views/budget/Budget.tsx'
import {
  useStore,
  useAllRules,
  useSummaries,
  exportState,
  importState,
} from '../store/useStore.ts'

const App = () => {
  // Store state
  const view = useStore((state) => state.view)
  const transactions = useStore((state) => state.transactions)
  const selectedMonth = useStore((state) => state.selectedMonth)
  const customRules = useStore((state) => state.customRules)
  const categoryMetadata = useStore((state) => state.categoryMetadata)
  
  // Store actions
  const setView = useStore((state) => state.setView)
  const setTransactions = useStore((state) => state.setTransactions)
  const setSelectedMonth = useStore((state) => state.setSelectedMonth)
  const updateCategory = useStore((state) => state.updateCategory)
  const removeCategory = useStore((state) => state.removeCategory)
  const renameCategory = useStore((state) => state.renameCategory)
  const replaceCategories = useStore((state) => state.replaceCategories)
  const clearAll = useStore((state) => state.clearAll)
  
  // Computed values
  const allRules = useAllRules()
  const summaries = useSummaries()
  
  // Validate selectedMonth when summaries change
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

  const handleSave = () => {
    // Zustand persist middleware handles saving automatically
    // This button can remain for user feedback, but persistence is automatic
  }

  const handleClear = () => {
    clearAll()
  }

  const handleExport = () => {
    const jsonString = exportState()
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const dateStr = new Date().toISOString().split('T')[0]
    a.download = `expense-analyzer-state-${dateStr ?? ''}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const jsonString = event.target?.result as string
        if (jsonString) {
          const success = importState(jsonString)
          if (success) {
            alert('State imported successfully!')
          } else {
            alert('Failed to import state. Please check the file format.')
          }
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className={styles['appContainer']}>
      {/* Sidebar */}
      <div className={styles['sidebar']}>
        <div className={styles['sidebarHeader']}>
          <h1>Expense Analyzer</h1>
          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            <button className={styles['btnPrimary']} onClick={handleSave}>
              Save
            </button>
            <button className={styles['btnSecondary']} onClick={handleExport}>
              Export State
            </button>
            <button className={styles['btnSecondary']} onClick={handleImport}>
              Import State
            </button>
            <button className={styles['btnDanger']} onClick={handleClear}>
              Clear & Start Over
            </button>
          </div>
        </div>

        <nav className={styles['sidebarNav']}>
          <button className={styles['sidebarBtn']} onClick={() => { setView('csv') }}>
            CSV Input
          </button>
          <button 
            className={styles['sidebarBtn']}
            onClick={() => { setView('categories') }}
          >
            Categories
          </button>
          <button 
            className={styles['sidebarBtn']}
            onClick={() => { setView('transactions') }}
          >
            Transactions Table
          </button>
          <button
            className={styles['sidebarBtn']}
            onClick={() => { setView('summary') }}
          >
            Data by Period
          </button>
          <button
            className={styles['sidebarBtn']}
            onClick={() => { setView('chart') }}
          >
            Cumulative Bar Chart
          </button>
          <button
            className={styles['sidebarBtn']}
            onClick={() => { setView('budget') }}
          >
            Budget
          </button>
        </nav>
      </div>

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
  )
}

export { App }
