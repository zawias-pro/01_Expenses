import { Select } from '../../../components/Select/Select.tsx'

const PeriodSelection = ({
  availableYears,
  monthOptions,
  selectedMonth,
  selectionType,
  selectedYear,
  onSelectionTypeChange,
  onSelectedYearChange,
  onSelectionChange,
}: {
  availableYears: number[]
  monthOptions: { value: string; label: string }[]
  selectedMonth: { year: number; month: number }
  selectionType: 'month' | 'year' | 'all'
  selectedYear: number | null
  onSelectionTypeChange: (type: 'month' | 'year' | 'all') => void
  onSelectedYearChange: (year: number) => void
  onSelectionChange: (type: 'month' | 'year' | 'all', year?: number, month?: number) => void
}) => {
  const handleSelectionTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value as 'month' | 'year' | 'all'
    onSelectionTypeChange(newType)

    if (newType === 'all') {
      onSelectionChange('all')
    } else if (newType === 'year' && availableYears.length > 0) {
      const year = selectedYear ?? availableYears[0]
      if (year !== undefined) {
        onSelectedYearChange(year)
        onSelectionChange('year', year)
      }
    } else if (newType === 'month') {
      onSelectionChange('month', selectedMonth.year, selectedMonth.month)
    }
  }

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value)
    if (!isNaN(year)) {
      onSelectedYearChange(year)
      onSelectionChange('year', year)
    }
  }

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [year, month] = event.target.value.split('-').map(Number)
    if (year !== undefined && month !== undefined && !isNaN(year) && !isNaN(month)) {
      onSelectedYearChange(year)
      onSelectionChange('month', year, month)
    }
  }

  return (
    <>
      <Select
        id="selection-type-select"
        label="View:"
        value={selectionType}
        onChange={handleSelectionTypeChange}
      >
        <option value="all">All Data</option>
        <option value="year">By Year</option>
        <option value="month">By Month</option>
      </Select>

      {selectionType === 'year' && (
        <Select
          label={'Year'}
          id="year-select"
          value={selectedYear ?? ''}
          onChange={handleYearChange}
        >
          {availableYears.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>
      )}

      {selectionType === 'month' && (
        <Select
          label={'Month'}
          id="month-select"
          value={`${selectedMonth.year.toString()}-${selectedMonth.month.toString()}`}
          onChange={handleMonthChange}
        >
          {monthOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )}
    </>
  )
}

export { PeriodSelection }
