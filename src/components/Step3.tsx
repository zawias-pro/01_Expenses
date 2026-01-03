import { useState } from 'react'
import type { MonthlySummary } from '../parsing/calculations.ts'
import { aggregateByYear, aggregateAllData } from '../parsing/calculations.ts'
import { formatPolishNumber } from '../parsing/formatPolishNumber.ts'

type SelectionType = 'month' | 'year' | 'all'

interface Step3Props {
  summaries: MonthlySummary[]
  selectedMonth: { year: number; month: number }
  onSelectionChange: (type: SelectionType, year?: number, month?: number) => void
  onBack: () => void
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function Step3({ summaries, selectedMonth, onSelectionChange, onBack }: Step3Props) {
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
      return `Year ${selectedYear}`
    } else {
      const summary = summaries.find(s => s.year === selectedMonth.year && s.month === selectedMonth.month)
      if (summary) {
        return `${monthNames[summary.month - 1]} ${summary.year}`
      }
      return ''
    }
  }

  const displaySummary = getDisplaySummary()

  const monthOptions = summaries.map(s => ({
    value: `${s.year}-${s.month}`,
    label: `${monthNames[s.month - 1]} ${s.year}`
  }))

  return (
    <div>
      <h2>Step 3: Summary</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="selection-type-select" style={{ marginRight: '0.5rem' }}>View:</label>
        <select
          id="selection-type-select"
          value={selectionType}
          onChange={handleSelectionTypeChange}
          style={{ marginRight: '0.5rem' }}
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
            style={{ marginRight: '0.5rem' }}
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
            value={`${selectedMonth.year}-${selectedMonth.month}`}
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
        <div className="month-summary">
          <h3>{getDisplayTitle()}</h3>
          <p>Total Expenses: {formatPolishNumber(displaySummary.totalExpenses)}</p>
          <p>Total Income: {formatPolishNumber(displaySummary.totalIncome)}</p>
          <p>Balance: {formatPolishNumber(displaySummary.balance)}</p>
          <h4>Categories:</h4>
          <ul>
            {Object.entries(displaySummary.categories).map(([cat, amount]) => (
              <li key={cat}>{cat}: {formatPolishNumber(amount)}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '1rem' }}>
        <button onClick={onBack}>Back</button>
      </div>
    </div>
  )
}

export { Step3 }


