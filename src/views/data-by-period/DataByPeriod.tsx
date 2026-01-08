import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import type { MonthlySummary, Transaction } from '../../parsing/types.ts'
import { aggregateByYear } from '../../parsing/aggregateByYear/aggregateByYear.ts'
import { aggregateAllData } from '../../parsing/aggregateAllData/aggregateAllData.ts'
import { formatPolishNumber } from '../../parsing/formatPolishNumber/formatPolishNumber.ts'
import { parsePolishAmount } from '../../parsing/parsePolishAmount/parsePolishAmount.ts'
import { getYearFromDate } from '../../parsing/getYearFromDate/getYearFromDate.ts'
import { getMonthFromDate } from '../../parsing/getMonthFromDate/getMonthFromDate.ts'

const CategoryBarChart = ({ categories }: { categories: Record<string, number> }) => {
  const categoryEntries = Object.entries(categories)
    .sort(([, a], [, b]) => b - a) // Sort by amount descending
    .map(([name, amount], index) => ({
      name,
      amount,
      color: `hsl(${String((index * 137.5) % 360)}, 70%, 50%)` // Generate distinct colors
    }))

  if (categoryEntries.length === 0) {
    return <p>No category data available</p>
  }
 
  return (
    <div className="chart-wrapper" style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={categoryEntries}>
          <CartesianGrid />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
          <YAxis tickFormatter={(value: number) => formatPolishNumber(value)} />
          <Tooltip
            formatter={(value: number | undefined) => {
              if (value === undefined) { return '???' }
              return formatPolishNumber(value)
            }}
          />
          <Bar dataKey="amount">
            {categoryEntries.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

type SelectionType = 'month' | 'year' | 'all'

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

type TabType = 'expenses' | 'chart' | 'categories'

const DataByPeriod = ({ summaries, selectedMonth, transactions, onSelectionChange }: {
  summaries: MonthlySummary[] 
  selectedMonth: { year: number; month: number }
  transactions: Transaction[]
  onSelectionChange: (type: SelectionType, year?: number, month?: number) => void
  onBack?: () => void
  onNext?: () => void
}) => {
  const [selectionType, setSelectionType] = useState<SelectionType>('month')
  const [selectedYear, setSelectedYear] = useState<number | null>(selectedMonth.year)
  const [activeTab, setActiveTab] = useState<TabType>('expenses')

  const yearlySummaries = aggregateByYear(summaries)
  const allDataSummary = aggregateAllData(summaries)

  const availableYears = Array.from(new Set(summaries.map(s => s.year))).sort()

  const handleSelectionTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value as SelectionType
    setSelectionType(newType)

    if (newType === 'all') {
      onSelectionChange('all')
    } else if (newType === 'year' && availableYears.length > 0) {
      const year = selectedYear || availableYears[0]
      setSelectedYear(year)
      onSelectionChange('year', year)
    } else if (newType === 'month') {
      onSelectionChange('month', selectedMonth.year, selectedMonth.month)
    }
  }

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value)
    setSelectedYear(year)
    onSelectionChange('year', year)
  }

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [year, month] = event.target.value.split('-').map(Number)
    setSelectedYear(year)
    onSelectionChange('month', year, month)
  }

  const getDisplaySummary = () => {
    if (selectionType === 'all') {
      return allDataSummary
    } else if (selectionType === 'year' && selectedYear !== null) {
      return yearlySummaries.find(s => s.year === selectedYear)
    } else {
      return summaries.find(s => s.year === selectedMonth.year && s.month === selectedMonth.month)
    }
  }

  const getDisplayTitle = () => {
    if (selectionType === 'all') {
      return 'All Data'
    } else if (selectionType === 'year' && selectedYear !== null) {
      return `Year ${selectedYear.toString()}`
    } else {
      const summary = summaries.find(s => s.year === selectedMonth.year && s.month === selectedMonth.month)
      if (summary) {
        return `${monthNames[summary.month - 1]} ${summary.year.toString()}`
      }
      return ''
    }
  }

  const displaySummary = getDisplaySummary()

  const monthOptions = summaries.map(s => ({
    value: `${s.year.toString()}-${s.month.toString()}`,
    label: `${monthNames[s.month - 1]} ${s.year.toString()}`
  }))

  // Get top 10 expenses for the selected period
  const topExpenses = useMemo(() => {
    // Filter transactions for the selected period
    let periodTransactions = transactions.filter(t => !t.excluded && t.isValid)
    
    if (selectionType === 'month') {
      periodTransactions = periodTransactions.filter(t => {
        try {
          const year = getYearFromDate(t.date)
          const month = getMonthFromDate(t.date)
          return year === selectedMonth.year && month === selectedMonth.month
        } catch {
          return false
        }
      })
    } else if (selectionType === 'year' && selectedYear !== null) {
      periodTransactions = periodTransactions.filter(t => {
        try {
          const year = getYearFromDate(t.date)
          return year === selectedYear
        } catch {
          return false
        }
      })
    }
    // For 'all', we already have all transactions filtered

    // Filter to expenses only (negative amounts) and sort by absolute amount
    const expenses = periodTransactions
      .map(t => {
        try {
          const amount = parsePolishAmount(t.amount)
          return { ...t, parsedAmount: amount }
        } catch {
          return null
        }
      })
      .filter((t): t is Transaction & { parsedAmount: number } => t !== null && t.parsedAmount < 0)
      .sort((a, b) => Math.abs(b.parsedAmount) - Math.abs(a.parsedAmount))
      .slice(0, 10)

    return expenses
  }, [transactions, selectionType, selectedMonth, selectedYear])

  return (
    <div className="section">
      <h2 className="section-header">Data Aggregated by Period</h2>

      <div className="selection-controls">
        <label htmlFor="selection-type-select" className="form-label">View:</label>
        <select
          id="selection-type-select"
          className="form-select"
          style={{ width: 'auto', minWidth: '150px' }}
          value={selectionType}
          onChange={handleSelectionTypeChange}
        >
          <option value="all">All Data</option>
          <option value="year">By Year</option>
          <option value="month">By Month</option>
        </select>

        {selectionType === 'year' && (
          <select
            id="year-select"
            className="form-select"
            style={{ width: 'auto', minWidth: '120px' }}
            value={selectedYear || ''}
            onChange={handleYearChange}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}

        {selectionType === 'month' && (
          <select
            id="month-select"
            className="form-select"
            style={{ width: 'auto', minWidth: '200px' }}
            value={`${selectedMonth.year.toString()}-${selectedMonth.month.toString()}`}
            onChange={handleMonthChange}
          >
            {monthOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {displaySummary && (
        <div>
          <h3 className="section-subheader">{getDisplayTitle()}</h3>
          
          {/* Tab Navigation */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
              onClick={() => setActiveTab('expenses')}
            >
              Top 10 Expenses
            </button>
            <button
              className={`tab ${activeTab === 'chart' ? 'active' : ''}`}
              onClick={() => setActiveTab('chart')}
            >
              Category Chart
            </button>
            <button
              className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              Categories
            </button>
          </div>
          
          {/* Tab Content: Top 10 Expenses */}
          <div className={`tab-content ${activeTab === 'expenses' ? 'active' : ''}`}>
            {topExpenses.length > 0 ? (
              <ul className="category-list">
                {topExpenses.map((expense, index) => (
                  <li key={expense.id}>
                    <span>
                      {index + 1}. {expense.description} ({expense.category})
                    </span>
                    <strong style={{ color: 'var(--danger-color)' }}>
                      {expense.amount}
                    </strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No expenses found for this period.</p>
            )}
          </div>
          
          {/* Tab Content: Chart */}
          <div className={`tab-content ${activeTab === 'chart' ? 'active' : ''}`}>
            <div className="chart-container">
              <CategoryBarChart categories={displaySummary.categories} />
            </div>
          </div>
          
          {/* Tab Content: Categories */}
          <div className={`tab-content ${activeTab === 'categories' ? 'active' : ''}`}>
            <ul className="category-list">
              {Object.entries(displaySummary.categories)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => (
                <li key={cat}>
                  <span>{cat}</span>
                  <strong>{formatPolishNumber(amount)}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </div>
  )
}

export { DataByPeriod }
