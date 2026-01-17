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
import { formatPolishNumber } from '../../../parsing/formatPolishNumber/formatPolishNumber.ts'

interface CumulativeChartProps {
  data: Record<string, string | number>[]
  categories: { category: string; color: string }[]
}

const CumulativeChart = ({ data, categories }: CumulativeChartProps) => {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
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
          {categories.map(({ category, color }) => (
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
  )
}

export { CumulativeChart }
