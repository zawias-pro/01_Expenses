import styles from './TableBottomBar.module.css'

const TableBottomBar = ({ selectedCount, onDelete, onSetAccount }: {
  selectedCount: number
  onDelete: () => void
  onSetAccount: () => void
}) => (
  <div className={styles.bar}>
    <span className={styles.status}>{selectedCount} selected</span>
    <div className={styles.actions}>
      <button type="button" disabled={selectedCount === 0} onClick={onDelete}>
        Delete
      </button>
      <button type="button" disabled={selectedCount === 0} onClick={onSetAccount}>
        Set account
      </button>
    </div>
  </div>
)

export { TableBottomBar }