import { useMemo, useEffect } from 'react'
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
import type { MonthlySummary, Transaction } from '../../parsing/types.ts'
import { aggregateByYear } from '../../parsing/aggregateByYear/aggregateByYear.ts'
import { aggregateAllData } from '../../parsing/aggregateAllData/aggregateAllData.ts'
import { formatPolishNumber } from '../../parsing/formatPolishNumber/formatPolishNumber.ts'
import { parsePolishAmount } from '../../parsing/parsePolishAmount/parsePolishAmount.ts'
import { getYearFromDate } from '../../parsing/getYearFromDate/getYearFromDate.ts'
import { getMonthFromDate } from '../../parsing/getMonthFromDate/getMonthFromDate.ts'
import { useStore, useCategoryMetadata, getCategoryNameFromId, generateCategoryId } from '../../store/useStore.ts'

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

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DataByPeriod = ({ summaries, selectedMonth, transactions, onSelectionChange }: {
  summaries: MonthlySummary[] 
  selectedMonth: { year: number; month: number }
  transactions: Transaction[]
  onSelectionChange: (type: 'month' | 'year' | 'all', year?: number, month?: number) => void
  onBack?: () => void
  onNext?: () => void
}) => {
  // Store state
  const selectionType = useStore((state) => state.selectionType)
  const selectedYear = useStore((state) => state.selectedYear)
  const activeTab = useStore((state) => state.activeTab)
  const treatLowValueAsOthers = useStore((state) => state.treatLowValueAsOthers)
  const lowValueThreshold = useStore((state) => state.lowValueThreshold)
  const mergeSmallCategories = useStore((state) => state.mergeSmallCategories)
  const categoryThresholdPercent = useStore((state) => state.categoryThresholdPercent)
  
  // Store actions
  const setSelectionType = useStore((state) => state.setSelectionType)
  const setSelectedYear = useStore((state) => state.setSelectedYear)
  const setActiveTab = useStore((state) => state.setActiveTab)
  const setTreatLowValueAsOthers = useStore((state) => state.setTreatLowValueAsOthers)
  const setLowValueThreshold = useStore((state) => state.setLowValueThreshold)
  const setMergeSmallCategories = useStore((state) => state.setMergeSmallCategories)
  const setCategoryThresholdPercent = useStore((state) => state.setCategoryThresholdPercent)
  const setSelectedMonth = useStore((state) => state.setSelectedMonth)
  const budgets = useStore((state) => state.budgets)
  const categoryMetadata = useCategoryMetadata()
  const othersCategoryId = generateCategoryId('others')
  
  // Initialize selectedYear from selectedMonth if not set
  useEffect(() => {
    if (selectedYear === null) {
      setSelectedYear(selectedMonth.year)
    }
  }, [selectedMonth, selectedYear, setSelectedYear])

  const yearlySummaries = aggregateByYear(summaries)
  const allDataSummary = aggregateAllData(summaries)

  const availableYears = Array.from(new Set(summaries.map(s => s.year))).sort()

  const handleSelectionTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value as 'month' | 'year' | 'all'
    setSelectionType(newType)

    if (newType === 'all') {
      onSelectionChange('all')
    } else if (newType === 'year' && availableYears.length > 0) {
      const year = selectedYear || availableYears[0]
      setSelectedYear(year)
      onSelectionChange('year', year)
    } else if (newType === 'month') {
      onSelectionChange('month', selectedMonth.year, selectedMonth.month)
    }
  }

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value)
    setSelectedYear(year)
    onSelectionChange('year', year)
  }

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [year, month] = event.target.value.split('-').map(Number)
    setSelectedYear(year)
    setSelectedMonth({ year, month })
    onSelectionChange('month', year, month)
  }

  const getDisplaySummary = () => {
    if (selectionType === 'all') {
      return allDataSummary
    } else if (selectionType === 'year' && selectedYear !== null) {
      return yearlySummaries.find(s => s.year === selectedYear)
    } else {
      return summaries.find(s => s.year === selectedMonth.year && s.month === selectedMonth.month)
    }
  }

  const getDisplayTitle = () => {
    if (selectionType === 'all') {
      return 'All Data'
    } else if (selectionType === 'year' && selectedYear !== null) {
      return `Year ${String(selectedYear)}`
    } else {
      const summary = summaries.find(s => s.year === selectedMonth.year && s.month === selectedMonth.month)
      if (summary) {
        return `${monthNames[summary.month - 1] ?? ''} ${String(summary.year)}`
      }
      return ''
    }
  }

  const displaySummary = getDisplaySummary()

  const monthOptions = summaries.map(s => ({
    value: `${String(s.year)}-${String(s.month)}`,
    label: `${monthNames[s.month - 1] ?? ''} ${String(s.year)}`
  }))

  // Process categories with low-value threshold and/or category percentage threshold if enabled
  const processedCategories = useMemo(() => {
    if (!displaySummary) {
      return {}
    }

    // Start with original categories or process with low-value threshold
    let categories: Record<string, number>
    
    if (treatLowValueAsOthers) {
      // Get transactions for the selected period
      let periodTransactions = transactions.filter(t => !t.excluded && t.isValid)
      
      if (selectionType === 'month') {
        periodTransactions = periodTransactions.filter(t => {
          try {
            const year = getYearFromDate(t.date)
            const month = getMonthFromDate(t.date)
            return year === selectedMonth.year && month === selectedMonth.month
          } catch {
            return false
          }
        })
      } else if (selectionType === 'year' && selectedYear !== null) {
        periodTransactions = periodTransactions.filter(t => {
          try {
            const year = getYearFromDate(t.date)
            return year === selectedYear
          } catch {
            return false
          }
        })
      }
      // For 'all', we already have all transactions filtered

      // Re-aggregate categories, treating low-value expenses as "others"
      // Use category names for display (MonthlySummary uses names)
      const processed: Record<string, number> = {}
      
      periodTransactions.forEach(t => {
        try {
          const amount = parsePolishAmount(t.amount)
          if (amount < 0) {
            // This is an expense
            const absAmount = Math.abs(amount)
            let categoryId = t.category
            
            // If the expense is below threshold, treat it as "others"
            if (absAmount < lowValueThreshold) {
              categoryId = othersCategoryId
            }
            
            // Convert ID to name for display
            const categoryName = getCategoryNameFromId(categoryId, categoryMetadata)
            processed[categoryName] = (processed[categoryName] || 0) + absAmount
          }
        } catch {
          // Skip invalid transactions
        }
      })
      
      categories = processed
    } else {
      // Use original categories
      categories = { ...displaySummary.categories }
    }

    // Apply category percentage threshold if enabled
    if (mergeSmallCategories) {
      // Calculate total expenses
      const totalExpenses = Object.values(categories).reduce((sum, amount) => sum + amount, 0)
      
      if (totalExpenses > 0) {
        const merged: Record<string, number> = {}
        let othersAmount = categories['others'] || 0
        
        // Process each category
        Object.entries(categories).forEach(([category, amount]) => {
          if (category === 'others') {
            // Don't process "others" itself, we'll add it at the end
            return
          }
          
          const percentage = (amount / totalExpenses) * 100
          
          if (percentage < categoryThresholdPercent) {
            // Merge into "others"
            othersAmount += amount
          } else {
            // Keep as separate category
            merged[category] = amount
          }
        })
        
        // Add "others" category (including merged small categories)
        if (othersAmount > 0) {
          merged['others'] = othersAmount
        }
        
        categories = merged
      }
    }

    return categories
  }, [displaySummary, treatLowValueAsOthers, lowValueThreshold, mergeSmallCategories, categoryThresholdPercent, transactions, selectionType, selectedMonth, selectedYear, categoryMetadata, othersCategoryId])

  // Get top 10 expenses for the selected period
  const topExpenses = useMemo(() => {
    // Filter transactions for the selected period
    let periodTransactions = transactions.filter(t => !t.excluded && t.isValid)
    
    if (selectionType === 'month') {
      periodTransactions = periodTransactions.filter(t => {
        try {
          const year = getYearFromDate(t.date)
          const month = getMonthFromDate(t.date)
          return year === selectedMonth.year && month === selectedMonth.month
        } catch {
          return false
        }
      })
    } else if (selectionType === 'year' && selectedYear !== null) {
      periodTransactions = periodTransactions.filter(t => {
        try {
          const year = getYearFromDate(t.date)
          return year === selectedYear
        } catch {
          return false
        }
      })
    }
    // For 'all', we already have all transactions filtered

    // Filter to expenses only (negative amounts) and sort by absolute amount
    const expenses = periodTransactions
      .map(t => {
        try {
          const amount = parsePolishAmount(t.amount)
          return { ...t, parsedAmount: amount }
        } catch {
          return null
        }
      })
      .filter((t): t is Transaction & { parsedAmount: number } => t !== null && t.parsedAmount < 0)
      .sort((a, b) => Math.abs(b.parsedAmount) - Math.abs(a.parsedAmount))
      .slice(0, 10)

    return expenses
  }, [transactions, selectionType, selectedMonth, selectedYear])

  return (
    <div className="section">
      <h2 className="section-header">Data Aggregated by Period</h2>

      <div className="selection-controls">
        <label htmlFor="selection-type-select" className="form-label">View:</label>
        <select
          id="selection-type-select"
          className="form-select"
          style={{ width: 'auto', minWidth: '150px' }}
          value={selectionType}
          onChange={handleSelectionTypeChange}
        >
          <option value="all">All Data</option>
          <option value="year">By Year</option>
          <option value="month">By Month</option>
        </select>

        {selectionType === 'year' && (
          <select
            id="year-select"
            className="form-select"
            style={{ width: 'auto', minWidth: '120px' }}
            value={selectedYear || ''}
            onChange={handleYearChange}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}

        {selectionType === 'month' && (
          <select
            id="month-select"
            className="form-select"
            style={{ width: 'auto', minWidth: '200px' }}
            value={`${selectedMonth.year.toString()}-${selectedMonth.month.toString()}`}
            onChange={handleMonthChange}
          >
            {monthOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {displaySummary && (
        <div>
          <h3 className="section-subheader">{getDisplayTitle()}</h3>
          
          {/* Category processing controls */}
          <div style={{ marginBottom: '1.5rem' }}>
            {/* Low-value threshold controls */}
            <div className="filter-controls" style={{ marginBottom: '0.75rem' }}>
              <label className="filter-label">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={treatLowValueAsOthers}
                  onChange={e => { setTreatLowValueAsOthers(e.target.checked) }}
                />
                Treat low-value expenses as "others"
              </label>
              {treatLowValueAsOthers && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label htmlFor="low-value-threshold" className="form-label" style={{ margin: 0 }}>
                    Threshold:
                  </label>
                  <input
                    id="low-value-threshold"
                    type="number"
                    className="form-input"
                    style={{ width: '120px' }}
                    min="0"
                    step="0.01"
                    value={lowValueThreshold}
                    onChange={e => { setLowValueThreshold(parseFloat(e.target.value) || 0) }}
                  />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>PLN</span>
                </div>
              )}
            </div>
            
            {/* Category percentage threshold controls */}
            <div className="filter-controls">
              <label className="filter-label">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={mergeSmallCategories}
                  onChange={e => { setMergeSmallCategories(e.target.checked) }}
                />
                Merge small categories into "others"
              </label>
              {mergeSmallCategories && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label htmlFor="category-threshold" className="form-label" style={{ margin: 0 }}>
                    Category threshold:
                  </label>
                  <input
                    id="category-threshold"
                    type="number"
                    className="form-input"
                    style={{ width: '120px' }}
                    min="0"
                    max="100"
                    step="0.1"
                    value={categoryThresholdPercent}
                    onChange={e => { setCategoryThresholdPercent(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))) }}
                  />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>%</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
              onClick={() => { setActiveTab('expenses') }}
            >
              Top 10 Expenses
            </button>
            <button
              className={`tab ${activeTab === 'chart' ? 'active' : ''}`}
              onClick={() => { setActiveTab('chart') }}
            >
              Category Chart
            </button>
            <button
              className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => { setActiveTab('categories') }}
            >
              Categories
            </button>
            <button
              className={`tab ${activeTab === 'budget' ? 'active' : ''}`}
              onClick={() => { setActiveTab('budget') }}
            >
              Vs Budget
            </button>
          </div>
          
          {/* Tab Content: Top 10 Expenses */}
          <div className={`tab-content ${activeTab === 'expenses' ? 'active' : ''}`}>
            {topExpenses.length > 0 ? (
              <ul className="category-list">
                {topExpenses.map((expense, index) => (
                  <li key={expense.id}>
                    <span>
                      {index + 1}. {expense.description} ({expense.category})
                    </span>
                    <strong style={{ color: 'var(--danger-color)' }}>
                      {expense.amount}
                    </strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No expenses found for this period.</p>
            )}
          </div>
          
          {/* Tab Content: Chart */}
          <div className={`tab-content ${activeTab === 'chart' ? 'active' : ''}`}>
            <div className="chart-container">
              <CategoryBarChart categories={processedCategories} />
            </div>
          </div>
          
          {/* Tab Content: Categories */}
          <div className={`tab-content ${activeTab === 'categories' ? 'active' : ''}`}>
            <ul className="category-list">
              {Object.entries(processedCategories)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => (
                <li key={cat}>
                  <span>{cat}</span>
                  <strong>{formatPolishNumber(amount)}</strong>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Tab Content: Vs Budget */}
          <div className={`tab-content ${activeTab === 'budget' ? 'active' : ''}`}>
            {(() => {
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
              
              const budgetComparison: Array<{
                category: string
                actual: number
                budget: number
                difference: number
                percentage: number
              }> = Array.from(allCategories)
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
            })()}
          </div>
        </div>
      )}

    </div>
  )
}

export { DataByPeriod }
