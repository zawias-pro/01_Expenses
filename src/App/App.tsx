import { useView } from '../core/useView.ts'
import { TopBar } from '../core/TopBar/TopBar.tsx'
import { Sidebar } from '../core/Sidebar/Sidebar.tsx'
import { TransactionsTable } from '../transactions/TransactionsTable/TransactionsTable.tsx'
import { AddTransactions } from '../transactions/AddTransactions/AddTransactions.tsx'
import styles from './App.module.css'

const App = () => {
  const view = useView()

  return (
    <div>
      <TopBar />
      <div className={styles.appBody}>
        <Sidebar />
        <main className={styles.appContent}>
          {view === 'table' ? <TransactionsTable /> : <AddTransactions />}
        </main>
      </div>
    </div>
  )
}

export { App }