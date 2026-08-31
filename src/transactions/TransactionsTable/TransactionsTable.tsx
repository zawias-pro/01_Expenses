import { useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  createColumnHelper,
  createSortedRowModel,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { sortFn_alphanumeric, sortFn_basic, sortFn_datetime, sortFn_text } from '@tanstack/table-core'
import type { ColumnDef, SortingState } from '@tanstack/table-core'
import { useVirtualizer } from '@tanstack/react-virtual'
import { FilterButton } from '../../components/FilterButton/FilterButton.tsx'
import { Modal } from '../../components/Modal/Modal.tsx'
import { MultiSelectFilterForm } from '../../components/MultiSelectFilterForm/MultiSelectFilterForm.tsx'
import { db } from '../../db.ts'
import type { Account } from '../../accounts/Account.ts'
import type { Category } from '../../categories/Category.ts'
import type { Transaction } from '../Transaction.ts'
import { AmountFilterForm, type AmountFilter } from './AmountFilterForm.tsx'
import { DescriptionFilterForm } from './DescriptionFilterForm.tsx'
import { descriptionMatches } from './descriptionMatches.ts'
import styles from './TransactionsTable.module.css'

type TableData = {
  transactions: Transaction[]
  categories: Category[]
  accounts: Account[]
}

type ViewRow = {
  id: number
  amount: number
  description: string
  category: string
  categoryId: number | null
  account: string
  accountId: number | null
  importedAt: string
}

const defaultData: TableData = { transactions: [], categories: [], accounts: [] }

const emptyAmountFilter: AmountFilter = { min: '', max: '' }

const amountFilterActive = (filter: AmountFilter) => filter.min !== '' || filter.max !== ''

const applyAmountFilter = (rows: ViewRow[], filter: AmountFilter) => {
  const min = filter.min === '' ? Number.NEGATIVE_INFINITY : Number(filter.min)
  const max = filter.max === '' ? Number.POSITIVE_INFINITY : Number(filter.max)
  return rows.filter((row) => row.amount >= min && row.amount <= max)
}

const keyForReference = (id: number | null) => (id === null ? 'none' : String(id))

const applyReferenceFilter = (rows: ViewRow[], filter: Set<string>, key: (row: ViewRow) => string) => {
  if (filter.size === 0) {
    return rows
  }
  return rows.filter((row) => filter.has(key(row)))
}

const applyDescriptionFilter = (rows: ViewRow[], pattern: string) => {
  if (pattern === '') {
    return rows
  }
  return rows.filter((row) => descriptionMatches(row.description, pattern))
}

const features = tableFeatures({
  rowSelectionFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
})
const columnHelper = createColumnHelper<typeof features, ViewRow>()

const columns: ColumnDef<typeof features, ViewRow, any>[] = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        title="Select all"
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  }),
  columnHelper.accessor('id', { id: 'id', header: 'ID' }),
  columnHelper.accessor('amount', { id: 'amount', header: 'Amount' }),
  columnHelper.accessor('description', { id: 'description', header: 'Description' }),
  columnHelper.accessor('category', { id: 'category', header: 'Category' }),
  columnHelper.accessor('account', { id: 'account', header: 'Account' }),
  columnHelper.accessor('importedAt', { id: 'importedAt', header: 'Imported', sortFn: 'datetime' }),
]

