import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Transaction, MonthlySummary } from '../parsing/types.ts'
import { parseRules } from '../parsing/parseRules/parseRules.ts'
import { getCategories } from '../parsing/getCategories/getCategories.ts'
import { classifyDescription } from '../parsing/classifyDescription/classifyDescription.ts'
import { processTransactions } from '../parsing/processTransactions/processTransactions.ts'
import rulesContent from '../rules.csv?raw'

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
  csvAccepted: boolean
  selectedMonth: { year: number; month: number } | null
  dateIndex: number
  descriptionIndex: number
  amountIndex: number
  onlyShowOthers: boolean
  amountSortDirection: 'asc' | 'desc' | null
  csvContent: string // Ephemeral - not persisted
  delimiter: string // Ephemeral - not persisted
  
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
  setCsvAccepted: (accepted: boolean) => void
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

// Helper to migrate old customRules format
const migrateCustomRules = (rules: Record<string, string | string[]>): Record<string, string[]> => {
  const migrated: Record<string, string[]> = {}
  for (const [key, value] of Object.entries(rules)) {
    if (Array.isArray(value)) {
      migrated[key] = value
    } else {
      // Old format: keyword -> category, convert to category -> [keyword]
      const category = value
      if (!(category in migrated)) {
        migrated[category] = []
      }
      migrated[category].push(key)
    }
  }
  return migrated
}

const initialState = {
  transactions: [],
  view: 'csv' as View,
  customRules: {},
  csvAccepted: false,
  selectedMonth: null,
  dateIndex: 0,
  descriptionIndex: 1,
  amountIndex: 4,
  onlyShowOthers: false,
  amountSortDirection: null as 'asc' | 'desc' | null,
  csvContent: '',
  delimiter: ';',
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
        // Reset view to CSV if CSV is not accepted
        if (!get().csvAccepted && view !== 'csv') {
          return
        }
        set({ view })
      },
      
      setCsvAccepted: (accepted) => {
        set({ csvAccepted: accepted })
        // Reset view to CSV if CSV is not accepted
        if (!accepted) {
          set({ view: 'csv' })
        }
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
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, date, overridden: true } : t
          ),
        }))
      },
      
      updateTransactionOverrideMode: (id, overrideMode) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, overrideMode } : t
          ),
        }))
      },
      
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
        csvAccepted: state.csvAccepted,
        selectedMonth: state.selectedMonth,
        dateIndex: state.dateIndex,
        descriptionIndex: state.descriptionIndex,
        amountIndex: state.amountIndex,
        onlyShowOthers: state.onlyShowOthers,
        amountSortDirection: state.amountSortDirection,
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Migrate old customRules format if needed
          if (state.customRules) {
            const oldRules = state.customRules as Record<string, string | string[]>
            const hasOldFormat = Object.values(oldRules).some(
              (v) => typeof v === 'string'
            )
            if (hasOldFormat) {
              state.customRules = migrateCustomRules(oldRules)
            }
          }
          
          // Provide defaults for new fields if not present (backward compatibility)
          if (state.selectionType === undefined) {
            state.selectionType = 'month'
          }
          if (state.selectedYear === undefined) {
            state.selectedYear = null
          }
          if (state.activeTab === undefined) {
            state.activeTab = 'expenses'
          }
          if (state.treatLowValueAsOthers === undefined) {
            state.treatLowValueAsOthers = true
          }
          if (state.lowValueThreshold === undefined) {
            state.lowValueThreshold = 100
          }
          if (state.mergeSmallCategories === undefined) {
            state.mergeSmallCategories = true
          }
          if (state.categoryThresholdPercent === undefined) {
            state.categoryThresholdPercent = 1
          }
          if (state.showExportModal === undefined) {
            state.showExportModal = false
          }
          if (state.editingCategory === undefined) {
            state.editingCategory = null
          }
          if (state.editingKeywords === undefined) {
            state.editingKeywords = ''
          }
          if (state.newCategory === undefined) {
            state.newCategory = ''
          }
          if (state.newKeywords === undefined) {
            state.newKeywords = ''
          }
          
          // Reset view to CSV if CSV is not accepted
          if (!state.csvAccepted && state.view !== 'csv') {
            state.view = 'csv'
          }
        }
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
    csvAccepted: state.csvAccepted,
    selectedMonth: state.selectedMonth,
    dateIndex: state.dateIndex,
    descriptionIndex: state.descriptionIndex,
    amountIndex: state.amountIndex,
    onlyShowOthers: state.onlyShowOthers,
    amountSortDirection: state.amountSortDirection,
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
    const data = JSON.parse(jsonString)
    
    // Validate structure
    if (typeof data !== 'object' || data === null) {
      return false
    }
    
    // Validate required fields
    if (!Array.isArray(data.transactions)) {
      return false
    }
    if (typeof data.view !== 'string') {
      return false
    }
    if (typeof data.customRules !== 'object' || data.customRules === null) {
      return false
    }
    if (typeof data.csvAccepted !== 'boolean') {
      return false
    }
    
    // Migrate customRules if needed
    const customRules = migrateCustomRules(
      data.customRules as Record<string, string | string[]>
    )
    
    // Import state with defaults for missing fields
    useStore.setState({
      transactions: data.transactions,
      view: data.view || 'csv',
      customRules,
      csvAccepted: data.csvAccepted,
      selectedMonth: data.selectedMonth ?? null,
      dateIndex: typeof data.dateIndex === 'number' ? data.dateIndex : 0,
      descriptionIndex: typeof data.descriptionIndex === 'number' ? data.descriptionIndex : 1,
      amountIndex: typeof data.amountIndex === 'number' ? data.amountIndex : 4,
      onlyShowOthers: typeof data.onlyShowOthers === 'boolean' ? data.onlyShowOthers : false,
      amountSortDirection:
        data.amountSortDirection === 'asc' || data.amountSortDirection === 'desc'
          ? data.amountSortDirection
          : null,
      selectionType: data.selectionType || 'month',
      selectedYear: data.selectedYear ?? null,
      activeTab: data.activeTab || 'expenses',
      treatLowValueAsOthers:
        typeof data.treatLowValueAsOthers === 'boolean' ? data.treatLowValueAsOthers : true,
      lowValueThreshold:
        typeof data.lowValueThreshold === 'number' ? data.lowValueThreshold : 100,
      mergeSmallCategories:
        typeof data.mergeSmallCategories === 'boolean' ? data.mergeSmallCategories : true,
      categoryThresholdPercent:
        typeof data.categoryThresholdPercent === 'number' ? data.categoryThresholdPercent : 1,
      showExportModal: typeof data.showExportModal === 'boolean' ? data.showExportModal : false,
      editingCategory: data.editingCategory ?? null,
      editingKeywords: data.editingKeywords || '',
      newCategory: data.newCategory || '',
      newKeywords: data.newKeywords || '',
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
