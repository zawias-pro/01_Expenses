import { useMemo, useEffect, useState } from 'react'
import type { MonthlySummary, Transaction } from '../../parsing/types.ts'
import { aggregateByYear } from '../../parsing/aggregateByYear/aggregateByYear.ts'
import { aggregateAllData } from '../../parsing/aggregateAllData/aggregateAllData.ts'
import { formatPolishNumber } from '../../parsing/formatPolishNumber/formatPolishNumber.ts'
import { parsePolishAmount } from '../../parsing/parsePolishAmount/parsePolishAmount.ts'
import { getYearFromDate } from '../../parsing/getYearFromDate/getYearFromDate.ts'
import { getMonthFromDate } from '../../parsing/getMonthFromDate/getMonthFromDate.ts'
import { useCategoryMetadata, getCategoryNameFromId, getCategoryIdFromName } from '../../store/useStore.ts'
import { CategoryBarChart } from './components/CategoryBarChart.tsx'
import { PeriodSelection } from './components/PeriodSelection.tsx'
import { CategoryProcessingControls } from './components/CategoryProcessingControls.tsx'
import { BudgetComparison } from './components/BudgetComparison.tsx'
import { SectionHeader } from '../../components/SectionHeader/SectionHeader.tsx'
import styles from './DataByPeriod.module.css'
import { Panel } from "../../components/Panel/Panel.tsx"
import { FormGroup } from "../../components/FormGroup/FormGroup.tsx"

