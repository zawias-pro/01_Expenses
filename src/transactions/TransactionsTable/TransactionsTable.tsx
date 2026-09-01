import { useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  columnResizingFeature,
  columnSizingFeature,
  createColumnHelper,
  createSortedRowModel,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { sortFn_alphanumeric, sortFn_basic, sortFn_datetime, sortFn_text } from '@tanstack/table-core'
import type { ColumnDef, ColumnSizingState, SortingState } from '@tanstack/table-core'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useAppStore } from '../../appStore.ts'
import { formatDate } from '../../core/formatDate.ts'
import { formatDateTime } from '../../core/formatDateTime.ts'
import { FilterButton } from '../../components/FilterButton/FilterButton.tsx'
import { Modal } from '../../components/Modal/Modal.tsx'
import { MultiSelectFilterForm } from '../../components/MultiSelectFilterForm/MultiSelectFilterForm.tsx'
import { db } from '../../db.ts'
import type { Account } from '../../accounts/Account.ts'
import type { Category } from '../../categories/Category.ts'
import type { ImportRecord } from '../../imports/Import.ts'
import type { Transaction } from '../Transaction.ts'
import { AmountFilterForm, type AmountFilter } from './AmountFilterForm.tsx'
import { DateFilterForm, type DateFilter } from './DateFilterForm.tsx'
import { DescriptionFilterForm } from './DescriptionFilterForm.tsx'
import { descriptionMatches } from './descriptionMatches.ts'
import { DescriptionMatcherForm } from './DescriptionMatcherForm/DescriptionMatcherForm.tsx'
import { ImportedAtFilterForm, type ImportedAtFilter } from './ImportedAtFilterForm.tsx'
import { TableBottomBar } from './TableBottomBar.tsx'
import styles from './TransactionsTable.module.css'

type TableData = {
  transactions: Transaction[]
  categories: Category[]
  accounts: Account[]
  imports: ImportRecord[]
}

type ViewRow = {
  id: number
  amount: number
  description: string
  date: string
  dateValue: string
  category: string
  categoryId: number | null
  account: string
  accountId: number | null
  importedAt: string
  importedAtMs: number
  importName: string
  importNameRaw: string | null
  importId: number
}

const defaultData: TableData = { transactions: [], categories: [], accounts: [], imports: [] }

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

const applyDateFilter = (rows: ViewRow[], filter: DateFilter) => {
  const from = filter.from === '' ? '' : filter.from
  const to = filter.to === '' ? '' : filter.to
  return rows.filter((row) => {
    const okFrom = from === '' || row.dateValue >= from
    const okTo = to === '' || row.dateValue <= to
    return okFrom && okTo
  })
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
  columnSizingFeature,
  columnResizingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
})
const columnHelper = createColumnHelper<typeof features, ViewRow>()

