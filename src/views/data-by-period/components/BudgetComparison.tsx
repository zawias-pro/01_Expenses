import { formatPolishNumber } from '../../../parsing/formatPolishNumber/formatPolishNumber.ts'
import { useStore } from '../../../store/useStore.ts'
import type { MonthlySummary } from '../../../parsing/types.ts'

const BudgetComparison = ({ 
  processedCategories, 
  summaries 
}: { 
  processedCategories: Record<string, number>, 
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
        actual,
        budget: periodBudget,
        difference,
        percentage
      }
    })

  if (budgetComparison.length === 0) {
    return <p style={{ color: '#666' }}>No categories found for this period.</p>
  }

  return (
    <div>
      <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.875rem' }}>
        {selectionType === 'month' && 'Monthly budget comparison'}
        {selectionType === 'year' && 'Yearly budget comparison (monthly budget × 12)'}
        {selectionType === 'all' && `Budget comparison for ${String(budgetMultiplier)} month(s)`}
      </p>
      <ul className="category-list">
        {budgetComparison
          .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
          .map(({ category, actual, budget, difference, percentage }) => (
            <li key={category} style={{ 
              borderLeft: difference > 0 ? '4px solid #dc3545' : '4px solid #28a745',
              paddingLeft: '0.5rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '500' }}>{category}</span>
                  <span style={{ 
                    color: difference > 0 ? '#dc3545' : '#28a745',
                    fontWeight: '500'
                  }}>
                    {difference > 0 ? '+' : ''}{formatPolishNumber(difference)} PLN
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#666' }}>
                  <span>Actual: {formatPolishNumber(actual)} PLN</span>
                  <span>Budget: {formatPolishNumber(budget)} PLN</span>
                  <span>
                    {percentage === Infinity ? '∞' : percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  )
}

export { BudgetComparison }
