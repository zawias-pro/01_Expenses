import { useMemo, useEffect } from 'react'
import type { MonthlySummary, Transaction } from '../../parsing/types.ts'
import { aggregateByYear } from '../../parsing/aggregateByYear/aggregateByYear.ts'
import { aggregateAllData } from '../../parsing/aggregateAllData/aggregateAllData.ts'
import { formatPolishNumber } from '../../parsing/formatPolishNumber/formatPolishNumber.ts'
import { parsePolishAmount } from '../../parsing/parsePolishAmount/parsePolishAmount.ts'
import { getYearFromDate } from '../../parsing/getYearFromDate/getYearFromDate.ts'
import { getMonthFromDate } from '../../parsing/getMonthFromDate/getMonthFromDate.ts'
import { useStore, useCategoryMetadata, getCategoryNameFromId, getCategoryIdFromName } from '../../store/useStore.ts'
import { CategoryBarChart } from './components/CategoryBarChart.tsx'
import { PeriodSelection } from './components/PeriodSelection.tsx'
import { CategoryProcessingControls } from './components/CategoryProcessingControls.tsx'
import { BudgetComparison } from './components/BudgetComparison.tsx'

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
  const setSelectedYear = useStore((state) => state.setSelectedYear)
  const setActiveTab = useStore((state) => state.setActiveTab)
  const categoryMetadata = useCategoryMetadata()
  // Look up 'others' category ID - it should always exist
  const othersCategoryId = getCategoryIdFromName('others', categoryMetadata) || ''
  
  // Initialize selectedYear from selectedMonth if not set
  useEffect(() => {
    if (selectedYear === null) {
      setSelectedYear(selectedMonth.year)
    }
  }, [selectedMonth, selectedYear, setSelectedYear])

  const yearlySummaries = aggregateByYear(summaries)
  const allDataSummary = aggregateAllData(summaries)

  const availableYears = Array.from(new Set(summaries.map(s => s.year))).sort()

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

      <PeriodSelection
        availableYears={availableYears}
        monthOptions={monthOptions}
        selectedMonth={selectedMonth}
        onSelectionChange={onSelectionChange}
      />

      {displaySummary && (
        <div>
          <h3 className="section-subheader">{getDisplayTitle()}</h3>
          
          <CategoryProcessingControls />
          
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
            <BudgetComparison processedCategories={processedCategories} summaries={summaries} />
          </div>
        </div>
      )}

    </div>
  )
}

export { DataByPeriod }