const TransactionsTable = () => {
  const data = useLiveQuery(async () => {
    const [transactions, categories, accounts, imports] = await Promise.all([
      db.transactions.toArray(),
      db.categories.toArray(),
      db.accounts.toArray(),
      db.imports.toArray(),
    ])
    return { transactions, categories, accounts, imports }
  }, [], defaultData)

  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
  const amountFilter = useAppStore((state) => state.amountFilter)
  const categoryFilter = useAppStore((state) => state.categoryFilter)
  const accountFilter = useAppStore((state) => state.accountFilter)
  const descriptionFilter = useAppStore((state) => state.descriptionFilter)
  const importedAtFilter = useAppStore((state) => state.importedAtFilter)
  const dateFilter = useAppStore((state) => state.dateFilter)
  const importNameFilter = useAppStore((state) => state.importNameFilter)
  const setAmountFilter = useAppStore((state) => state.setAmountFilter)
  const setCategoryFilter = useAppStore((state) => state.setCategoryFilter)
  const setAccountFilter = useAppStore((state) => state.setAccountFilter)
  const setDescriptionFilter = useAppStore((state) => state.setDescriptionFilter)
  const setImportedAtFilter = useAppStore((state) => state.setImportedAtFilter)
  const setDateFilter = useAppStore((state) => state.setDateFilter)
  const setImportNameFilter = useAppStore((state) => state.setImportNameFilter)

  const [isAmountFilterOpen, setIsAmountFilterOpen] = useState(false)
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false)
  const [isAccountFilterOpen, setIsAccountFilterOpen] = useState(false)
  const [isDescriptionFilterOpen, setIsDescriptionFilterOpen] = useState(false)
  const [isImportedAtFilterOpen, setIsImportedAtFilterOpen] = useState(false)
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false)
  const [isImportNameFilterOpen, setIsImportNameFilterOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [matcherDraft, setMatcherDraft] = useState<{ pattern: string; categoryName: string } | null>(null)

  const handleDescriptionSelect = (event: React.MouseEvent) => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      return
    }
    const text = selection.toString().trim()
    if (text === '') {
      return
    }
    const range = selection.getRangeAt(0)
    if (!event.currentTarget.contains(range.commonAncestorContainer)) {
      return
    }
    setMatcherDraft({ pattern: `*${text.toLowerCase()}*`, categoryName: text })
  }

  const columns = useMemo<ColumnDef<typeof features, ViewRow, any>[]>(
    () => [
      columnHelper.display({
        id: 'select',
        size: 40,
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
      columnHelper.accessor('id', { id: 'id', header: 'ID', size: 60 }),
      columnHelper.accessor('amount', { id: 'amount', header: 'Amount', size: 90 }),
      columnHelper.accessor('description', {
        id: 'description',
        header: 'Description',
        size: 360,
        cell: (info) => (
          <span onMouseUp={handleDescriptionSelect}>{String(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor('dateValue', {
        id: 'date',
        header: 'Date',
        size: 130,
        cell: (info) => info.row.original.date,
      }),
      columnHelper.accessor('category', { id: 'category', header: 'Category', size: 110 }),
      columnHelper.accessor('account', { id: 'account', header: 'Account', size: 130 }),
      columnHelper.accessor('importedAtMs', {
        id: 'importedAt',
        header: 'Imported',
        sortFn: 'datetime',
        size: 170,
        cell: (info) => info.row.original.importedAt,
      }),
      columnHelper.accessor('importName', { id: 'importName', header: 'Import name', size: 120 }),
      columnHelper.accessor('importId', { id: 'importId', header: 'Import', size: 60 }),
    ],
    [],
  )

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

    const viewRows = data.transactions.map((transaction) => {
      const importRecord = data.imports.find((importRecord) => importRecord.id === transaction.importId)
      if (!importRecord) {
        throw new Error(`Transaction references unknown import ${transaction.importId}`)
      }
      return {
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description,
        date: formatDate(transaction.date),
        dateValue: transaction.date,
        category: categoryName(transaction.categoryId),
        categoryId: transaction.categoryId,
        account: accountName(importRecord.accountId),
        accountId: importRecord.accountId,
        importedAt: formatDateTime(importRecord.importedAt),
        importedAtMs: importRecord.importedAt,
        importName: importRecord.name ?? '-',
        importNameRaw: importRecord.name,
        importId: importRecord.id,
      }
    })

    let filtered = applyAmountFilter(viewRows, amountFilter)
    filtered = applyDescriptionFilter(filtered, descriptionFilter)
    filtered = applyImportedAtFilter(filtered, importedAtFilter)
    filtered = applyDateFilter(filtered, dateFilter)
    filtered = applyReferenceFilter(filtered, categoryFilter, (row) => keyForReference(row.categoryId))
    filtered = applyReferenceFilter(filtered, accountFilter, (row) => keyForReference(row.accountId))
    filtered = applyReferenceFilter(filtered, importNameFilter, (row) => row.importNameRaw ?? 'none')
    return filtered
  }, [data, amountFilter, descriptionFilter, importedAtFilter, dateFilter, categoryFilter, accountFilter, importNameFilter])

  const table = useTable({
    features,
    columns,
    data: rows,
    state: {
      rowSelection,
      sorting,
      columnSizing,
    },
    columnResizeMode: 'onChange',
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing,
    getRowId: (row) => String(row.id),
  })

  const tableWidth = table.getTotalSize()

  // oxlint-disable-next-line react/incompatible-library -- useVirtualizer is the supported API
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 36,
    overscan: 12,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()

  const cols = table.getHeaderGroups()[0]?.headers ?? []

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
    for (const importRecord of data.imports) {
      if (importRecord.name !== null) {
        names.add(importRecord.name)
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

  const handleMatcherSave = async (
    target: { categoryId: number } | { newName: string },
    pattern: string,
  ) => {
    if ('categoryId' in target) {
      const category = await db.categories.get(target.categoryId)
      if (!category) {
        return `Category ${target.categoryId} does not exist`
      }
      const patterns = category.matcher
        .split(';')
        .map((part) => part.trim())
        .filter((part) => part !== '')
      if (!patterns.includes(pattern)) {
        patterns.push(pattern)
        await db.categories.update(category.id, { matcher: patterns.join(';') })
      }
      return ''
    }

    const name = target.newName.trim().toLowerCase()
    const existing = await db.categories.toArray()
    if (existing.some((category) => category.name.toLowerCase() === name)) {
      return 'Category with this name already exists'
    }
    await db.categories.add({ name: target.newName.trim(), matcher: pattern })
    return ''
  }

  return (
    <div ref={scrollRef} className={styles.scroll}>
      <table
        className={styles.table}
        style={{
          width: '100%',
          minWidth: `${tableWidth}px`,
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        <thead className={styles.thead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} style={{ display: 'flex', width: '100%', minWidth: `${tableWidth}px` }}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    width: `${header.getSize()}px`,
                    minWidth: `${header.getSize()}px`,
                    maxWidth: `${header.getSize()}px`,
                    flex: `0 0 ${header.getSize()}px`,
                  }}
                >
                  <div className={styles.headerCell}>
                    {header.column.id === 'select' ? (
                      <table.FlexRender header={header} />
                    ) : (
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
                    )}
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
                    {header.column.id === 'date' ? (
                      <FilterButton
                        active={dateFilter.from !== '' || dateFilter.to !== ''}
                        label="Filter"
                        title="Filter by date"
                        onClick={() => setIsDateFilterOpen(true)}
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
                  {header.column.getCanResize() ? (
                    <div
                      className={styles.resizeHandle}
                      onMouseDown={(event) => {
                        event.stopPropagation()
                        header.getResizeHandler()(event)
                      }}
                      onTouchStart={header.getResizeHandler()}
                    />
                  ) : null}
                </th>
              ))}
              <th
                aria-hidden="true"
                style={{
                  flex: '1 0 0',
                  minWidth: 0,
                  borderBottom: '1px solid #ccc',
                }}
              />
            </tr>
          ))}
        </thead>
        <tbody className={styles.tbody}>
          {rows.length === 0 ? (
            <tr>
              <td className={styles.empty} colSpan={cols.length}>
                No transactions
              </td>
            </tr>
          ) : (
            virtualRows.map((virtualRow) => {
              const row = table.getRowModel().rows[virtualRow.index]
              return (
                <tr
                  key={row.id}
                  className={styles.virtualRow}
                  style={{
                    position: 'absolute',
                    top: `${virtualRow.start}px`,
                    height: `${virtualRow.size}px`,
                    width: '100%',
                    minWidth: `${tableWidth}px`,
                    display: 'flex',
                  }}
                >
                  {row.getAllCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        width: `${cell.column.getSize()}px`,
                        minWidth: `${cell.column.getSize()}px`,
                        maxWidth: `${cell.column.getSize()}px`,
                        flex: `0 0 ${cell.column.getSize()}px`,
                      }}
                      title={String(cell.getValue())}
                    >
                      <div className={styles.cellContent}>
                        <table.FlexRender cell={cell} />
                      </div>
                    </td>
                  ))}
                  <td
                    aria-hidden="true"
                    style={{
                      flex: '1 0 0',
                      minWidth: 0,
                      borderBottom: '1px solid #ccc',
                    }}
                  />
                </tr>
              )
            })
          )}
        </tbody>
      </table>
      <TableBottomBar
        selectedCount={selectedIds.length}
        onDelete={() => setConfirmingDelete(true)}
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
      {isDateFilterOpen ? (
        <Modal title="Filter by date" onClose={() => setIsDateFilterOpen(false)}>
          <DateFilterForm
            filter={dateFilter}
            onApply={setDateFilter}
            onClose={() => setIsDateFilterOpen(false)}
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
      {matcherDraft ? (
        <Modal title="Create matcher" onClose={() => setMatcherDraft(null)}>
          <DescriptionMatcherForm
            pattern={matcherDraft.pattern}
            categoryName={matcherDraft.categoryName}
            categories={data.categories}
            onSave={handleMatcherSave}
            onClose={() => setMatcherDraft(null)}
          />
        </Modal>
      ) : null}
    </div>
  )
}

export { TransactionsTable }
