import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Transaction, MonthlySummary } from '../parsing/types.ts'
import { parseRules } from '../parsing/parseRules/parseRules.ts'
import { classifyDescription } from '../parsing/classifyDescription/classifyDescription.ts'
import { processTransactions } from '../parsing/processTransactions/processTransactions.ts'
import rulesContent from '../rules.csv?raw'

// NOTE: This is a development app, not production. No migrations needed.
// Handle everything in-memory only.
const { rules: RULES, metadata: INITIAL_METADATA } = parseRules(rulesContent)
const STORAGE_KEY = 'expense-analyzer-data'

import type { CategoryMetadata } from '../parsing/categoryTypes.ts'
export type { CategoryMetadata }

import { getCategoryIdFromName, getCategoryNameFromId, getOrCreateCategoryId } from '../parsing/categoryUtils.ts'

const INITIAL_CATEGORY_METADATA = INITIAL_METADATA

type View = 'csv' | 'categories' | 'transactions' | 'summary' | 'chart' | 'budget'
type SelectionType = 'month' | 'year' | 'all'
type TabType = 'expenses' | 'chart' | 'categories' | 'budget'

interface AppState {
  // App-level state
  transactions: Transaction[]
  view: View
  customRules: Record<string, string[]> // category ID -> keywords
  categoryMetadata: CategoryMetadata // category ID -> category name
  selectedMonth: { year: number; month: number } | null
  dateIndex: number
  descriptionIndex: number
  amountIndex: number
  onlyShowOthers: boolean
  amountSortDirection: 'asc' | 'desc' | null
  csvContent: string // Ephemeral - not persisted
  delimiter: string // Ephemeral - not persisted
  
  // TransactionsTable filters and sorting
  searchQuery: string
  selectedCategory: string | null // category ID
  selectedMonthFilter: string | null // Format: "YYYY-MM"
  amountFilterType: 'none' | 'less' | 'greater' | null
  amountFilterValue: number | null
  sortColumn: 'date' | 'description' | 'category' | 'amount' | 'addedAt' | null
  sortDirection: 'asc' | 'desc' | null
  
  // DataByPeriod UI state
  selectionType: SelectionType
  selectedYear: number | null
  activeTab: TabType
  treatLowValueAsOthers: boolean
  lowValueThreshold: number
  mergeSmallCategories: boolean
  categoryThresholdPercent: number
  
  // Categories UI state
  showExportModal: boolean
  editingCategory: string | null // category ID
  editingKeywords: string
  newCategory: string // category name (for UI)
  newKeywords: string
  
  // Budget state
  budgets: Record<string, number> // category ID -> monthly budget amount
  
  // Actions
  setView: (view: View) => void
  setCsvContent: (content: string) => void
  setDelimiter: (delimiter: string) => void
  setDateIndex: (index: number) => void
  setDescriptionIndex: (index: number) => void
  setAmountIndex: (index: number) => void
  setTransactions: (transactions: Transaction[]) => void
  setSelectedMonth: (month: { year: number; month: number } | null) => void
  setCustomRules: (rules: Record<string, string[]>) => void
  setCategoryMetadata: (metadata: CategoryMetadata) => void
  setOnlyShowOthers: (value: boolean) => void
  setAmountSortDirection: (direction: 'asc' | 'desc' | null) => void
  
  // Transaction actions
  updateTransactionExcluded: (id: string, excluded: boolean) => void
  updateTransactionCategory: (id: string, categoryId: string) => void
  updateTransactionDate: (id: string, date: string) => void
  updateTransactionOverrideMode: (id: string, overrideMode: boolean) => void
  updateTransactionComment: (id: string, comment: string) => void
  resetTransactionDate: (id: string) => void
  resetTransactionCategory: (id: string) => void
  removeTransaction: (id: string) => void
  
