import { useView } from '../core/useView.ts'
import { TopBar } from '../core/TopBar/TopBar.tsx'
import { Sidebar } from '../core/Sidebar/Sidebar.tsx'
import { TransactionsTable } from '../transactions/TransactionsTable/TransactionsTable.tsx'
import { AddTransactions } from '../transactions/AddTransactions/AddTransactions.tsx'
import { Imports } from '../imports/Imports/Imports.tsx'
import { Accounts } from '../accounts/Accounts/Accounts.tsx'
import { Categories } from '../categories/Categories/Categories.tsx'
import styles from './App.module.css'

const App = () => {
  const view = useView()

  return (
    <div className={styles.app}>
      <TopBar />
      <div className={styles.appBody}>
        <Sidebar />
        <main className={styles.appContent}>
          {view === 'table' ? <TransactionsTable /> : null}
          {view === 'add' ? <AddTransactions /> : null}
          {view === 'accounts' ? <Accounts /> : null}
          {view === 'imports' ? <Imports /> : null}
          {view === 'categories' ? <Categories /> : null}
        </main>
      </div>
    </div>
  )
}

export { App }