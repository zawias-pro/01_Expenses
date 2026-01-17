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
import { formatPolishNumber } from '../../../parsing/formatPolishNumber/formatPolishNumber.ts'

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

export { CategoryBarChart }
