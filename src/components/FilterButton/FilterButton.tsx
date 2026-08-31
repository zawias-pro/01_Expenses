import styles from './FilterButton.module.css'

const FilterButton = ({ active, label, title, onClick }: {
  active: boolean
  label: string
  title?: string
  onClick: () => void
}) => (
  <button
    type="button"
    className={active ? `${styles.filterButton} ${styles.active}` : styles.filterButton}
    title={title}
    aria-pressed={active}
    aria-label={title}
    onClick={onClick}
  >
    {label}
  </button>
)

export { FilterButton }