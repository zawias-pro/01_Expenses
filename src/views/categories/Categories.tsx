import { useState } from 'react'
import {
  useStore,
  useAllRules,
  useCategoryMetadata,
  getCategoryNameFromId,
} from '../../store/useStore.ts'
import { ExportCategoriesModal } from './components/ExportCategoriesModal.tsx'
import { ImportCategoriesModal } from './components/ImportCategoriesModal.tsx'
import { AddCategoryForm } from './components/AddCategoryForm.tsx'
import { CategoryRow } from './components/CategoryRow.tsx'
import { Button } from '../../components/Button/Button.tsx'
import { SectionHeader } from '../../components/SectionHeader/SectionHeader.tsx'
import { Panel } from "../../components/Panel/Panel.tsx"

const Categories = () => {
  const categoryMetadata = useCategoryMetadata()
  const transactions = useStore((state) => state.transactions)
  const rules = useAllRules()

  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [sortColumn, setSortColumn] = useState<'name' | 'count'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

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
        <Button onClick={() => {setShowImportModal(true)}}>
          Import
        </Button>
        <Button onClick={() => {setShowExportModal(true)}}>
          Export
        </Button>
      </Panel>

      <Panel title={'Add new category'}>
        <AddCategoryForm />
      </Panel>

      <Panel title={'Expense categories'}>
        <table>
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
            />
          ))}
          </tbody>
        </table>
      </Panel>
      {showExportModal && <ExportCategoriesModal onClose={() => { setShowExportModal(false) }} />}
      {showImportModal && <ImportCategoriesModal onClose={() => { setShowImportModal(false) }} />}
    </>
  )
}

export { Categories }
