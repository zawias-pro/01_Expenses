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
import { sortFn_alphanumeric, sortFn_basic, sortFn_text } from '@tanstack/table-core'
import type { ColumnDef, ColumnSizingState, SortingState } from '@tanstack/table-core'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useAppStore } from '../../appStore.ts'
import { formatDate } from '../../core/formatDate.ts'
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
import { TableBottomBar } from './TableBottomBar.tsx'
import { TransactionEditForm } from './TransactionEditForm.tsx'
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
  importId: number
  importLabel: string
  comment: string
  commentRaw: string | null
  changed: string
  customDate: string | null
  customCategoryId: number | null
  ignored: boolean
}

const defaultData: TableData = { transactions: [], categories: [], accounts: [], imports: [] }

const amountFilterActive = (filter: AmountFilter) => filter.min !== '' || filter.max !== ''

const applyAmountFilter = (rows: ViewRow[], filter: AmountFilter) => {
  const min = filter.min === '' ? Number.NEGATIVE_INFINITY : Number(filter.min)
  const max = filter.max === '' ? Number.POSITIVE_INFINITY : Number(filter.max)
  return rows.filter((row) => row.amount >= min && row.amount <= max)
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
  const dateFilter = useAppStore((state) => state.dateFilter)
  const importFilter = useAppStore((state) => state.importFilter)
  const changedFilter = useAppStore((state) => state.changedFilter)
  const setAmountFilter = useAppStore((state) => state.setAmountFilter)
  const setCategoryFilter = useAppStore((state) => state.setCategoryFilter)
  const setAccountFilter = useAppStore((state) => state.setAccountFilter)
  const setDescriptionFilter = useAppStore((state) => state.setDescriptionFilter)
  const setDateFilter = useAppStore((state) => state.setDateFilter)
  const setImportFilter = useAppStore((state) => state.setImportFilter)
  const setChangedFilter = useAppStore((state) => state.setChangedFilter)

  const [isAmountFilterOpen, setIsAmountFilterOpen] = useState(false)
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false)
  const [isAccountFilterOpen, setIsAccountFilterOpen] = useState(false)
  const [isDescriptionFilterOpen, setIsDescriptionFilterOpen] = useState(false)
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false)
  const [isImportFilterOpen, setIsImportFilterOpen] = useState(false)
  const [isChangedFilterOpen, setIsChangedFilterOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
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
      columnHelper.accessor('importLabel', { id: 'importId', header: 'Import', size: 140 }),
      columnHelper.accessor('changed', { id: 'changed', header: 'Changed', size: 80 }),
      columnHelper.accessor('comment', { id: 'comment', header: 'Comment', size: 160 }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        size: 80,
        enableSorting: false,
        cell: ({ row }) => (
          <button type="button" onClick={() => setEditingId(row.original.id)}>
            Edit
          </button>
        ),
      }),
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
      const customDate = transaction.customDate ?? null
      const customCategoryId = transaction.customCategoryId ?? null
      const commentRaw = transaction.comment ?? null
      const ignored = transaction.ignored ?? false
      const effectiveDateValue = customDate ?? transaction.date
      const effectiveCategoryId = customCategoryId !== null ? customCategoryId : transaction.categoryId
      const changed = customDate !== null || customCategoryId !== null || commentRaw !== null ? 'yes' : 'no'
      const isDateOverridden = customDate !== null
      const isCategoryOverridden = customCategoryId !== null
      return {
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description,
        date: formatDate(effectiveDateValue) + (isDateOverridden ? ' *' : ''),
        dateValue: effectiveDateValue,
        category: categoryName(effectiveCategoryId) + (isCategoryOverridden ? ' *' : ''),
        categoryId: effectiveCategoryId,
        account: accountName(importRecord.accountId),
        accountId: importRecord.accountId,
        importId: importRecord.id,
        importLabel: importRecord.name ? `${importRecord.name} (${importRecord.id})` : String(importRecord.id),
        comment: commentRaw ?? '',
        commentRaw,
        changed,
        customDate,
        customCategoryId,
        ignored,
      }
    })

    let filtered = applyAmountFilter(viewRows, amountFilter)
    filtered = applyDescriptionFilter(filtered, descriptionFilter)
    filtered = applyDateFilter(filtered, dateFilter)
    filtered = applyReferenceFilter(filtered, categoryFilter, (row) => keyForReference(row.categoryId))
    filtered = applyReferenceFilter(filtered, accountFilter, (row) => keyForReference(row.accountId))
    filtered = applyReferenceFilter(filtered, importFilter, (row) => String(row.importId))
    filtered = applyReferenceFilter(filtered, changedFilter, (row) => row.changed)
    return filtered
  }, [data, amountFilter, descriptionFilter, dateFilter, categoryFilter, accountFilter, importFilter, changedFilter])

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

  const importOptions = useMemo(() => {
    return data.imports
      .map((importRecord) => ({
        value: String(importRecord.id),
        label: importRecord.name ? `${importRecord.name} (${importRecord.id})` : String(importRecord.id),
      }))
      .sort((a, b) => Number(a.value) - Number(b.value))
  }, [data])

  const changedOptions = useMemo(
    () => [
      { value: 'yes', label: 'yes' },
      { value: 'no', label: 'no' },
    ],
    [],
  )

  const selectedIds = Object.keys(rowSelection).map(Number)

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      return
    }
    await db.transactions.bulkDelete(selectedIds)
    setRowSelection({})
    setConfirmingDelete(false)
  }

  const handleIgnore = async () => {
    if (selectedIds.length === 0) {
      return
    }
    await db.transactions.where('id').anyOf(selectedIds).modify({ ignored: true })
    setRowSelection({})
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
    <div className={styles.container}>
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
                    {header.column.id === 'importId' ? (
                      <FilterButton
                        active={importFilter.size > 0}
                        label="Filter"
                        title="Filter by import"
                        onClick={() => setIsImportFilterOpen(true)}
                      />
                    ) : null}
                    {header.column.id === 'changed' ? (
                      <FilterButton
                        active={changedFilter.size === 1}
                        label="Filter"
                        title="Filter by changed"
                        onClick={() => setIsChangedFilterOpen(true)}
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
                  className={`${styles.virtualRow} ${row.original.ignored ? styles.ignored : ''}`}
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
      </div>
      <TableBottomBar
        selectedCount={selectedIds.length}
        onDelete={() => setConfirmingDelete(true)}
        onIgnore={() => void handleIgnore()}
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
      {isDateFilterOpen ? (
        <Modal title="Filter by date" onClose={() => setIsDateFilterOpen(false)}>
          <DateFilterForm
            filter={dateFilter}
            onApply={setDateFilter}
            onClose={() => setIsDateFilterOpen(false)}
          />
        </Modal>
      ) : null}
      {isImportFilterOpen ? (
        <Modal title="Filter by import" onClose={() => setIsImportFilterOpen(false)}>
          <MultiSelectFilterForm
            options={importOptions}
            selection={importFilter}
            onApply={setImportFilter}
            onClose={() => setIsImportFilterOpen(false)}
          />
        </Modal>
      ) : null}
      {isChangedFilterOpen ? (
        <Modal title="Filter by changed" onClose={() => setIsChangedFilterOpen(false)}>
          <MultiSelectFilterForm
            options={changedOptions}
            selection={changedFilter}
            onApply={setChangedFilter}
            onClose={() => setIsChangedFilterOpen(false)}
          />
        </Modal>
      ) : null}
      {editingId !== null
        ? (() => {
            const tx = data.transactions.find((t) => t.id === editingId)
            if (!tx) return null
            return (
              <Modal title="Edit transaction" onClose={() => setEditingId(null)}>
                <TransactionEditForm transaction={tx} categories={data.categories} onClose={() => setEditingId(null)} />
              </Modal>
            )
          })()
        : null}
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
