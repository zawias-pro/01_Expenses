import { useMemo, useState } from 'react'
import {
  useStore, useCategoryMetadata, getCategoryNameFromId, getCategoryIdFromName, getOrCreateCategoryId, useCategories
} from '../../store/useStore.ts'
import type { Transaction } from '../../parsing/types.ts'
import { NO_CATEGORY_FILTER_VALUE } from '../../parsing/types.ts'
import { getYearFromDate } from '../../parsing/getYearFromDate/getYearFromDate.ts'
import { getMonthFromDate } from '../../parsing/getMonthFromDate/getMonthFromDate.ts'
import { parsePolishAmount } from '../../parsing/parsePolishAmount/parsePolishAmount.ts'
import { TransactionsFilters } from './components/TransactionsFilters.tsx'
import { TransactionsBulkActions } from './components/TransactionsBulkActions.tsx'
import { TransactionsTableHeader } from './components/TransactionsTableHeader.tsx'
import { TransactionRow } from './components/TransactionRow.tsx'
import { EditTransactionModal } from './components/EditTransactionModal.tsx'
import { QuickAddCategoryModal } from './components/QuickAddCategoryModal.tsx'
import styles from './components/TransactionsTable.module.css'
import { SectionHeader } from "../../components/SectionHeader/SectionHeader.tsx"
import { Panel } from "../../components/Panel/Panel.tsx"

type BulkAction = 'delete' | 'exclude' | 'unexclude' | 'setCategory' | null