  // TransactionsTable filters and sorting
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string | null) => void
  setSelectedMonthFilter: (month: string | null) => void
  setAmountFilter: (type: 'none' | 'less' | 'greater' | null, value: number | null) => void
  setSortColumn: (column: 'date' | 'description' | 'category' | 'amount' | 'addedAt' | null) => void
  setSortDirection: (direction: 'asc' | 'desc' | null) => void
  
  // Category actions (operate on names for user convenience)
  updateCategory: (categoryName: string, keywords: string[]) => void
  removeCategory: (categoryName: string) => void
  renameCategory: (oldName: string, newName: string) => void
  
  // DataByPeriod actions
  setSelectionType: (type: SelectionType) => void
  setSelectedYear: (year: number | null) => void
  setActiveTab: (tab: TabType) => void
  setTreatLowValueAsOthers: (value: boolean) => void
  setLowValueThreshold: (threshold: number) => void
  setMergeSmallCategories: (value: boolean) => void
  setCategoryThresholdPercent: (percent: number) => void
  
  // Categories UI actions
  setShowExportModal: (show: boolean) => void
  setEditingCategory: (category: string | null) => void
  setEditingKeywords: (keywords: string) => void
  setNewCategory: (category: string) => void
  setNewKeywords: (keywords: string) => void
  
  // Budget actions (operate on names for user convenience)
  setBudget: (categoryName: string, amount: number) => void
  removeBudget: (categoryName: string) => void
  
  // Utility actions
  clearAll: () => void
  reclassifyTransactions: () => void
}

const initialState = {
  transactions: [],
  view: 'csv' as View,
  customRules: {},
  categoryMetadata: INITIAL_CATEGORY_METADATA,
  selectedMonth: null,
  dateIndex: 0,
  descriptionIndex: 1,
  amountIndex: 4,
  onlyShowOthers: false,
  amountSortDirection: null as 'asc' | 'desc' | null,
  csvContent: '',
  delimiter: ';',
  searchQuery: '',
  selectedCategory: null,
  selectedMonthFilter: null,
  amountFilterType: null,
  amountFilterValue: null,
  sortColumn: null,
  sortDirection: null,
  selectionType: 'month' as SelectionType,
  selectedYear: null,
  activeTab: 'expenses' as TabType,
  treatLowValueAsOthers: true,
  lowValueThreshold: 100,
  mergeSmallCategories: true,
  categoryThresholdPercent: 1,
  showExportModal: false,
  editingCategory: null,
  editingKeywords: '',
  newCategory: '',
  newKeywords: '',
  budgets: {},
}

