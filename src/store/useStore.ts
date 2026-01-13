import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Transaction, MonthlySummary } from '../parsing/types.ts'
import { parseRules } from '../parsing/parseRules/parseRules.ts'
import { getCategories } from '../parsing/getCategories/getCategories.ts'
import { classifyDescription } from '../parsing/classifyDescription/classifyDescription.ts'
import { processTransactions } from '../parsing/processTransactions/processTransactions.ts'
import { hashTransaction } from '../parsing/hashTransaction/hashTransaction.ts'
import rulesContent from '../rules.csv?raw'

// NOTE: This is a development app, not production. No migrations needed.
// Handle everything in-memory only.
const RULES = parseRules(rulesContent)
const STORAGE_KEY = 'expense-analyzer-data'

type View = 'csv' | 'categories' | 'transactions' | 'summary' | 'chart'
type SelectionType = 'month' | 'year' | 'all'
type TabType = 'expenses' | 'chart' | 'categories'

interface AppState {
  // App-level state
  transactions: Transaction[]
  view: View
  customRules: Record<string, string[]>
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
  selectedCategory: string | null
  selectedMonthFilter: string | null // Format: "YYYY-MM"
  amountFilterType: 'none' | 'less' | 'greater' | null
  amountFilterValue: number | null
  sortColumn: 'date' | 'description' | 'category' | 'amount' | null
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
  editingCategory: string | null
  editingKeywords: string
  newCategory: string
  newKeywords: string
  
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
  setOnlyShowOthers: (value: boolean) => void
  setAmountSortDirection: (direction: 'asc' | 'desc' | null) => void
  
  // Transaction actions
  updateTransactionExcluded: (id: string, excluded: boolean) => void
  updateTransactionCategory: (id: string, category: string) => void
  updateTransactionDate: (id: string, date: string) => void
  updateTransactionOverrideMode: (id: string, overrideMode: boolean) => void
  removeTransaction: (id: string) => void
  
  // TransactionsTable filters and sorting
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string | null) => void
  setSelectedMonthFilter: (month: string | null) => void
  setAmountFilter: (type: 'none' | 'less' | 'greater' | null, value: number | null) => void
  setSortColumn: (column: 'date' | 'description' | 'category' | 'amount' | null) => void
  setSortDirection: (direction: 'asc' | 'desc' | null) => void
  
  // Category actions
  updateCategory: (category: string, keywords: string[]) => void
  removeCategory: (category: string) => void
  
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
  
  // Utility actions
  clearAll: () => void
  reclassifyTransactions: () => void
}

const initialState = {
  transactions: [],
  view: 'csv' as View,
  customRules: {},
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
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, category, overridden: true } : t
          ),
        }))
      },
      
      updateTransactionDate: (id, date) => {
        set((state) => ({
          transactions: state.transactions.map((t) => {
            if (t.id === id) {
              // Regenerate hash when date changes
              const newHash = hashTransaction(date, t.description, t.amount)
              return { ...t, date, hash: newHash, overridden: true }
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
      
      updateCategory: (category, keywords) => {
        set((state) => {
          const filtered = keywords.filter((k) => k.trim()).map((k) => k.trim())
          if (filtered.length === 0) {
            // Remove category if no keywords
            const rest = Object.fromEntries(
              Object.entries(state.customRules).filter(([key]) => key !== category)
            )
            return { customRules: rest }
          }
          return {
            customRules: { ...state.customRules, [category]: filtered },
          }
        })
        // Re-classify transactions when rules change
        get().reclassifyTransactions()
      },
      
      removeCategory: (category) => {
        set((state) => {
          const rest = Object.fromEntries(
            Object.entries(state.customRules).filter(([key]) => key !== category)
          )
          return { customRules: rest }
        })
        // Re-classify transactions when rules change
        get().reclassifyTransactions()
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
        set({
          transactions: state.transactions.map((t) => {
            if (t.overridden) {
              return t // Keep overridden categories
            }
            const newCategory = classifyDescription(t.description, allRules)
            if (t.category === newCategory) {
              return t // No change needed
            }
            return {
              ...t,
              category: newCategory,
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
        // No migration needed - this is a development app, handle everything in-memory
      },
    }
  )
)

// Computed selectors
const computeAllRules = (customRules: Record<string, string[]>): Record<string, string[]> => {
  const merged: Record<string, string[]> = { ...RULES }
  for (const [category, keywords] of Object.entries(customRules)) {
    if (merged[category]) {
      // Merge arrays, avoiding duplicates
      const existing = new Set(merged[category])
      keywords.forEach((k) => existing.add(k))
      merged[category] = Array.from(existing)
    } else {
      merged[category] = [...keywords]
    }
  }
  return merged
}

const useAllRules = () => {
  const customRules = useStore((state) => state.customRules)
  return computeAllRules(customRules)
}

const useCategories = () => {
  const allRules = useAllRules()
  return getCategories(allRules)
}

const useSummaries = (): MonthlySummary[] | null => {
  const transactions = useStore((state) => state.transactions)
  const allRules = useAllRules()
  
  if (transactions.length === 0) {
    return null
  }
  
  const activeTransactions = transactions.filter((t) => !t.excluded)
  if (activeTransactions.length === 0) {
    return []
  }
  
  return processTransactions(activeTransactions, allRules)
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

export type { View, SelectionType, TabType }
export { useStore, computeAllRules, useAllRules, useCategories, useSummaries, exportState, importState }
