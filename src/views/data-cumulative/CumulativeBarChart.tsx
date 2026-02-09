import { useState } from 'react'
import type { MonthlySummary } from '../../parsing/types.ts'
import { CategoryFilter } from './components/CategoryFilter.tsx'
import { CumulativeChart } from './components/CumulativeChart.tsx'
import { SectionHeader } from '../../components/SectionHeader/SectionHeader.tsx'
import { Button } from '../../components/Button/Button.tsx'
import styles from './CumulativeBarChart.module.css'
import { Panel } from "../../components/Panel/Panel.tsx"

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const CumulativeBarChart = ({ summaries, onBack }: {
  summaries: MonthlySummary[]
  onBack?: () => void
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // Collect all unique categories across all months
  const allCategories = new Set<string>()
  summaries.forEach(summary => {
    Object.keys(summary.categories).forEach(cat => allCategories.add(cat))
  })
  const categoriesList = Array.from(allCategories).sort()

  // Sort summaries by year and month
  const sortedSummaries = [...summaries].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })

  // Transform data for Recharts: each month becomes a data point with all category values
  const chartData = sortedSummaries.map(summary => {
    const monthLabel = `${monthNames[summary.month - 1] ?? ''} ${String(summary.year)}`
    const dataPoint: Record<string, string | number> = {
      month: monthLabel,
      monthKey: `${String(summary.year)}-${String(summary.month).padStart(2, '0')}` // For sorting
    }

    // Add all categories (0 if not present in this month)
    allCategories.forEach(category => {
      dataPoint[category] = summary.categories[category] || 0
    })

    return dataPoint
  })

  // Filter categories based on selection
  const filteredCategories = selectedCategory 
    ? [selectedCategory].filter(cat => allCategories.has(cat))
    : Array.from(allCategories)

  // Generate distinct colors for each category
  const categoryColors = filteredCategories.map((category, index) => {
    const hue = (index * 137.5) % 360
    return { category, color: `hsl(${hue.toString()}, 70%, 50%)` }
  })

  if (chartData.length === 0) {
    return (
      <div className={styles.section}>
        <SectionHeader>Cumulative Bar Chart</SectionHeader>
        <p>No data available</p>
        {onBack && (
          <div className={styles.actionButtons}>
            <Button variant="outline" onClick={onBack}>Back</Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="section">
      <SectionHeader>Cumulative Bar Chart</SectionHeader>

      {/* Category Filter */}
      <Panel>
      <CategoryFilter
        categories={categoriesList}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      </Panel>

      <Panel>
        <CumulativeChart data={chartData} categories={categoryColors} />
      </Panel>
    </div> 
  )
}

export { CumulativeBarChart }
