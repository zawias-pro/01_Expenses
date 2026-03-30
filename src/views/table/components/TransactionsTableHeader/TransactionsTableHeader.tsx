type SortColumn = 'date' | 'description' | 'category' | 'amount' | 'addedAt' | 'hash'

const TransactionsTableHeader = ({
  allSelected,
  someSelected,
  onSelectAll,
  sortColumn,
  sortDirection,
  onSortColumnChange,
  onSortDirectionChange,
}: {
  allSelected: boolean
  someSelected: boolean
  onSelectAll: (checked: boolean) => void
  sortColumn: SortColumn | null
  sortDirection: 'asc' | 'desc' | null
  onSortColumnChange: (column: SortColumn | null) => void
  onSortDirectionChange: (direction: 'asc' | 'desc' | null) => void
}) => {
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
        <th>
          <input
            type="checkbox"
            checked={allSelected}
            ref={(input) => {
              if (input) input.indeterminate = someSelected && !allSelected
            }}
            onChange={e => { onSelectAll(e.target.checked) }}
            title="Select all"
          />
        </th>
        <th onClick={() => { handleSort('date') }}>
          Date{getSortIndicator('date')}
        </th>
        <th onClick={() => { handleSort('description') }}>
          Description{getSortIndicator('description')}
        </th>
        <th onClick={() => { handleSort('category') }}>
          Category{getSortIndicator('category')}
        </th>
        <th onClick={() => { handleSort('amount') }}>
          Amount{getSortIndicator('amount')}
        </th>
        <th onClick={() => { handleSort('addedAt') }}>
          Added At{getSortIndicator('addedAt')}
        </th>
        <th onClick={() => { handleSort('hash') }}>
          Hash
        </th>
        <th>Comment</th>
        <th>Actions</th>
      </tr>
    </thead>
  )
}

export { TransactionsTableHeader }
