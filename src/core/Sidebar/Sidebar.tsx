import type { View } from '../view.ts'
import { useView } from '../useView.ts'
import { useAppStore } from '../../appStore.ts'
import styles from './Sidebar.module.css'

const items: { view: View; label: string }[] = [
  { view: 'table', label: 'Table' },
  { view: 'add', label: 'Add transactions' },
  { view: 'imports', label: 'Imports' },
  { view: 'categories', label: 'Categories' },
  { view: 'accounts', label: 'Accounts' },
  { view: 'backup', label: 'Backup' },
  { view: 'statistics', label: 'Statistics' },
]

const Sidebar = () => {
  const view = useView()
  const setView = useAppStore((state) => state.setView)

  return (
    <nav className={styles.sidebar}>
      {items.map((item) => (
        <button
          key={item.view}
          type="button"
          className={item.view === view ? styles.itemActive : undefined}
          onClick={() => setView(item.view)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}

export { Sidebar }