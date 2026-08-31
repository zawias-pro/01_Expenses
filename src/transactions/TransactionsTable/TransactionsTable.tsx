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
import { useAppStore } from '../../appStore.ts'
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
import { ImportedAtFilterForm, type ImportedAtFilter } from './ImportedAtFilterForm.tsx'
import { SetAccountForm } from './SetAccountForm.tsx'
import { TableBottomBar } from './TableBottomBar.tsx'
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
  importedAtMs: number
  importName: string
  importNameRaw: string | null
}

const defaultData: TableData = { transactions: [], categories: [], accounts: [] }

const amountFilterActive = (filter: AmountFilter) => filter.min !== '' || filter.max !== ''

const applyAmountFilter = (rows: ViewRow[], filter: AmountFilter) => {
  const min = filter.min === '' ? Number.NEGATIVE_INFINITY : Number(filter.min)
  const max = filter.max === '' ? Number.POSITIVE_INFINITY : Number(filter.max)
  return rows.filter((row) => row.amount >= min && row.amount <= max)
}

const importedAtFilterActive = (filter: ImportedAtFilter) => filter.from !== '' || filter.to !== ''

const datetimeLocalToMs = (value: string) => new Date(value).getTime()

const applyImportedAtFilter = (rows: ViewRow[], filter: ImportedAtFilter) => {
  const from = filter.from === '' ? Number.NEGATIVE_INFINITY : datetimeLocalToMs(filter.from)
  const to = filter.to === '' ? Number.POSITIVE_INFINITY : datetimeLocalToMs(filter.to)
  const effectiveTo = filter.from !== '' && filter.to !== '' && filter.from === filter.to ? to + 59_999 : to
  return rows.filter((row) => row.importedAtMs >= from && row.importedAtMs <= effectiveTo)
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
  columnHelper.accessor('importName', { id: 'importName', header: 'Import name' }),
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
  const amountFilter = useAppStore((state) => state.amountFilter)
  const categoryFilter = useAppStore((state) => state.categoryFilter)
  const accountFilter = useAppStore((state) => state.accountFilter)
  const descriptionFilter = useAppStore((state) => state.descriptionFilter)
  const importedAtFilter = useAppStore((state) => state.importedAtFilter)
  const importNameFilter = useAppStore((state) => state.importNameFilter)
  const setAmountFilter = useAppStore((state) => state.setAmountFilter)
  const setCategoryFilter = useAppStore((state) => state.setCategoryFilter)
  const setAccountFilter = useAppStore((state) => state.setAccountFilter)
  const setDescriptionFilter = useAppStore((state) => state.setDescriptionFilter)
  const setImportedAtFilter = useAppStore((state) => state.setImportedAtFilter)
  const setImportNameFilter = useAppStore((state) => state.setImportNameFilter)

  const [isAmountFilterOpen, setIsAmountFilterOpen] = useState(false)
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false)
  const [isAccountFilterOpen, setIsAccountFilterOpen] = useState(false)
  const [isDescriptionFilterOpen, setIsDescriptionFilterOpen] = useState(false)
  const [isImportedAtFilterOpen, setIsImportedAtFilterOpen] = useState(false)
  const [isImportNameFilterOpen, setIsImportNameFilterOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [isSetAccountOpen, setIsSetAccountOpen] = useState(false)

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
      importedAtMs: transaction.importedAt,
      importName: transaction.importName ?? '-',
      importNameRaw: transaction.importName,
    }))

    let filtered = applyAmountFilter(viewRows, amountFilter)
    filtered = applyDescriptionFilter(filtered, descriptionFilter)
    filtered = applyImportedAtFilter(filtered, importedAtFilter)
    filtered = applyReferenceFilter(filtered, categoryFilter, (row) => keyForReference(row.categoryId))
    filtered = applyReferenceFilter(filtered, accountFilter, (row) => keyForReference(row.accountId))
    filtered = applyReferenceFilter(filtered, importNameFilter, (row) => row.importNameRaw ?? 'none')
    return filtered
  }, [data, amountFilter, descriptionFilter, importedAtFilter, categoryFilter, accountFilter, importNameFilter])

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

  const importNameOptions = useMemo(() => {
    const names = new Set<string>()
    for (const transaction of data.transactions) {
      if (transaction.importName !== null) {
        names.add(transaction.importName)
      }
    }
    return [
      ...[...names].map((name) => ({ value: name, label: name })),
      { value: 'none', label: 'Unnamed import' },
    ]
  }, [data])

  const selectedIds = Object.keys(rowSelection).map(Number)

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      return
    }
    await db.transactions.bulkDelete(selectedIds)
    setRowSelection({})
    setConfirmingDelete(false)
  }

  const handleSetAccount = async (accountId: number | null) => {
    if (selectedIds.length === 0) {
      return
    }
    await db.transactions.toCollection().modify((transaction) => {
      if (selectedIds.includes(transaction.id)) {
        transaction.accountId = accountId
      }
    })
    setIsSetAccountOpen(false)
  }

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
                        {header.column.id === 'importedAt' ? (
                          <FilterButton
                            active={importedAtFilterActive(importedAtFilter)}
                            label="Filter"
                            title="Filter by imported at"
                            onClick={() => setIsImportedAtFilterOpen(true)}
                          />
                        ) : null}
                        {header.column.id === 'importName' ? (
                          <FilterButton
                            active={importNameFilter.size > 0}
                            label="Filter"
                            title="Filter by import name"
                            onClick={() => setIsImportNameFilterOpen(true)}
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
      <TableBottomBar
        selectedCount={selectedIds.length}
        onDelete={() => setConfirmingDelete(true)}
        onSetAccount={() => setIsSetAccountOpen(true)}
      />
      {confirmingDelete ? (
        <Modal title="Delete transactions" onClose={() => setConfirmingDelete(false)}>
          <p>Delete {selectedIds.length} selected transaction(s)?</p>
          <div className={styles.modalActions}>
            <button type="button" onClick={() => setConfirmingDelete(false)}>
              No
            </button>
            <button type="button" onClick={handleDelete}>
              Yes, delete
            </button>
          </div>
        </Modal>
      ) : null}
      {isSetAccountOpen ? (
        <Modal title="Set account" onClose={() => setIsSetAccountOpen(false)}>
          <SetAccountForm
            accounts={data.accounts}
            currentAccountId={null}
            onApply={handleSetAccount}
            onClose={() => setIsSetAccountOpen(false)}
          />
        </Modal>
      ) : null}
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
      {isImportedAtFilterOpen ? (
        <Modal title="Filter by imported at" onClose={() => setIsImportedAtFilterOpen(false)}>
          <ImportedAtFilterForm
            filter={importedAtFilter}
            onApply={setImportedAtFilter}
            onClose={() => setIsImportedAtFilterOpen(false)}
          />
        </Modal>
      ) : null}
      {isImportNameFilterOpen ? (
        <Modal title="Filter by import name" onClose={() => setIsImportNameFilterOpen(false)}>
          <MultiSelectFilterForm
            options={importNameOptions}
            selection={importNameFilter}
            onApply={setImportNameFilter}
            onClose={() => setIsImportNameFilterOpen(false)}
          />
        </Modal>
      ) : null}
    </div>
  )
}

export { TransactionsTable }
