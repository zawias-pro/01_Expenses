import type { MonthlySummary } from '../parsing/calculations.ts'
import { formatPolishNumber } from '../parsing/formatPolishNumber.ts'

interface Step3Props {
  summaries: MonthlySummary[]
  onBack: () => void
}

export function Step3({ summaries, onBack }: Step3Props) {
  return (
    <div>
      <h2>Step 3: Summary</h2>
      {summaries.map(s => (
        <div key={s.month} className="month-summary">
          <h3>Month: {s.month}</h3>
          <p>Total Expenses: {formatPolishNumber(s.totalExpenses)}</p>
          <p>Total Income: {formatPolishNumber(s.totalIncome)}</p>
          <p>Balance: {formatPolishNumber(s.balance)}</p>
          <h4>Categories:</h4>
          <ul>
            {Object.entries(s.categories).map(([cat, amount]) => (
              <li key={cat}>{cat}: {formatPolishNumber(amount)}</li>
            ))}
          </ul>
        </div>
      ))}
      <div style={{ marginTop: '1rem' }}>
        <button onClick={onBack}>Back</button>
      </div>
    </div>
  )
}

