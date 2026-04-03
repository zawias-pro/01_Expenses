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
import type { CategoryMetadata } from '../../../parsing/categoryTypes.ts'
import { getCategoryColor, getCategoryNameFromSummaryKey } from '../../../parsing/categoryUtils.ts'
import { formatPolishNumber } from '../../../parsing/formatPolishNumber/formatPolishNumber.ts'
import { useCategoriesSortedByTotalAmount } from "../../../store/useStore.ts"

const CategoryBarChart = ({
  categories,
  categoryMetadata
}: {
  categories: Record<string, number>
  categoryMetadata: CategoryMetadata
}) => {
  const categoryOrder = useCategoriesSortedByTotalAmount()
  const categoryOrderIndex = new Map(categoryOrder.map((categoryId, index) => [categoryId, index]))
  const categoryEntries = Object.entries(categories)
    .sort(([categoryKeyA, amountA], [categoryKeyB, amountB]) => {
      const indexA = categoryOrderIndex.get(categoryKeyA)
      const indexB = categoryOrderIndex.get(categoryKeyB)

      if (indexA !== undefined && indexB !== undefined && indexA !== indexB) {
        return indexA - indexB
      }

      if (indexA !== undefined) {
        return -1
      }

      if (indexB !== undefined) {
        return 1
      }

      return amountB - amountA
    })
    .map(([categoryKey, amount]) => {
      const name = getCategoryNameFromSummaryKey(categoryKey, categoryMetadata)
      return { categoryKey, name, amount, color: getCategoryColor(name) }
    })

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
              <Cell key={entry.categoryKey} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { CategoryBarChart }
