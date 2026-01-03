import type { MonthlySummary } from '../parsing/calculations.ts'
import { formatPolishNumber } from '../parsing/formatPolishNumber.ts'

interface Step3Props {
  summaries: MonthlySummary[]
  selectedMonth: { year: number; month: number }
  onMonthChange: (month: { year: number; month: number }) => void
  onBack: () => void
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function Step3({ summaries, selectedMonth, onMonthChange, onBack }: Step3Props) {
  const selectedSummary = summaries.find(s => s.year === selectedMonth.year && s.month === selectedMonth.month)

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [year, month] = event.target.value.split('-').map(Number)
    onMonthChange({ year, month })
  }

  const monthOptions = summaries.map(s => ({
    value: `${s.year}-${s.month}`,
    label: `${monthNames[s.month - 1]} ${s.year}`
  }))

  return (
    <div>
      <h2>Step 3: Summary</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="month-select" style={{ marginRight: '0.5rem' }}>Select Month:</label>
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
      </div>

      {selectedSummary && (
        <div className="month-summary">
          <h3>{monthNames[selectedSummary.month - 1]} {selectedSummary.year}</h3>
          <p>Total Expenses: {formatPolishNumber(selectedSummary.totalExpenses)}</p>
          <p>Total Income: {formatPolishNumber(selectedSummary.totalIncome)}</p>
          <p>Balance: {formatPolishNumber(selectedSummary.balance)}</p>
          <h4>Categories:</h4>
          <ul>
            {Object.entries(selectedSummary.categories).map(([cat, amount]) => (
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


