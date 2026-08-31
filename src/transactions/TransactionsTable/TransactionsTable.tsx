import { useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { createColumnHelper, rowSelectionFeature, tableFeatures, useTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/table-core'
import { useVirtualizer } from '@tanstack/react-virtual'
import { db } from '../../db.ts'
import type { Account } from '../../accounts/Account.ts'
import type { Category } from '../../categories/Category.ts'
import type { Transaction } from '../Transaction.ts'
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
  account: string
  importedAt: string
}

const defaultData: TableData = { transactions: [], categories: [], accounts: [] }

const features = tableFeatures({
  rowSelectionFeature,
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
  columnHelper.accessor('id', { header: 'ID' }),
  columnHelper.accessor('amount', { header: 'Amount' }),
  columnHelper.accessor('description', { header: 'Description' }),
  columnHelper.accessor('category', { header: 'Category' }),
  columnHelper.accessor('account', { header: 'Account' }),
  columnHelper.accessor('importedAt', { header: 'Imported' }),
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

    return data.transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      category: categoryName(transaction.categoryId),
      account: accountName(transaction.accountId),
      importedAt: new Date(transaction.importedAt).toLocaleString(),
    }))
  }, [data])

  const table = useTable({
    features,
    columns,
    data: rows,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
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

  if (rows.length === 0) {
    return <p>No transactions</p>
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
                  <table.FlexRender header={header} />
                </th>
                ))}
              </tr>
            ))}
          </thead>
        </table>
      </div>
      <div className={styles.body} style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
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
      </div>
    </div>
  )
}

export { TransactionsTable }