const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setView: (view) => {
        // Allow navigation to any view
        set({ view })
      },
      
      setCsvContent: (content) => set({ csvContent: content }),
      setDelimiter: (delimiter) => set({ delimiter }),
      setDateIndex: (index) => set({ dateIndex: index }),
      setDescriptionIndex: (index) => set({ descriptionIndex: index }),
      setAmountIndex: (index) => set({ amountIndex: index }),
      setTransactions: (transactions) => set({ transactions }),
      setSelectedMonth: (month) => set({ selectedMonth: month }),
      setCustomRules: (rules) => {
        set({ customRules: rules })
        // Re-classify transactions when rules change
        get().reclassifyTransactions()
      },
      
      setCategoryMetadata: (metadata) => {
        set({ categoryMetadata: metadata })
      },
      setOnlyShowOthers: (value) => set({ onlyShowOthers: value }),
      setAmountSortDirection: (direction) => set({ amountSortDirection: direction }),
      
      updateTransactionExcluded: (id, excluded) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, excluded } : t
          ),
        }))
      },
      
      updateTransactionCategory: (id, category) => {
        set((state) => ({
          transactions: state.transactions.map((t) => {
            if (t.id === id) {
              // Store original category if not already stored (first time overriding)
              const originalCategory = t.originalCategory || (!t.categoryOverridden ? t.category : undefined)
              return { 
                ...t, 
                category, 
                categoryOverridden: true,
                overridden: true,
                originalCategory
              }
            }
            return t
          }),
        }))
      },
      
      updateTransactionDate: (id, date) => {
        set((state) => ({
          transactions: state.transactions.map((t) => {
            if (t.id === id) {
              // Store original date if not already stored (first time overriding)
              const originalDate = t.originalDate || (!t.dateOverridden ? t.date : undefined)
              return { 
                ...t, 
                date, 
                dateOverridden: true,
                overridden: true,
                originalDate 
              }
            }
            return t
          }),
        }))
      },
      
      updateTransactionOverrideMode: (id, overrideMode) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, overrideMode } : t
          ),
        }))
      },
      
      updateTransactionComment: (id, comment) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, comment: comment.trim() || undefined } : t
          ),
        }))
      },
      
      resetTransactionDate: (id) => {
        const state = get()
        set({
          transactions: state.transactions.map((t) => {
            if (t.id === id) {
              // Restore original date if it was stored, otherwise keep current date
              const restoredDate = t.originalDate || t.date
              const dateOverridden = false
              const overridden = t.categoryOverridden || false // Keep overridden true if category is still overridden
              return { 
                ...t, 
                date: restoredDate, 
                dateOverridden,
                overridden,
                originalDate: undefined 
              }
            }
            return t
          }),
        })
      },
      
      resetTransactionCategory: (id) => {
        const state = get()
        const allRules = computeAllRules(state.customRules)
        set({
          transactions: state.transactions.map((t) => {
            if (t.id === id) {
              const newCategoryId = classifyDescription(t.description, allRules, state.categoryMetadata)
              const categoryOverridden = false
              const overridden = t.dateOverridden || false // Keep overridden true if date is still overridden
              return { 
                ...t, 
                category: newCategoryId, 
                categoryOverridden,
                overridden,
                originalCategory: undefined 
              }
            }
            return t
          }),
        })
      },
      
      removeTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }))
      },
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSelectedMonthFilter: (month) => set({ selectedMonthFilter: month }),
      setAmountFilter: (type, value) => set({ amountFilterType: type, amountFilterValue: value }),
      setSortColumn: (column) => set({ sortColumn: column }),
      setSortDirection: (direction) => set({ sortDirection: direction }),
      
      updateCategory: (categoryName, keywords) => {
        set((state) => {
          const filtered = keywords.filter((k) => k.trim()).map((k) => k.trim())
          // Get or create category ID (creates new ID if category doesn't exist)
          const categoryId = getOrCreateCategoryId(categoryName, state.categoryMetadata)
          
          // Update metadata if this is a new category
          const newMetadata = { ...state.categoryMetadata }
          if (!newMetadata[categoryId]) {
            newMetadata[categoryId] = categoryName
          }
          
          if (filtered.length === 0) {
            // Remove category if no keywords
            const rest = Object.fromEntries(
              Object.entries(state.customRules).filter(([key]) => key !== categoryId)
            )
            return { customRules: rest, categoryMetadata: newMetadata }
          }
          return {
            customRules: { ...state.customRules, [categoryId]: filtered },
            categoryMetadata: newMetadata,
          }
        })
        // Re-classify transactions when rules change
        get().reclassifyTransactions()
      },
      
      removeCategory: (categoryName) => {
        set((state) => {
          const categoryId = getCategoryIdFromName(categoryName, state.categoryMetadata)
          if (!categoryId) {
            // Category doesn't exist, nothing to remove
            return {}
          }
          const rest = Object.fromEntries(
            Object.entries(state.customRules).filter(([key]) => key !== categoryId)
          )
          return { customRules: rest }
        })
        // Re-classify transactions when rules change
        get().reclassifyTransactions()
      },
      
      renameCategory: (oldName, newName) => {
        set((state) => {
          const categoryId = getCategoryIdFromName(oldName, state.categoryMetadata)
          if (!categoryId) {
            // Category doesn't exist, nothing to rename
            return {}
          }
          
          // Keep the same ID, just update the name in metadata
          // IDs are now independent of names, so renaming is simple
          const newMetadata: CategoryMetadata = {
            ...state.categoryMetadata,
            [categoryId]: newName
          }
          
          return {
            categoryMetadata: newMetadata,
          }
        })
        // No need to reclassify - we're just changing the display name, not the category ID
      },
      
      setSelectionType: (type) => set({ selectionType: type }),
      setSelectedYear: (year) => set({ selectedYear: year }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setTreatLowValueAsOthers: (value) => set({ treatLowValueAsOthers: value }),
      setLowValueThreshold: (threshold) => set({ lowValueThreshold: threshold }),
      setMergeSmallCategories: (value) => set({ mergeSmallCategories: value }),
      setCategoryThresholdPercent: (percent) => set({ categoryThresholdPercent: percent }),
      
      setShowExportModal: (show) => set({ showExportModal: show }),
      setEditingCategory: (category) => set({ editingCategory: category }),
      setEditingKeywords: (keywords) => set({ editingKeywords: keywords }),
      setNewCategory: (category) => set({ newCategory: category }),
      setNewKeywords: (keywords) => set({ newKeywords: keywords }),
      
      setBudget: (categoryName, amount) => {
        set((state) => {
          const categoryId = getCategoryIdFromName(categoryName, state.categoryMetadata)
          if (!categoryId) {
            // Category doesn't exist, nothing to set budget for
            return {}
          }
          return {
            budgets: { ...state.budgets, [categoryId]: amount }
          }
        })
      },
      
      removeBudget: (categoryName) => {
        set((state) => {
          const categoryId = getCategoryIdFromName(categoryName, state.categoryMetadata)
          if (!categoryId) {
            // Category doesn't exist, nothing to remove
            return {}
          }
          const rest: Record<string, number> = {}
          for (const [id, amount] of Object.entries(state.budgets)) {
            if (id !== categoryId) {
              rest[id] = amount
            }
          }
          return { budgets: rest }
        })
      },
      
      clearAll: () => {
        set({
          ...initialState,
          // Keep csvContent and delimiter as they are ephemeral
          csvContent: '',
          delimiter: ';',
        })
      },
      
      reclassifyTransactions: () => {
        const state = get()
        if (state.transactions.length === 0) return
        
        const allRules = computeAllRules(state.customRules)
        // Always create new transaction objects to ensure React detects changes
        set({
          transactions: state.transactions.map((t) => {
            if (t.categoryOverridden) {
              return { ...t } // Create new object even for overridden categories
            }
            const newCategoryId = classifyDescription(t.description, allRules, state.categoryMetadata)
            return {
              ...t,
              category: newCategoryId,
            }
          }),
        })
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist non-ephemeral state
        transactions: state.transactions,
        view: state.view,
        customRules: state.customRules,
        selectedMonth: state.selectedMonth,
        dateIndex: state.dateIndex,
        descriptionIndex: state.descriptionIndex,
        amountIndex: state.amountIndex,
        onlyShowOthers: state.onlyShowOthers,
        amountSortDirection: state.amountSortDirection,
        searchQuery: state.searchQuery,
        selectedCategory: state.selectedCategory,
        selectedMonthFilter: state.selectedMonthFilter,
        amountFilterType: state.amountFilterType,
        amountFilterValue: state.amountFilterValue,
        sortColumn: state.sortColumn,
        sortDirection: state.sortDirection,
        selectionType: state.selectionType,
        selectedYear: state.selectedYear,
        activeTab: state.activeTab,
        treatLowValueAsOthers: state.treatLowValueAsOthers,
        lowValueThreshold: state.lowValueThreshold,
        mergeSmallCategories: state.mergeSmallCategories,
        categoryThresholdPercent: state.categoryThresholdPercent,
        showExportModal: state.showExportModal,
        editingCategory: state.editingCategory,
        editingKeywords: state.editingKeywords,
        newCategory: state.newCategory,
        newKeywords: state.newKeywords,
      }),
      onRehydrateStorage: () => () => {
        // No migration needed - this is a development app
      },
    }
  )
)