const TransactionsTable = () => {
  const data = useLiveQuery(async () => {
    const [transactions, categories, accounts] = await Promise.all([
      db.transactions.toArray(),
      db.categories.toArray(),
      db.accounts.toArray(),
    ])
    return { transactions, categories, accounts }
  }, [], defaultData)

  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [amountFilter, setAmountFilter] = useState<AmountFilter>(emptyAmountFilter)
  const [isAmountFilterOpen, setIsAmountFilterOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set())
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false)
  const [accountFilter, setAccountFilter] = useState<Set<string>>(new Set())
  const [isAccountFilterOpen, setIsAccountFilterOpen] = useState(false)
  const [descriptionFilter, setDescriptionFilter] = useState('')
  const [isDescriptionFilterOpen, setIsDescriptionFilterOpen] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  const rows = useMemo(() => {
    const categoryName = (categoryId: number | null) => {
      if (categoryId === null) {
        return '-'
      }
      const category = data.categories.find((category) => category.id === categoryId)
      if (!category) {
        throw new Error(`Transaction references unknown category ${categoryId}`)
      }
      return category.name
    }

    const accountName = (accountId: number | null) => {
      if (accountId === null) {
        return '-'
      }
      const account = data.accounts.find((account) => account.id === accountId)
      if (!account) {
        throw new Error(`Transaction references unknown account ${accountId}`)
      }
      return account.name
    }

    const viewRows = data.transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      category: categoryName(transaction.categoryId),
      categoryId: transaction.categoryId,
      account: accountName(transaction.accountId),
      accountId: transaction.accountId,
      importedAt: new Date(transaction.importedAt).toLocaleString(),
    }))

    let filtered = applyAmountFilter(viewRows, amountFilter)
    filtered = applyDescriptionFilter(filtered, descriptionFilter)
    filtered = applyReferenceFilter(filtered, categoryFilter, (row) => keyForReference(row.categoryId))
    filtered = applyReferenceFilter(filtered, accountFilter, (row) => keyForReference(row.accountId))
    return filtered
  }, [data, amountFilter, descriptionFilter, categoryFilter, accountFilter])

  const table = useTable({
    features,
    columns,
    data: rows,
    state: {
      rowSelection,
      sorting,
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getRowId: (row) => String(row.id),
  })

  // oxlint-disable-next-line react/incompatible-library -- useVirtualizer is the supported API
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 36,
    overscan: 12,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()

  const categoryOptions = useMemo(
    () => [
      ...data.categories.map((category) => ({ value: String(category.id), label: category.name })),
      { value: 'none', label: 'No category' },
    ],
    [data],
  )

  const accountOptions = useMemo(
    () => [
      ...data.accounts.map((account) => ({ value: String(account.id), label: account.name })),
      { value: 'none', label: 'No account' },
    ],
    [data],
  )

  return (
    <div ref={scrollRef} className={styles.scroll}>
      <div className={styles.stickyHeader}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.column.id === 'select' ? (
                      <table.FlexRender header={header} />
                    ) : (
                      <div className={styles.headerCell}>
                        <button
                          type="button"
                          className={styles.sortButton}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <table.FlexRender header={header} />
                          {{
                            asc: ' ▲',
                            desc: ' ▼',
                          }[header.column.getIsSorted() as string] ?? ''}
                        </button>
                        {header.column.id === 'description' ? (
                          <FilterButton
                            active={descriptionFilter !== ''}
                            label="Filter"
                            title="Filter by description"
                            onClick={() => setIsDescriptionFilterOpen(true)}
                          />
                        ) : null}
                        {header.column.id === 'amount' ? (
                          <FilterButton
                            active={amountFilterActive(amountFilter)}
                            label="Filter"
                            title="Filter by amount"
                            onClick={() => setIsAmountFilterOpen(true)}
                          />
                        ) : null}
                        {header.column.id === 'category' ? (
                          <FilterButton
                            active={categoryFilter.size > 0}
                            label="Filter"
                            title="Filter by category"
                            onClick={() => setIsCategoryFilterOpen(true)}
                          />
                        ) : null}
                        {header.column.id === 'account' ? (
                          <FilterButton
                            active={accountFilter.size > 0}
                            label="Filter"
                            title="Filter by account"
                            onClick={() => setIsAccountFilterOpen(true)}
                          />
                        ) : null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        </table>
      </div>
      <div className={styles.body} style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rows.length === 0 ? (
          <p>No transactions</p>
        ) : (
          <table className={styles.table}>
            <tbody>
              {virtualRows.map((virtualRow, index) => {
                const row = table.getRowModel().rows[virtualRow.index]
                return (
                  <tr
                    key={row.id}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start - index * virtualRow.size}px)`,
                    }}
                  >
                    {row.getAllCells().map((cell) => (
                      <td key={cell.id} title={String(cell.getValue())}>
                        <table.FlexRender cell={cell} />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      {isDescriptionFilterOpen ? (
        <Modal title="Filter by description" onClose={() => setIsDescriptionFilterOpen(false)}>
          <DescriptionFilterForm
            value={descriptionFilter}
            onApply={setDescriptionFilter}
            onClose={() => setIsDescriptionFilterOpen(false)}
          />
        </Modal>
      ) : null}
      {isAmountFilterOpen ? (
        <Modal title="Filter by amount" onClose={() => setIsAmountFilterOpen(false)}>
          <AmountFilterForm
            filter={amountFilter}
            onApply={setAmountFilter}
            onClose={() => setIsAmountFilterOpen(false)}
          />
        </Modal>
      ) : null}
      {isCategoryFilterOpen ? (
        <Modal title="Filter by category" onClose={() => setIsCategoryFilterOpen(false)}>
          <MultiSelectFilterForm
            options={categoryOptions}
            selection={categoryFilter}
            onApply={setCategoryFilter}
            onClose={() => setIsCategoryFilterOpen(false)}
          />
        </Modal>
      ) : null}
      {isAccountFilterOpen ? (
        <Modal title="Filter by account" onClose={() => setIsAccountFilterOpen(false)}>
          <MultiSelectFilterForm
            options={accountOptions}
            selection={accountFilter}
            onApply={setAccountFilter}
            onClose={() => setIsAccountFilterOpen(false)}
          />
        </Modal>
      ) : null}
    </div>
  )
}

export { TransactionsTable }
