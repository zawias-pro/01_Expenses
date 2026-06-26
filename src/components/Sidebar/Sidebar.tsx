import type { View } from "../../store/useStore.ts"
import styles from "./Sidebar.module.css"
import { exportState, importState, useStore } from "../../store/useStore.ts"

const Sidebar = ({
  view,
  onViewChange
}: {
  view: View;
  onViewChange: (view: View) => void
}) => {
  const clearAll = useStore((state) => state.clearAll)

  const handleExport = () => {
    const jsonString = exportState()
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const dateStr = new Date().toISOString().split('T')[0]
    a.download = `expense-analyzer-state-${dateStr ?? ''}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const jsonString = event.target?.result as string
        if (jsonString) {
          const success = importState(jsonString)
          if (success) {
            alert('State imported successfully!')
          } else {
            alert('Failed to import state. Please check the file format.')
          }
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleClear = () => {
    const clearConfirmed = window.confirm('Are you sure you want to clear all data?')
    if (clearConfirmed) {
      clearAll()
    }
  }

  return (
    <div className={styles['sidebar']}>
      <h1>
        Expense Analyzer
      </h1>
      <div style={{display:'flex', flexDirection:'column'}}>
        <button onClick={handleExport}>
          📤 Export State
        </button>
        <button onClick={handleImport}>
          📥 Import State
        </button>
        <button onClick={handleClear}>
          🗑️ Clear & Start Over
        </button>
      </div>
      <hr
        style={{width: '100%', borderColor: 'var(--sidebar-hover)' }}
      />
      <nav style={{display:'flex', flexDirection:'column'}}>
        <button
          className={view==='csv' ? styles['active'] : undefined}
          onClick={() => { onViewChange('csv') }}
        >
          📄 CSV Input
        </button>
        <button
          className={view==='categories' ? styles['active'] : undefined}
          onClick={() => { onViewChange('categories') }}
        >
          🏷️ Categories
        </button>
        <button
          className={view==='transactions' ? styles['active'] : undefined}
          onClick={() => { onViewChange('transactions') }}
        >
          📋 Transactions Table
        </button>
        <button
          className={view==='summary' ? styles['active'] : undefined}
          onClick={() => { onViewChange('summary') }}
        >
          📅 Data by Period
        </button>
        <button
          className={view==='chart' ? styles['active'] : undefined}
          onClick={() => { onViewChange('chart') }}
        >
          📊 Cumulative Bar Chart
        </button>
      </nav>
    </div>
  )
}

export {Sidebar}
