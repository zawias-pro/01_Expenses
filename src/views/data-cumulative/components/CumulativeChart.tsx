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
import { formatNumber } from '../../../parsing/formatNumber/formatNumber.ts'
import { useStore } from "../../../store/useStore.ts"
import { getCategoryColor } from "../../../parsing/categoryUtils.ts"

const CumulativeChart = ({
  data,
  categories
}: {
  data: Record<string, string | number>[]
  categories: string[]
}) => {
  const categoryMetadata = useStore((state) => state.categoryMetadata)

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} interval={0} />
          <YAxis tickFormatter={(value: number) => formatNumber(value)} />
          <Tooltip
            wrapperStyle={{ zIndex: 100 }}
            formatter={(value: number | undefined) => {
              if (value === undefined) { return '???' }
              return formatNumber(value)
            }}
          />
          <Legend />
          {categories.map((categoryId) => {
            const name = categoryMetadata[categoryId]?.name ?? '(no category)'

            return (
              <Bar
                key={categoryId}
                dataKey={categoryId}
                name={name}
                stackId="expenses"
                fill={getCategoryColor(name)}
              />
            )
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { CumulativeChart }
