import { useStore } from '../../../store/useStore.ts'

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
        <th style={{ padding: '0.375rem', fontSize: '0.8125rem', width: '30px' }}>
          <input
            type="checkbox"
            className="form-checkbox"
            checked={allSelected}
            ref={(input) => {
              if (input) input.indeterminate = someSelected && !allSelected
            }}
            onChange={e => { onSelectAll(e.target.checked) }}
            style={{ width: '14px', height: '14px' }}
            title="Select all"
          />
        </th>
        <th 
          style={{ padding: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none' }}
          onClick={() => { handleSort('date') }}
        >
          Date{getSortIndicator('date')}
        </th>
        <th 
          style={{ padding: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none' }}
          onClick={() => { handleSort('description') }}
        >
          Description{getSortIndicator('description')}
        </th>
        <th 
          style={{ padding: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none' }}
          onClick={() => { handleSort('category') }}
        >
          Category{getSortIndicator('category')}
        </th>
        <th 
          style={{ padding: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none' }}
          onClick={() => { handleSort('amount') }}
        >
          Amount{getSortIndicator('amount')}
        </th>
        <th 
          style={{ padding: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none' }}
          onClick={() => { handleSort('addedAt') }}
        >
          Added At{getSortIndicator('addedAt')}
        </th>
        <th style={{ padding: '0.375rem', fontSize: '0.8125rem' }}>Hash</th>
        <th style={{ padding: '0.375rem', fontSize: '0.8125rem', width: '40px' }}>Comment</th>
        <th style={{ padding: '0.375rem', fontSize: '0.8125rem', width: '80px' }}>Actions</th>
      </tr>
    </thead>
  )
}
