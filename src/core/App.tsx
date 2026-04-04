import { useState } from 'react'

import type { View } from '../store/useStore.ts'
import styles from './App.module.css'
import { TransactionsTable } from '../views/table/TransactionsTable.tsx'
import { DataByPeriod } from '../views/data-by-period/DataByPeriod.tsx'
import { CumulativeBarChart } from '../views/data-cumulative/CumulativeBarChart.tsx'
import { Categories } from '../views/categories/Categories.tsx'
import { ErrorBoundary } from "../components/ErrorBoundary/ErrorBoundary.tsx"
import { Sidebar } from "../components/Sidebar/Sidebar.tsx"
import { CSVInput } from "../views/input/CSVInput.tsx"

const App = () => {
  const [view, setView] = useState<View>('csv')

  return (
    <ErrorBoundary>
      <div className={styles['wrapper']}>
        <Sidebar
          view={view}
          onViewChange={setView}
        />
        <div className={styles['main']}>
          <ErrorBoundary>
            {view === 'csv' && <CSVInput />}
            {view === 'categories' && <Categories />}
            {view === 'transactions' && <TransactionsTable />}
            {view === 'summary' && <DataByPeriod />}
            {view === 'chart' && <CumulativeBarChart />}
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export { App }