const TransactionsTable = ({
  transactions,
}: {
  transactions: Transaction[]
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<BulkAction>(null)
  const [bulkCategory, setBulkCategory] = useState<string>('')
  const [quickAddTransactionId, setQuickAddTransactionId] = useState<string | null>(null)
  const [editTransactionId, setEditTransactionId] = useState<string | null>(null)
  const [editDate, setEditDate] = useState<string>('')
  const [editCategory, setEditCategory] = useState<string>('')
  const [editComment, setEditComment] = useState<string>('')
  const [editExcluded, setEditExcluded] = useState<boolean>(false)
  const [quickAddSelectedCategory, setQuickAddSelectedCategory] = useState<string>('new')
  const [quickAddCustomCategory, setQuickAddCustomCategory] = useState<string>('')
  const [quickAddKeyword, setQuickAddKeyword] = useState<string>('')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string | null>(null)
  const [amountFilterType, setAmountFilterType] = useState<'none' | 'less' | 'greater' | null>(null)
  const [amountFilterValue, setAmountFilterValue] = useState<number | null>(null)
  const [sortColumn, setSortColumn] = useState<'date' | 'description' | 'category' | 'amount' | 'addedAt' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null)

  const categoryMetadata = useCategoryMetadata()
  const categories = useCategories()

  const updateTransactionExcluded = useStore((state) => state.updateTransactionExcluded)
  const updateTransactionCategory = useStore((state) => state.updateTransactionCategory)
  const updateTransactionDate = useStore((state) => state.updateTransactionDate)
  const updateTransactionComment = useStore((state) => state.updateTransactionComment)
  const removeTransaction = useStore((state) => state.removeTransaction)
  const updateCategory = useStore((state) => state.updateCategory)

  // Parse amount string to number
  const parseAmount = (amountStr: string): number => {
    if (!amountStr || !amountStr.trim()) return 0
    try {
      return parsePolishAmount(amountStr)
    } catch {
      return 0
    }
  }

  // Get unique months from transactions
  const availableMonths = useMemo(() => {
    const monthMap = new Map<string, string>()
    transactions.forEach(t => {
      try {
        const year = getYearFromDate(t.date)
        const month = getMonthFromDate(t.date)
        const key = `${String(year)}-${String(month).padStart(2, '0')}`
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        if (!monthMap.has(key)) {
          monthMap.set(key, `${monthNames[month - 1] ?? ''} ${String(year)}`)
        }
      } catch {
        // Skip invalid dates
      }
    })
    return Array.from(monthMap.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [transactions])

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => {
        const categoryName = getCategoryNameFromId(t.category, categoryMetadata)
        return (
          t.description.toLowerCase().includes(query) ||
          categoryName.toLowerCase().includes(query) ||
          t.date.includes(query) ||
          t.amount.includes(query) ||
          t.hash.toLowerCase().includes(query)
        )
      })
    }

    // Category filter (selectedCategory is category ID, or NO_CATEGORY_FILTER_VALUE for uncategorized)
    if (selectedCategory) {
      if (selectedCategory === NO_CATEGORY_FILTER_VALUE) {
        filtered = filtered.filter(t => t.category === null)
      } else {
        filtered = filtered.filter(t => t.category === selectedCategory)
      }
    }

    // Month filter
    if (selectedMonthFilter) {
      const [year, month] = selectedMonthFilter.split('-').map(Number)
      filtered = filtered.filter(t => {
        try {
          const tYear = getYearFromDate(t.date)
          const tMonth = getMonthFromDate(t.date)
          return tYear === year && tMonth === month
        } catch {
          return false
        }
      })
    }

    // Amount filter
    if (amountFilterType && amountFilterType !== 'none' && amountFilterValue !== null) {
      filtered = filtered.filter(t => {
        const amount = parseAmount(t.amount)
        if (amountFilterType === 'less') {
          return amount < amountFilterValue
        }
        // amountFilterType === 'greater' is guaranteed here
        return amount > amountFilterValue
      })
    }

    // Sort
    if (sortColumn && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0
        if (sortColumn === 'date') {
          comparison = a.date.localeCompare(b.date)
        } else if (sortColumn === 'description') {
          comparison = a.description.localeCompare(b.description)
        } else if (sortColumn === 'category') {
          const aName = getCategoryNameFromId(a.category, categoryMetadata)
          const bName = getCategoryNameFromId(b.category, categoryMetadata)
          comparison = aName.localeCompare(bName)
        } else if (sortColumn === 'amount') {
          comparison = parseAmount(a.amount) - parseAmount(b.amount)
        } else {
          // sortColumn === 'addedAt'
          const aTime = a.addedAt ?? ''
          const bTime = b.addedAt ?? ''
          comparison = aTime.localeCompare(bTime)
        }
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [transactions, searchQuery, selectedCategory, selectedMonthFilter, amountFilterType, amountFilterValue, sortColumn, sortDirection, categoryMetadata])

  // Select all visible transactions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredAndSortedTransactions.map(t => t.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  // Toggle individual selection
  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  // Check if all visible are selected
  const allSelected = filteredAndSortedTransactions.length > 0 &&
    filteredAndSortedTransactions.every(t => selectedIds.has(t.id))
  const someSelected = filteredAndSortedTransactions.some(t => selectedIds.has(t.id))

  // Apply bulk actions
  const handleApplyBulkAction = () => {
    if (selectedIds.size === 0) return

    if (bulkAction === 'delete') {
      const count = selectedIds.size
      if (window.confirm(`Are you sure you want to remove ${String(count)} transaction(s)?`)) {
        selectedIds.forEach(id => {
          removeTransaction(id)
        })
        setSelectedIds(new Set())
        setBulkAction(null)
      }
    } else if (bulkAction === 'exclude') {
      selectedIds.forEach(id => {
        updateTransactionExcluded(id, true)
      })
      setSelectedIds(new Set())
      setBulkAction(null)
    } else if (bulkAction === 'unexclude') {
      selectedIds.forEach(id => {
        updateTransactionExcluded(id, false)
      })
      setSelectedIds(new Set())
      setBulkAction(null)
    } else if (bulkAction === 'setCategory' && bulkCategory) {
      // bulkCategory is a category name, convert to ID
      const categoryId = getCategoryIdFromName(bulkCategory, categoryMetadata)
      if (categoryId) {
        selectedIds.forEach(id => {
          updateTransactionCategory(id, categoryId)
        })
        setSelectedIds(new Set())
        setBulkAction(null)
        setBulkCategory('')
      }
    }
  }

  const handleClearSelection = () => {
    setSelectedIds(new Set())
    setBulkAction(null)
    setBulkCategory('')
  }

  const handleQuickAddCategory = (transactionId: string, description: string) => {
    setQuickAddTransactionId(transactionId)
    setQuickAddSelectedCategory('new')
    setQuickAddCustomCategory('')
    setQuickAddKeyword(description)
  }

  const handleSaveQuickAdd = () => {
    if (!quickAddTransactionId) return

    const transaction = transactions.find(t => t.id === quickAddTransactionId)
    if (!transaction) return

    let categoryName = ''
    if (quickAddSelectedCategory === 'new') {
      if (!quickAddCustomCategory.trim()) {
        alert('Please enter a category name')
        return
      }
      categoryName = quickAddCustomCategory.trim()
    } else {
      categoryName = quickAddSelectedCategory
    }

    if(quickAddSelectedCategory === 'new' && categories.includes(categoryName)) {
      alert('Category with this name already exists. Please choose a different name.')
      return
    }

    if (!quickAddKeyword.trim()) {
      alert('Please enter at least one keyword')
      return
    }

    const keywords = quickAddKeyword.split(',').map(k => k.trim()).filter(k => k)
    updateCategory(categoryName, keywords, true)

    // Update the transaction's category (convert name to ID)
    // Use getOrCreateCategoryId since we just created the category
    const categoryId = getOrCreateCategoryId(categoryName, categoryMetadata)
    console.log(`created cat ${categoryId}`)
    // updateTransactionCategory(quickAddTransactionId, categoryId)

    // Close the modal
    setQuickAddTransactionId(null)
    setQuickAddSelectedCategory('new')
    setQuickAddCustomCategory('')
    setQuickAddKeyword('')
  }

  const handleCancelQuickAdd = () => {
    setQuickAddTransactionId(null)
    setQuickAddSelectedCategory('new')
    setQuickAddCustomCategory('')
    setQuickAddKeyword('')
  }

  const handleEdit = (transaction: Transaction) => {
    setEditTransactionId(transaction.id)
    setEditDate(transaction.date)
    setEditCategory(transaction.category ?? '')
    setEditComment(transaction.comment || '')
    setEditExcluded(transaction.excluded)
  }

  const handleSaveEdit = () => {
    if (editTransactionId) {
      updateTransactionDate(editTransactionId, editDate)
      updateTransactionCategory(editTransactionId, editCategory === '' ? null : editCategory)
      updateTransactionComment(editTransactionId, editComment)
      updateTransactionExcluded(editTransactionId, editExcluded)
    }
    setEditTransactionId(null)
    setEditDate('')
    setEditCategory('')
    setEditComment('')
    setEditExcluded(false)
  }

  const handleCancelEdit = () => {
    setEditTransactionId(null)
    setEditDate('')
    setEditCategory('')
    setEditComment('')
    setEditExcluded(false)
  }

  return (
    <>
      <SectionHeader>Transactions Table</SectionHeader>

      <TransactionsFilters
        availableMonths={availableMonths}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedMonthFilter={selectedMonthFilter}
        amountFilterType={amountFilterType}
        amountFilterValue={amountFilterValue}
        onSearchQueryChange={setSearchQuery}
        onSelectedCategoryChange={setSelectedCategory}
        onSelectedMonthFilterChange={setSelectedMonthFilter}
        onAmountFilterChange={(type, value) => {
          setAmountFilterType(type)
          setAmountFilterValue(value)
        }}
      />

      <Panel>
        <TransactionsBulkActions
          selectedCount={selectedIds.size}
          totalCount={transactions.length}
          filteredCount={filteredAndSortedTransactions.length}
          bulkAction={bulkAction}
          onBulkActionChange={setBulkAction}
          bulkCategory={bulkCategory}
          onBulkCategoryChange={setBulkCategory}
          onApplyBulkAction={handleApplyBulkAction}
          onClearSelection={handleClearSelection}
        />
      </Panel>

      {filteredAndSortedTransactions.length > 0
        ? (
          <Panel>
            <table className={styles['table']}>
              <TransactionsTableHeader
                allSelected={allSelected}
                someSelected={someSelected}
                onSelectAll={handleSelectAll}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSortColumnChange={setSortColumn}
                onSortDirectionChange={setSortDirection}
              />
              <tbody>
              {filteredAndSortedTransactions.map(t => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  isSelected={selectedIds.has(t.id)}
                  onToggleSelect={() => {
                    handleToggleSelect(t.id)
                  }}
                  onQuickAddCategory={handleQuickAddCategory}
                  onEdit={handleEdit}
                />
              ))}
              </tbody>
            </table>
          </Panel>
        ) : (
          <Panel>No data</Panel>
        )}

      <EditTransactionModal
        transactionId={editTransactionId}
        date={editDate}
        category={editCategory === '' ? null : editCategory}
        comment={editComment}
        excluded={editExcluded}
        onDateChange={setEditDate}
        onCategoryChange={(id) => {setEditCategory(id ?? '')}}
        onCommentChange={setEditComment}
        onExcludedChange={setEditExcluded}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />

      <QuickAddCategoryModal
        transactionId={quickAddTransactionId}
        selectedCategory={quickAddSelectedCategory}
        customCategory={quickAddCustomCategory}
        keyword={quickAddKeyword}
        onSelectedCategoryChange={setQuickAddSelectedCategory}
        onCustomCategoryChange={setQuickAddCustomCategory}
        onKeywordChange={setQuickAddKeyword}
        onSave={handleSaveQuickAdd}
        onCancel={handleCancelQuickAdd}
      />
    </>
  )
}

export { TransactionsTable }
