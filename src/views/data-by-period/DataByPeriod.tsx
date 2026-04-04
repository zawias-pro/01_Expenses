import { useMemo, useState } from 'react'
import type { Transaction } from '../../parsing/types.ts'
import { aggregateByYear } from '../../parsing/aggregateByYear/aggregateByYear.ts'
import { aggregateAllData } from '../../parsing/aggregateAllData/aggregateAllData.ts'
import { formatPolishNumber } from '../../parsing/formatPolishNumber/formatPolishNumber.ts'
import { parsePolishAmount } from '../../parsing/parsePolishAmount/parsePolishAmount.ts'
import { getYearFromDate } from '../../parsing/getYearFromDate/getYearFromDate.ts'
import { getMonthFromDate } from '../../parsing/getMonthFromDate/getMonthFromDate.ts'
import { NO_CATEGORY_ID } from '../../parsing/types.ts'
import { getCategoryNameFromSummaryKey, getCategorySummaryKey } from '../../parsing/categoryUtils.ts'
import { useCategoryMetadata, useStore, useSummaries } from '../../store/useStore.ts'
import { CategoryBarChart } from './components/CategoryBarChart.tsx'
import { PeriodSelection } from './components/PeriodSelection.tsx'
import { CategoryProcessingControls } from './components/CategoryProcessingControls.tsx'
import { BudgetComparison } from './components/BudgetComparison.tsx'
import { SectionHeader } from '../../components/SectionHeader/SectionHeader.tsx'
import { Panel } from "../../components/Panel/Panel.tsx"
import { FormGroup } from "../../components/FormGroup/FormGroup.tsx"

type TabType = 'expenses' | 'chart' | 'categories' | 'budget'

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DataByPeriod = () => {
  const transactions = useStore(state => state.transactions)
  const summaries = useSummaries()
  const selectionType = useStore((state) => state.selectionType)
  const selectedYear = useStore((state) => state.selectedYear)
  const selectedMonth = useStore((state) => state.selectedMonth)
  const [activeTab, setActiveTab] = useState<TabType>('expenses')
  const [treatLowValueAsOthers, setTreatLowValueAsOthers] = useState(true)
  const [lowValueThreshold, setLowValueThreshold] = useState(100)
  const [mergeSmallCategories, setMergeSmallCategories] = useState(true)
  const [categoryThresholdPercent, setCategoryThresholdPercent] = useState(1)

  const categoryMetadata = useCategoryMetadata()

  const effectiveMonth = useMemo(() => {
    if (selectedMonth !== null) {
      const exists = summaries.some((s) => s.year === selectedMonth.year && s.month === selectedMonth.month)
      if (exists) {
        return selectedMonth
      }
    }
    const first = summaries[0]
    return first ? { year: first.year, month: first.month } : null
  }, [selectedMonth, summaries])

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

      // Re-aggregate categories, treating low-value expenses as uncategorized
      const processed: Record<string, number> = {}

      periodTransactions.forEach(t => {
        try {
          const amount = parsePolishAmount(t.amount)
          if (amount < 0) {
            const absAmount = Math.abs(amount)
            let categoryId: string | null = t.category
            if (absAmount < lowValueThreshold) {
              categoryId = null
            }
            const categoryKey = getCategorySummaryKey(categoryId)
            processed[categoryKey] = (processed[categoryKey] || 0) + absAmount
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
      const totalExpenses = Object.values(categories).reduce((sum, amount) => sum + amount, 0)
      if (totalExpenses > 0) {
        const merged: Record<string, number> = {}
        let noCategoryAmount = categories[NO_CATEGORY_ID] || 0

        Object.entries(categories).forEach(([category, amount]) => {
          if (category === NO_CATEGORY_ID) {
            return
          }
          const percentage = (amount / totalExpenses) * 100
          if (percentage < categoryThresholdPercent) {
            noCategoryAmount += amount
          } else {
            merged[category] = amount
          }
        })
        if (noCategoryAmount > 0) {
          merged[NO_CATEGORY_ID] = noCategoryAmount
        }
        categories = merged
      }
    }

    return categories
  }, [displaySummary, treatLowValueAsOthers, lowValueThreshold, mergeSmallCategories, categoryThresholdPercent, transactions, selectionType, effectiveMonth, selectedYear])

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
          <div>
            <button
              onClick={() => { setActiveTab('expenses') }}
            >
              Transactions
            </button>
            <button
              onClick={() => { setActiveTab('chart') }}
            >
              Category Chart
            </button>
            <button
              onClick={() => { setActiveTab('categories') }}
            >
              Categories
            </button>
            <button
              onClick={() => { setActiveTab('budget') }}
            >
              Vs Budget
            </button>
          </div>

            {activeTab === 'expenses'&&(
          <div>
            {topExpenses.length > 0 ? (
              <table>
                <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
                </thead>
                <tbody>
                {topExpenses.map((expense, index) => (
                  <tr key={expense.id}>
                    <td>{index + 1}</td>
                    <td>{expense.description}</td>
                    <td>{expense.category}</td>
                    <td>{expense.amount}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            ) : (
              <p>No expenses found for this period.</p>
            )}
          </div>
            )}
            {activeTab === 'chart'&&(
              <CategoryBarChart categories={processedCategories} categoryMetadata={categoryMetadata} />
            )}
            {activeTab === 'categories'&&(
              <>
            <table>
              <tbody>
              {Object.entries(processedCategories)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => (
                <tr key={cat}>
                  <td>{getCategoryNameFromSummaryKey(cat, categoryMetadata)}</td>
                  <td>{formatPolishNumber(amount)}</td>
                </tr>
              ))}
              </tbody>
            </table>
                <p>
                  {`Total: `}
                  {formatPolishNumber(
                    Object
                    .values(processedCategories)
                    .reduce((acc, curr) => {
                      return acc+curr
                    }, 0)
                  )} zł
                </p>
              </>
            )}
              {activeTab === 'budget'&&(
                <BudgetComparison
                  processedCategories={processedCategories}
                  categoryMetadata={categoryMetadata}
                  summaries={summaries}
                />
               )}
          </Panel>
      )}

    </>
  )
}

export { DataByPeriod }
