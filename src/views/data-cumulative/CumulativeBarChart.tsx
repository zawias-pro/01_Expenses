import { useState } from 'react'
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
import type { MonthlySummary } from '../../parsing/types.ts'
import { formatPolishNumber } from '../../parsing/formatPolishNumber/formatPolishNumber.ts'

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const CumulativeBarChart = ({ summaries, onBack }: {
  summaries: MonthlySummary[]
  onBack?: () => void
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // Collect all unique categories across all months
  const allCategories = new Set<string>()
  summaries.forEach(summary => {
    Object.keys(summary.categories).forEach(cat => allCategories.add(cat))
  })
  const categoriesList = Array.from(allCategories).sort()

  // Sort summaries by year and month
  const sortedSummaries = [...summaries].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })

  // Transform data for Recharts: each month becomes a data point with all category values
  const chartData = sortedSummaries.map(summary => {
    const monthLabel = `${monthNames[summary.month - 1]} ${summary.year.toString()}`
    const dataPoint: Record<string, string | number> = {
      month: monthLabel,
      monthKey: `${summary.year.toString()}-${String(summary.month).padStart(2, '0')}` // For sorting
    }

    // Add all categories (0 if not present in this month)
    allCategories.forEach(category => {
      dataPoint[category] = summary.categories[category] || 0
    })

    return dataPoint
  })

  // Filter categories based on selection
  const filteredCategories = selectedCategory 
    ? [selectedCategory].filter(cat => allCategories.has(cat))
    : Array.from(allCategories)

  // Generate distinct colors for each category
  const categoryColors = filteredCategories.map((category, index) => {
    const hue = (index * 137.5) % 360
    return { category, color: `hsl(${hue.toString()}, 70%, 50%)` }
  })

  if (chartData.length === 0) {
    return (
      <div className="section">
        <h2 className="section-header">Cumulative Bar Chart</h2>
        <p>No data available</p>
        {onBack && (
          <div className="action-buttons">
            <button className="btn btn-outline" onClick={onBack}>Back</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="section">
      <h2 className="section-header">Cumulative Bar Chart</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Expense trends by category over time
      </p>

      {/* Category Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
          Filter by Category:
        </label>
        <select
          className="form-select"
          value={selectedCategory || ''}
          onChange={e => { setSelectedCategory(e.target.value || null) }}
          style={{ fontSize: '0.875rem', padding: '0.375rem', minWidth: '200px' }}
        >
          <option value="">All categories</option>
          {categoriesList.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} interval={0} />
            <YAxis tickFormatter={(value: number) => formatPolishNumber(value)} />
            <Tooltip
              formatter={(value: number | undefined) => {
                if (value === undefined) { return '???' }
                return formatPolishNumber(value)
              }}
            />
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

export { CumulativeBarChart }
