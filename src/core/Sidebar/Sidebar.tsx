import type { View } from '../view.ts'
import { useView } from '../useView.ts'
import { viewStore } from '../viewStore.ts'
import styles from './Sidebar.module.css'

const items: { view: View; label: string }[] = [
  { view: 'table', label: 'Table' },
  { view: 'add', label: 'Add transactions' },
]

const Sidebar = () => {
  const view = useView()

  return (
    <nav className={styles.sidebar}>
      {items.map((item) => (
        <button
          key={item.view}
          type="button"
          className={item.view === view ? styles.itemActive : undefined}
          onClick={() => viewStore.set(item.view)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}

export { Sidebar }