import { useState } from 'react'
import { useStore, useCategoryMetadata, getCategoryNameFromId } from '../../store/useStore.ts'
import { ExportCategoriesModal } from './components/ExportCategoriesModal.tsx'
import { ImportCategoriesModal } from './components/ImportCategoriesModal.tsx'
import { AddCategoryForm } from './components/AddCategoryForm.tsx'
import { CategoryRow } from './components/CategoryRow.tsx'
import { Button } from '../../components/Button/Button.tsx'
import { SectionHeader } from '../../components/SectionHeader/SectionHeader.tsx'
import styles from './Categories.module.css'
import { Panel } from "../../components/Panel/Panel.tsx"

const Categories = ({
  rules,
  customRules,
  onUpdateCategory,
  onRemoveCategory,
  onRenameCategory,
  onReplaceCategories
}: {
  rules: Record<string, string[]> // category ID -> keywords
  customRules: Record<string, string[]> // category ID -> keywords
  onUpdateCategory: (categoryName: string, keywords: string[]) => void
  onRemoveCategory: (categoryName: string) => void
  onRenameCategory: (oldName: string, newName: string) => void
  onReplaceCategories: (categories: Record<string, string[]>) => void
}) => {
  // Store state
  const categoryMetadata = useCategoryMetadata()
  const transactions = useStore((state) => state.transactions)
  const showExportModal = useStore((state) => state.showExportModal)
  const showImportModal = useStore((state) => state.showImportModal)

  // Sorting state
  const [sortColumn, setSortColumn] = useState<'name' | 'count'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Store actions
  const setShowExportModal = useStore((state) => state.setShowExportModal)
  const setShowImportModal = useStore((state) => state.setShowImportModal)

  const handleImport = (categories: Record<string, string[]>) => {
    onReplaceCategories(categories)
  }

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
      <SectionHeader>Categories</SectionHeader>

      <Panel title={'Import/Export'}>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <Button onClick={() => {setShowImportModal(true)}}>
            Import
          </Button>
          <Button onClick={() => {setShowExportModal(true)}}>
            Export
          </Button>
        </div>
      </Panel>

      <Panel title={'Add New Category'}>
        <AddCategoryForm onUpdateCategory={onUpdateCategory}/>
      </Panel>

      <Panel title={'Expense Categories'}>
        <table className={styles.table}>
          <thead>
          <tr>
            <th
              onClick={() => {handleSort('name')}}
            >
              Category {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th>Category ID</th>
            <th
              onClick={() => {handleSort('count')}}
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
      </Panel>
      {showExportModal && <ExportCategoriesModal rules={rules}/>}
      {showImportModal && <ImportCategoriesModal onImport={handleImport}/>}
    </>
  )
}

export { Categories }