// Computed selectors
// RULES already uses category IDs as keys
const computeAllRules = (customRules: Record<string, string[]>): Record<string, string[]> => {
  // Merge RULES (which uses IDs) with custom rules (which also use IDs)
  const merged: Record<string, string[]> = { ...RULES }
  for (const [categoryId, keywords] of Object.entries(customRules)) {
    if (merged[categoryId]) {
      // Merge arrays, avoiding duplicates
      const existing = new Set(merged[categoryId])
      keywords.forEach((k) => existing.add(k))
      merged[categoryId] = Array.from(existing)
    } else {
      merged[categoryId] = [...keywords]
    }
  }
  return merged
}

const useAllRules = () => {
  const customRules = useStore((state) => state.customRules)
  return computeAllRules(customRules)
}

const useCategories = () => {
  const categoryMetadata = useStore((state) => state.categoryMetadata)
  return Object.values(categoryMetadata).sort()
}

const useCategoryMetadata = () => {
  return useStore((state) => state.categoryMetadata)
}

const useSummaries = (): MonthlySummary[] | null => {
  const transactions = useStore((state) => state.transactions)
  const allRules = useAllRules()
  const categoryMetadata = useStore((state) => state.categoryMetadata)
  
  if (transactions.length === 0) {
    return null
  }
  
  const activeTransactions = transactions.filter((t) => !t.excluded)
  if (activeTransactions.length === 0) {
    return []
  }
  
  return processTransactions(activeTransactions, allRules, categoryMetadata)
}

