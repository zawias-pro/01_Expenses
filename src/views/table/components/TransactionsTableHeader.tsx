import styles from './TransactionsTableHeader.module.css'

type SortColumn = 'date' | 'description' | 'category' | 'amount' | 'addedAt'

interface TransactionsTableHeaderProps {
  allSelected: boolean
  someSelected: boolean
  onSelectAll: (checked: boolean) => void
  sortColumn: SortColumn | null
  sortDirection: 'asc' | 'desc' | null
  onSortColumnChange: (column: SortColumn | null) => void
  onSortDirectionChange: (direction: 'asc' | 'desc' | null) => void
}

export const TransactionsTableHeader = ({
  allSelected,
  someSelected,
  onSelectAll,
  sortColumn,
  sortDirection,
  onSortColumnChange,
  onSortDirectionChange,
}: TransactionsTableHeaderProps) => {
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        onSortColumnChange(column)
        onSortDirectionChange('desc')
      } else if (sortDirection === 'desc') {
        onSortColumnChange(null)
        onSortDirectionChange(null)
      } else {
        onSortColumnChange(column)
        onSortDirectionChange('asc')
      }
    } else {
      onSortColumnChange(column)
      onSortDirectionChange('asc')
    }
  }

  const getSortIndicator = (column: SortColumn) => {
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
