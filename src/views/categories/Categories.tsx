import { useState } from 'react'
import { useStore, useCategoryMetadata, getCategoryNameFromId } from '../../store/useStore.ts'
import { ExportCategoriesModal } from './components/ExportCategoriesModal.tsx'
import { AddCategoryForm } from './components/AddCategoryForm.tsx'
import { CategoryRow } from './components/CategoryRow.tsx'
import { Button } from '../../components/Button/Button.tsx'
import { SectionHeader, SectionSubheader } from '../../components/Header/Header.tsx'
import styles from './Categories.module.css'

const Categories = ({
  rules,
  customRules,
  onUpdateCategory,
  onRemoveCategory,
  onRenameCategory
}: {
  rules: Record<string, string[]> // category ID -> keywords
  customRules: Record<string, string[]> // category ID -> keywords
  onUpdateCategory: (categoryName: string, keywords: string[]) => void
  onRemoveCategory: (categoryName: string) => void
  onRenameCategory: (oldName: string, newName: string) => void
}) => {
  // Store state
  const categoryMetadata = useCategoryMetadata()
  const transactions = useStore((state) => state.transactions)
  const showExportModal = useStore((state) => state.showExportModal)
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<'name' | 'count'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // Store actions
  const setShowExportModal = useStore((state) => state.setShowExportModal)

  const handleSort = (column: 'name' | 'count') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Get category entries sorted by name or count
  const categoryEntries = Object.entries(rules)
    .map(([categoryId, keywords]) => {
      const count = transactions.filter(t => t.category === categoryId).length
      return {
        id: categoryId,
        name: getCategoryNameFromId(categoryId, categoryMetadata),
        keywords,
        count
      }
    })
    .sort((a, b) => {
      if (sortColumn === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      } else {
        return sortDirection === 'asc'
          ? a.count - b.count
          : b.count - a.count
      }
    })

  return (
    <>
      <div className={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <SectionHeader style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>Categories</SectionHeader>
          <Button
            variant="outline"
            onClick={() => { setShowExportModal(true) }}
          >
            Export
          </Button>
        </div>

        <AddCategoryForm onUpdateCategory={onUpdateCategory} />
      
        <div>
          <SectionSubheader>Expense Categories</SectionSubheader>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th 
                    className={styles.sortableHeader} 
                    onClick={() => { handleSort('name') }}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Category {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Category ID</th>
                  <th
                    className={styles.sortableHeader}
                    onClick={() => { handleSort('count') }}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Transactions {sortColumn === 'count' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Keywords</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categoryEntries.map(({ id, name, keywords, count }) => (
                  <CategoryRow
                    key={id}
                    id={id}
                    name={name}
                    keywords={keywords}
                    count={count}
                    isCustom={id in customRules}
                    onUpdateCategory={onUpdateCategory}
                    onRemoveCategory={onRemoveCategory}
                    onRenameCategory={onRenameCategory}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showExportModal && <ExportCategoriesModal rules={rules} />}
    </>
  )
}

export { Categories }
