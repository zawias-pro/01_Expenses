import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.ts'
import styles from './Statistics.module.css'

type PeriodType = 'month' | 'quarter'

type StatRow = {
  categoryId: number | null
  category: string
  sum: number
  count: number
}

const getPeriodKey = (date: string, type: PeriodType): string => {
  const year = date.slice(0, 4)
  const month = Number(date.slice(5, 7))
  if (type === 'month') {
    return date.slice(0, 7)
  }
  const quarter = Math.floor((month - 1) / 3) + 1
  return `${year}-Q${quarter}`
}

const formatPeriodLabel = (key: string, type: PeriodType): string => {
  if (type === 'month') {
    return key
  }
  return key
}

const Statistics = () => {
  const [periodType, setPeriodType] = useState<PeriodType>('month')
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<'category' | 'sum' | 'count'>('category')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const data = useLiveQuery(async () => {
    const [transactions, categories] = await Promise.all([
      db.transactions.toArray(),
      db.categories.toArray(),
    ])
    return { transactions, categories }
  }, [], { transactions: [], categories: [] })

  const periods = useMemo(() => {
    const set = new Set<string>()
    for (const tx of data.transactions) {
      if (tx.ignored) continue
      const effectiveDate = (tx.customDate ?? tx.date) as string
      if (!effectiveDate) continue
      set.add(getPeriodKey(effectiveDate, periodType))
    }
    const list = Array.from(set)
    list.sort((a, b) => b.localeCompare(a))
    return list
  }, [data.transactions, periodType])

  const effectivePeriod = selectedPeriod ?? periods[0] ?? null

  const stats = useMemo<StatRow[]>(() => {
    if (!effectivePeriod) {
      return []
    }
    const map = new Map<string, StatRow>()
    const getCategoryName = (id: number | null) => {
      if (id === null) return 'No category'
      return data.categories.find((c) => c.id === id)?.name ?? 'No category'
    }

    for (const tx of data.transactions) {
      if (tx.ignored) continue
      const effectiveDate = (tx.customDate ?? tx.date) as string
      if (getPeriodKey(effectiveDate, periodType) !== effectivePeriod) continue
      const effectiveCategoryId = (tx.customCategoryId ?? null) !== null ? (tx.customCategoryId as number) : tx.categoryId
      const key = effectiveCategoryId === null ? 'none' : String(effectiveCategoryId)
      const existing = map.get(key)
      const categoryName = getCategoryName(effectiveCategoryId)
      if (existing) {
        existing.sum += tx.amount
        existing.count += 1
      } else {
        map.set(key, {
          categoryId: effectiveCategoryId,
          category: categoryName,
          sum: tx.amount,
          count: 1,
        })
      }
    }

    const rows = Array.from(map.values())
    rows.sort((a, b) => {
      let cmp
      if (sortColumn === 'category') {
        cmp = a.category.localeCompare(b.category)
      } else if (sortColumn === 'sum') {
        cmp = a.sum - b.sum
      } else {
        cmp = a.count - b.count
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
    return rows
  }, [data, effectivePeriod, periodType, sortColumn, sortDirection])

  const handleSort = (column: 'category' | 'sum' | 'count') => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortIndicator = (column: 'category' | 'sum' | 'count') => {
    if (sortColumn !== column) {
      return ''
    }
    return sortDirection === 'asc' ? '▲' : '▼'
  }

  const handlePeriodTypeChange = (type: PeriodType) => {
    setPeriodType(type)
    setSelectedPeriod(null)
  }

  return (
    <div className={styles.layout}>
      <div className={styles.sidebar}>
        <div className={styles.periodSelector}>
          <button
            type="button"
            className={periodType === 'month' ? styles.active : undefined}
            onClick={() => handlePeriodTypeChange('month')}
          >
            Month
          </button>
          <button
            type="button"
            className={periodType === 'quarter' ? styles.active : undefined}
            onClick={() => handlePeriodTypeChange('quarter')}
          >
            Quarter
          </button>
        </div>
        <div className={styles.periodList}>
          {periods.length === 0 ? (
            <p className={styles.empty}>No periods</p>
          ) : (
            periods.map((period) => (
              <button
                key={period}
                type="button"
                className={period === effectivePeriod ? styles.periodActive : styles.period}
                onClick={() => setSelectedPeriod(period)}
              >
                {formatPeriodLabel(period, periodType)}
              </button>
            ))
          )}
        </div>
      </div>
      <div className={styles.main}>
        {effectivePeriod ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <button type="button" className={styles.sortButton} onClick={() => handleSort('category')}>
                    Category {sortIndicator('category')}
                  </button>
                </th>
                <th>
                  <button type="button" className={styles.sortButton} onClick={() => handleSort('sum')}>
                    Sum of expenses {sortIndicator('sum')}
                  </button>
                </th>
                <th>
                  <button type="button" className={styles.sortButton} onClick={() => handleSort('count')}>
                    Number of transactions {sortIndicator('count')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.length === 0 ? (
                <tr>
                  <td colSpan={3} className={styles.empty}>
                    No data for this period
                  </td>
                </tr>
              ) : (
                stats.map((row) => (
                  <tr key={row.categoryId === null ? 'none' : String(row.categoryId)}>
                    <td>{row.category}</td>
                    <td>{row.sum}</td>
                    <td>{row.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <p className={styles.empty}>No data</p>
        )}
      </div>
    </div>
  )
}

export { Statistics }