type SelectionType = 'month' | 'year' | 'all'
type TabType = 'expenses' | 'chart' | 'categories' | 'budget'

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DataByPeriod = ({ summaries, transactions }: {
  summaries: MonthlySummary[]
  transactions: Transaction[]
}) => {
  const [selectionType, setSelectionType] = useState<SelectionType>('month')
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('expenses')
  const [treatLowValueAsOthers, setTreatLowValueAsOthers] = useState(true)
  const [lowValueThreshold, setLowValueThreshold] = useState(100)
  const [mergeSmallCategories, setMergeSmallCategories] = useState(true)
  const [categoryThresholdPercent, setCategoryThresholdPercent] = useState(1)

  const categoryMetadata = useCategoryMetadata()
  const othersCategoryId = getCategoryIdFromName('others', categoryMetadata) || ''

  // Keep selectedMonth in sync with available summaries (local state, no hoisting)
  useEffect(() => {
    if (summaries.length === 0) {
      setSelectedMonth(null)
      return
    }
    const first = summaries[0]
    if (!first) return
    if (selectedMonth === null) {
      setSelectedMonth({ year: first.year, month: first.month })
      setSelectedYear(first.year)
    } else {
      const exists = summaries.some(s => s.year === selectedMonth.year && s.month === selectedMonth.month)
      if (!exists) {
        setSelectedMonth({ year: first.year, month: first.month })
        setSelectedYear(first.year)
      }
    }
  }, [summaries, selectedMonth])

  const handleSelectionChange = (type: 'month' | 'year' | 'all', year?: number, month?: number) => {
    if (type === 'month' && year !== undefined && month !== undefined) {
      setSelectedMonth({ year, month })
      setSelectedYear(year)
    } else if (type === 'year' && year !== undefined) {
      setSelectedYear(year)
    }
  }

  const effectiveMonth = selectedMonth ?? (summaries[0] ? { year: summaries[0].year, month: summaries[0].month } : null)

  const yearlySummaries = aggregateByYear(summaries)
  const allDataSummary = aggregateAllData(summaries)

  const availableYears = Array.from(new Set(summaries.map(s => s.year))).sort()

  const getDisplaySummary = () => {
    if (selectionType === 'all') {
      return allDataSummary
    } else if (selectionType === 'year' && selectedYear !== null) {
      return yearlySummaries.find(s => s.year === selectedYear)
    } else if (effectiveMonth) {
      return summaries.find(s => s.year === effectiveMonth.year && s.month === effectiveMonth.month)
    }
    return undefined
  }

  const getDisplayTitle = () => {
    if (selectionType === 'all') {
      return 'All Data'
    } else if (selectionType === 'year' && selectedYear !== null) {
      return `Year ${String(selectedYear)}`
    } else if (effectiveMonth) {
      const summary = summaries.find(s => s.year === effectiveMonth.year && s.month === effectiveMonth.month)
      if (summary) {
        return `${monthNames[summary.month - 1] ?? ''} ${String(summary.year)}`
      }
    }
    return ''
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
      
      if (selectionType === 'month' && effectiveMonth) {
        periodTransactions = periodTransactions.filter(t => {
          try {
            const year = getYearFromDate(t.date)
            const month = getMonthFromDate(t.date)
            return year === effectiveMonth.year && month === effectiveMonth.month
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
  }, [displaySummary, treatLowValueAsOthers, lowValueThreshold, mergeSmallCategories, categoryThresholdPercent, transactions, selectionType, effectiveMonth, selectedYear, categoryMetadata, othersCategoryId])

  // Get top 10 expenses for the selected period
  const topExpenses = useMemo(() => {
    // Filter transactions for the selected period
    let periodTransactions = transactions.filter(t => !t.excluded && t.isValid)
    
    if (selectionType === 'month') {
      periodTransactions = periodTransactions.filter(t => {
        try {
          const year = getYearFromDate(t.date)
          const month = getMonthFromDate(t.date)
          return effectiveMonth !== null && year === effectiveMonth.year && month === effectiveMonth.month
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
  }, [transactions, selectionType, effectiveMonth, selectedYear])

  return (
    <>
      <SectionHeader>Data Aggregated by Period</SectionHeader>

      <Panel>
        <FormGroup>
        <PeriodSelection
          availableYears={availableYears}
          monthOptions={monthOptions}
          selectedMonth={effectiveMonth ?? { year: new Date().getFullYear(), month: 1 }}
          selectionType={selectionType}
          selectedYear={selectedYear}
          onSelectionTypeChange={setSelectionType}
          onSelectedYearChange={setSelectedYear}
          onSelectionChange={handleSelectionChange}
        />
        <CategoryProcessingControls
          treatLowValueAsOthers={treatLowValueAsOthers}
          lowValueThreshold={lowValueThreshold}
          mergeSmallCategories={mergeSmallCategories}
          categoryThresholdPercent={categoryThresholdPercent}
          onTreatLowValueAsOthersChange={setTreatLowValueAsOthers}
          onLowValueThresholdChange={setLowValueThreshold}
          onMergeSmallCategoriesChange={setMergeSmallCategories}
          onCategoryThresholdPercentChange={setCategoryThresholdPercent}
        />
        </FormGroup>
      </Panel>

      {displaySummary && (
          <Panel title={getDisplayTitle()}>
          <div className={styles.tabs}>
            <button
              className={activeTab === 'expenses' ? styles.active : ''}
              onClick={() => { setActiveTab('expenses') }}
            >
              Top 10 Expenses
            </button>
            <button
              className={activeTab === 'chart' ? styles.active : ''}
              onClick={() => { setActiveTab('chart') }}
            >
              Category Chart
            </button>
            <button
              className={activeTab === 'categories' ? styles.active : ''}
              onClick={() => { setActiveTab('categories') }}
            >
              Categories
            </button>
            <button
              className={activeTab === 'budget' ? styles.active : ''}
              onClick={() => { setActiveTab('budget') }}
            >
              Vs Budget
            </button>
          </div>

            {activeTab === 'expenses'&&(
          <div className={`${styles.tabContent} ${activeTab === 'expenses' ? styles.active : ''}`}>
            {topExpenses.length > 0 ? (
              <ul className={styles.categoryList}>
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
            )}
            {activeTab === 'chart'&&(
              <CategoryBarChart categories={processedCategories} />
            )}
            {activeTab === 'categories'&&(
            <ul className={styles.categoryList}>
              {Object.entries(processedCategories)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => (
                <li key={cat}>
                  <span>{cat}</span>
                  <strong>{formatPolishNumber(amount)}</strong>
                </li>
              ))}
            </ul>
            )}
            {activeTab === 'budget'&&(
              <BudgetComparison processedCategories={processedCategories} summaries={summaries} />
            )}
          </Panel>
      )}

    </>
  )
}

export { DataByPeriod }
