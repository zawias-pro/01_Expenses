import styles from './TableBottomBar.module.css'

const TableBottomBar = ({ selectedCount, onDelete }: {
  selectedCount: number
  onDelete: () => void
}) => (
  <div className={styles.bar}>
    <span className={styles.status}>{selectedCount} selected</span>
    <div className={styles.actions}>
      <button type="button" disabled={selectedCount === 0} onClick={onDelete}>
        Delete
      </button>
    </div>
  </div>
)

export { TableBottomBar }