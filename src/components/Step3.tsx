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
import type { MonthlySummary } from '../parsing/types.ts'
import { aggregateByYear } from '../parsing/aggregateByYear/aggregateByYear.ts'
import { aggregateAllData } from '../parsing/aggregateAllData/aggregateAllData.ts'
import { formatPolishNumber } from '../parsing/formatPolishNumber/formatPolishNumber.ts'

const CategoryBarChart = ({ categories }: { categories: Record<string, number> }) => {
  const categoryEntries = Object.entries(categories)
    .sort(([, a], [, b]) => b - a) // Sort by amount descending
    .map(([name, amount], index) => ({
      name,
      amount,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)` // Generate distinct colors
    }))

  if (categoryEntries.length === 0) {
    return <p>No category data available</p>
  }

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={categoryEntries}>
          <CartesianGrid />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
          <YAxis tickFormatter={(value) => formatPolishNumber(value)} />
          <Tooltip formatter={(value: number) => formatPolishNumber(value)} />
          <Bar dataKey="amount">
            {categoryEntries.map((entry, index) => (
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

const Step3 = ({ summaries, selectedMonth, onSelectionChange, onBack, onNext }: {
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
    <div>
      <h2>Data Aggregated by Period</h2>

      <div>
        <label htmlFor="selection-type-select">View:</label>
        <select
          id="selection-type-select"
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
          <h3>{getDisplayTitle()}</h3>
          <p>Total Expenses: {formatPolishNumber(displaySummary.totalExpenses)}</p>
          <p>Total Income: {formatPolishNumber(displaySummary.totalIncome)}</p>
          <p>Balance: {formatPolishNumber(displaySummary.balance)}</p>
          
          <h4>Categories:</h4>
          <CategoryBarChart categories={displaySummary.categories} />
          
          <ul>
            {Object.entries(displaySummary.categories).map(([cat, amount]) => (
              <li key={cat}>{cat}: {formatPolishNumber(amount)}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  )
}

export { Step3 }
