import { useState } from 'react'
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
import type { MonthlySummary } from '../../parsing/types.ts'
import { aggregateByYear } from '../../parsing/aggregateByYear/aggregateByYear.ts'
import { aggregateAllData } from '../../parsing/aggregateAllData/aggregateAllData.ts'
import { formatPolishNumber } from '../../parsing/formatPolishNumber/formatPolishNumber.ts'

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

const DataByPeriod = ({ summaries, selectedMonth, onSelectionChange }: {
  summaries: MonthlySummary[] 
  selectedMonth: { year: number; month: number }
  onSelectionChange: (type: SelectionType, year?: number, month?: number) => void
  onBack?: () => void
  onNext?: () => void
}) => {
  const [selectionType, setSelectionType] = useState<SelectionType>('month')
  const [selectedYear, setSelectedYear] = useState<number | null>(selectedMonth.year)

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
          
          <div className="summary-stats">
            <div className="summary-stat">
              <div className="summary-stat-label">Total Expenses</div>
              <div className="summary-stat-value" style={{ color: 'var(--danger-color)' }}>
                {formatPolishNumber(displaySummary.totalExpenses)}
              </div>
            </div>
            <div className="summary-stat">
              <div className="summary-stat-label">Total Income</div>
              <div className="summary-stat-value" style={{ color: 'var(--secondary-color)' }}>
                {formatPolishNumber(displaySummary.totalIncome)}
              </div>
            </div>
            <div className="summary-stat">
              <div className="summary-stat-label">Balance</div>
              <div className="summary-stat-value" style={{ 
                color: displaySummary.balance >= 0 ? 'var(--secondary-color)' : 'var(--danger-color)' 
              }}>
                {formatPolishNumber(displaySummary.balance)}
              </div>
            </div>
          </div>
          
          <h4 className="section-subheader">Categories:</h4>
          <div className="chart-container">
            <CategoryBarChart categories={displaySummary.categories} />
          </div>
          
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
      )}

    </div>
  )
}

export { DataByPeriod }
