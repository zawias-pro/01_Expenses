import { formatNumber } from '../../../parsing/formatNumber/formatNumber.ts'
import type { CategoryMetadata } from '../../../parsing/categoryTypes.ts'
import { getCategoryNameFromSummaryKey } from '../../../parsing/categoryUtils.ts'
import type { MonthlySummary } from '../../../parsing/types.ts'
import { useStore } from '../../../store/useStore.ts'

const BudgetComparison = ({
  processedCategories,
  categoryMetadata,
  summaries,
}: {
  processedCategories: Record<string, number>,
  categoryMetadata: CategoryMetadata,
  summaries: MonthlySummary[]
}) => {
  const selectionType = useStore((state) => state.selectionType)
  const selectedYear = useStore((state) => state.selectedYear)
  const budgets = useStore((state) => state.budgets)

  // Calculate budget multiplier based on selection type
  let budgetMultiplier = 1
  if (selectionType === 'year' && selectedYear !== null) {
    budgetMultiplier = 12 // Yearly budget = monthly * 12
  } else if (selectionType === 'all') {
    // Calculate number of months in the data
    const months = new Set(summaries.map(s => `${String(s.year)}-${String(s.month)}`)).size
    budgetMultiplier = months
  }
  // For 'month', multiplier is 1 (already monthly)

  // Combine: categories with transactions + categories with budgets (even if no transactions)
  const allCategories = new Set([
    ...Object.keys(processedCategories),
    ...Object.keys(budgets)
  ])

  const budgetComparison = Array.from(allCategories)
    .map((category) => {
      const actual = processedCategories[category] || 0 // Default to 0 if no transactions
      const monthlyBudget = budgets[category] || 0 // Default to 0 if not set
      const periodBudget = monthlyBudget * budgetMultiplier
      const difference = actual - periodBudget
      const percentage = periodBudget > 0 ? (actual / periodBudget) * 100 : (actual > 0 ? Infinity : 0)
      return {
        category,
        categoryName: getCategoryNameFromSummaryKey(category, categoryMetadata),
        actual,
        budget: periodBudget,
        difference,
        percentage
      }
    })

  if (budgetComparison.length === 0) {
    return <p>No categories found for this period.</p>
  }

  return (
    <div>
      <p>
        {selectionType === 'month' && 'Monthly budget comparison'}
        {selectionType === 'year' && 'Yearly budget comparison (monthly budget × 12)'}
        {selectionType === 'all' && `Budget comparison for ${String(budgetMultiplier)} month(s)`}
      </p>
      <table>
        <thead>
        <tr>
        <th>Category</th>
        <th>Actual</th>
        <th>Budget</th>
        <th>Diff</th>
        </tr>
        </thead>
        {budgetComparison
          .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
          .map(({ category, categoryName, actual, budget, difference, percentage }) => (
            <tr key={category}>
              <td>{categoryName}</td>
              <td><span>{formatNumber(actual)} PLN</span></td>
              <td><span>{formatNumber(budget)} PLN</span></td>
              <td>{difference > 0 ? '+' : ''}{formatNumber(difference)} PLN ({difference > 0 ? '+' : ''} {percentage === Infinity ? '∞' : percentage.toFixed(1)}%)</td>
            </tr>
          ))}
      </table>
    </div>
  )
}

export { BudgetComparison }