// Export/Import functions
const exportState = (): string => {
  const state = useStore.getState()
  const exportData = {
    transactions: state.transactions,
    view: state.view,
    customRules: state.customRules,
    selectedMonth: state.selectedMonth,
    dateIndex: state.dateIndex,
    descriptionIndex: state.descriptionIndex,
    amountIndex: state.amountIndex,
    onlyShowOthers: state.onlyShowOthers,
    amountSortDirection: state.amountSortDirection,
    searchQuery: state.searchQuery,
    selectedCategory: state.selectedCategory,
    selectedMonthFilter: state.selectedMonthFilter,
    amountFilterType: state.amountFilterType,
    amountFilterValue: state.amountFilterValue,
    sortColumn: state.sortColumn,
    sortDirection: state.sortDirection,
    selectionType: state.selectionType,
    selectedYear: state.selectedYear,
    activeTab: state.activeTab,
    treatLowValueAsOthers: state.treatLowValueAsOthers,
    lowValueThreshold: state.lowValueThreshold,
    mergeSmallCategories: state.mergeSmallCategories,
    categoryThresholdPercent: state.categoryThresholdPercent,
    showExportModal: state.showExportModal,
    editingCategory: state.editingCategory,
    editingKeywords: state.editingKeywords,
    newCategory: state.newCategory,
    newKeywords: state.newKeywords,
    budgets: state.budgets,
  }
  return JSON.stringify(exportData, null, 2)
}

const importState = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString) as AppState

    useStore.setState({
      transactions: data.transactions,
      view: data.view,
      customRules: data.customRules,
      selectedMonth: data.selectedMonth,
      dateIndex: data.dateIndex,
      descriptionIndex: data.descriptionIndex,
      amountIndex: data.amountIndex,
    onlyShowOthers: data.onlyShowOthers,
    amountSortDirection: data.amountSortDirection,
    searchQuery: data.searchQuery || '',
    selectedCategory: data.selectedCategory || null,
    selectedMonthFilter: data.selectedMonthFilter || null,
    amountFilterType: data.amountFilterType || null,
    amountFilterValue: data.amountFilterValue || null,
    sortColumn: data.sortColumn || null,
    sortDirection: data.sortDirection || null,
    selectionType: data.selectionType,
    selectedYear: data.selectedYear,
      activeTab: data.activeTab,
      treatLowValueAsOthers: data.treatLowValueAsOthers,
      lowValueThreshold: data.lowValueThreshold,
      mergeSmallCategories: data.mergeSmallCategories,
      categoryThresholdPercent: data.categoryThresholdPercent,
      showExportModal: data.showExportModal,
      editingCategory: data.editingCategory,
      editingKeywords: data.editingKeywords,
      newCategory: data.newCategory,
      newKeywords: data.newKeywords,
    })
    
    // Re-classify transactions after import
    useStore.getState().reclassifyTransactions()
    
    return true
  } catch {
    return false
  }
}

export type { View, SelectionType, TabType, CategoryMetadata }
export { 
  useStore, 
  computeAllRules, 
  useAllRules, 
  useCategories, 
  useCategoryMetadata,
  useSummaries, 
  exportState, 
  importState,
  getCategoryIdFromName,
  getCategoryNameFromId,
  getOrCreateCategoryId
}

// Re-export for convenience
export { generateCategoryId } from '../parsing/categoryUtils.ts'
