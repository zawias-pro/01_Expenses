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

const getCategoryColor = (categoryName: string) => {
  if(categoryName==='(no category)'){
    return 'rgb(0,0,0,0.1)'
  }
  let h = 0
  for (let i = 0; i < categoryName.length; i++) {
    h = Math.imul(31, h) + categoryName.charCodeAt(i) | 0
  }
  const r = (h & 0xFF0000) >> 16
  const g = (h & 0x00FF00) >> 8
  const b = (h & 0x0000FF)

  return `rgb(${String((r + 256) % 256)}, ${String((g + 256) % 256)}, ${String((b + 256) % 256)})`
}

const CategoryBarChart = ({ categories }: { categories: Record<string, number> }) => {
  const categoryEntries = Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .map(([name, amount]) => ({ name, amount, color: getCategoryColor(name) }))

  if (categoryEntries.length === 0) {
    return <p>No category data available</p>
  }
 
  return (
    <div className="chart-wrapper">
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
