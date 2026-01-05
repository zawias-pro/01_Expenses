import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import type { MonthlySummary } from '../parsing/types.ts'
import { formatPolishNumber } from '../parsing/formatPolishNumber/formatPolishNumber.ts'

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const Step4 = ({ summaries, onBack }: {
  summaries: MonthlySummary[]
  onBack?: () => void
}) => {
  // Collect all unique categories across all months
  const allCategories = new Set<string>()
  summaries.forEach(summary => {
    Object.keys(summary.categories).forEach(cat => allCategories.add(cat))
  })

  // Sort summaries by year and month
  const sortedSummaries = [...summaries].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })

  // Transform data for Recharts: each month becomes a data point with all category values
  const chartData = sortedSummaries.map(summary => {
    const monthLabel = `${monthNames[summary.month - 1]} ${summary.year}`
    const dataPoint: Record<string, string | number> = {
      month: monthLabel,
      monthKey: `${summary.year}-${String(summary.month).padStart(2, '0')}` // For sorting
    }

    // Add all categories (0 if not present in this month)
    allCategories.forEach(category => {
      dataPoint[category] = summary.categories[category] || 0
    })

    return dataPoint
  })

  // Generate distinct colors for each category
  const categoryColors = Array.from(allCategories).map((category, index) => {
    const hue = (index * 137.5) % 360
    return { category, color: `hsl(${hue}, 70%, 50%)` }
  })

  if (chartData.length === 0) {
    return (
      <div>
        <h2>Cumulative Bar Chart</h2>
        <p>No data available</p>
        <div style={{ marginTop: '1rem' }}>
          <button onClick={onBack}>Back</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2>Cumulative Bar Chart</h2>
      <p>Expense trends by category over time</p>

      <div style={{ width: '100%', height: '400px' }}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid />
            <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} interval={0} />
            <YAxis tickFormatter={(value) => formatPolishNumber(value)} />
            <Tooltip formatter={(value: number) => formatPolishNumber(value)} />
            <Legend />
            {categoryColors.map(({ category, color }) => (
              <Bar
                key={category}
                dataKey={category}
                stackId="expenses"
                fill={color}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}

export { Step4 }

