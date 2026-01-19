import { useStore } from '../../../store/useStore.ts'
import styles from './TransactionsTableHeader.module.css'

interface TransactionsTableHeaderProps {
  allSelected: boolean
  someSelected: boolean
  onSelectAll: (checked: boolean) => void
}

export const TransactionsTableHeader = ({
  allSelected,
  someSelected,
  onSelectAll,
}: TransactionsTableHeaderProps) => {
  const sortColumn = useStore((state) => state.sortColumn)
  const sortDirection = useStore((state) => state.sortDirection)
  const setSortColumn = useStore((state) => state.setSortColumn)
  const setSortDirection = useStore((state) => state.setSortDirection)

  const handleSort = (column: 'date' | 'description' | 'category' | 'amount' | 'addedAt') => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortColumn(column)
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortColumn(null)
        setSortDirection(null)
      } else {
        setSortColumn(column)
        setSortDirection('asc')
      }
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const getSortIndicator = (column: 'date' | 'description' | 'category' | 'amount' | 'addedAt') => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? ' ↑' : ' ↓'
    }
    return ''
  }

  return (
    <thead>
      <tr>
        <th className={styles.tableHeader}>
          <input
            type="checkbox"
            className={styles.formCheckbox}
            checked={allSelected}
            ref={(input) => {
              if (input) input.indeterminate = someSelected && !allSelected
            }}
            onChange={e => { onSelectAll(e.target.checked) }}
            title="Select all"
          />
        </th>
        <th
          className={`${styles.tableHeader} ${styles.sortable}`}
          onClick={() => { handleSort('date') }}
        >
          Date{getSortIndicator('date')}
        </th>
        <th
          className={`${styles.tableHeader} ${styles.sortable}`}
          onClick={() => { handleSort('description') }}
        >
          Description{getSortIndicator('description')}
        </th>
        <th
          className={`${styles.tableHeader} ${styles.sortable}`}
          onClick={() => { handleSort('category') }}
        >
          Category{getSortIndicator('category')}
        </th>
        <th
          className={`${styles.tableHeader} ${styles.sortable}`}
          onClick={() => { handleSort('amount') }}
        >
          Amount{getSortIndicator('amount')}
        </th>
        <th
          className={`${styles.tableHeader} ${styles.sortable}`}
          onClick={() => { handleSort('addedAt') }}
        >
          Added At{getSortIndicator('addedAt')}
        </th>
        <th className={styles.tableHeader}>Hash</th>
        <th className={styles.tableHeader} style={{ width: '40px' }}>Comment</th>
        <th className={styles.tableHeader} style={{ width: '80px' }}>Actions</th>
      </tr>
    </thead>
  )
}
