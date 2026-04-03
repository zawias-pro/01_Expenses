import { useState } from 'react'
import { CategoryFilter } from './components/CategoryFilter.tsx'
import { CumulativeChart } from './components/CumulativeChart.tsx'
import { SectionHeader } from '../../components/SectionHeader/SectionHeader.tsx'
import { Panel } from "../../components/Panel/Panel.tsx"
import { useSummaries } from "../../store/useStore.ts"
import { useStore } from '../../store/useStore.ts'

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const CumulativeBarChart = () => {
  const summaries = useSummaries()
  const transactions = useStore((state) => state.transactions)
  const [selectedCategory, setSelectedCategory] = useState<string | null | undefined>(undefined)

  const allCategories = new Set<string>()
  summaries.forEach(summary => {
    Object.keys(summary.categories).forEach(cat => allCategories.add(cat))
  })

  const sortedSummaries = [...summaries].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })

  const chartData = sortedSummaries.map(summary => {
    const monthLabel = `${monthNames[summary.month - 1] ?? ''} ${String(summary.year)}`
    const dataPoint: Record<string, string | number> = {
      month: monthLabel,
      monthKey: `${String(summary.year)}-${String(summary.month).padStart(2, '0')}`
    }

    allCategories.forEach(category => {
      dataPoint[category] = summary.categories[category] || 0
    })

    return dataPoint
  })

  const filteredCategories = selectedCategory 
    ? [selectedCategory].filter(cat => allCategories.has(cat))
    : Array.from(allCategories)

  const categoryColors = filteredCategories.map((category, index) => {
    const hue = (index * 137.5) % 360
    return { category, color: `hsl(${hue.toString()}, 70%, 50%)` }
  })

  if (chartData.length === 0) {
    return (
      <div>
        <SectionHeader>Cumulative Bar Chart</SectionHeader>
        <p>No data available</p>
      </div>
    )
  }

  return (
    <>
      <SectionHeader>Cumulative Bar Chart</SectionHeader>
      <Panel>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </Panel>
      <Panel>
        <CumulativeChart data={chartData} categories={categoryColors} />
      </Panel>
      <Panel>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
          {transactions
            .filter(t=> {
              if (selectedCategory === null) { return true }
              if (selectedCategory === undefined) { return t.category === null }
              return t.category === selectedCategory
            })
            .toSorted((a,b)=> {
              if(a.date > b.date) {return 1}
              if(a.date < b.date) {return -1}
              return 0
            })
            .map(t=>(
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{t.description}</td>
              <td>{t.amount}</td>
              <td>{t.category}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </Panel>
    </>
  )
}

export { CumulativeBarChart }
