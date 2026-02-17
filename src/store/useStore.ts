import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Transaction, MonthlySummary } from '../parsing/types.ts'
import { parseRules } from '../parsing/parseRules/parseRules.ts'
import { classifyDescription } from '../parsing/classifyDescription/classifyDescription.ts'
import { processTransactions } from '../parsing/processTransactions/processTransactions.ts'

// NOTE: This is a development app, not production. No migrations needed.
// Start with 0 categories. User imports or adds categories.
const { rules: RULES, metadata: INITIAL_METADATA } = parseRules('')
const STORAGE_KEY = 'expense-analyzer-data'

import type { CategoryMetadata } from '../parsing/categoryTypes.ts'
export type { CategoryMetadata }

import { getCategoryIdFromName, getCategoryNameFromId, getOrCreateCategoryId } from '../parsing/categoryUtils.ts'

const INITIAL_CATEGORY_METADATA = INITIAL_METADATA

export type View = 'csv' | 'categories' | 'transactions' | 'summary' | 'chart' | 'budget'

/** Persistent state only: transactions, categories (metadata + rules), and bonds (budgets). */
interface AppState {
  transactions: Transaction[]
  customRules: Record<string, string[]> // category ID -> keywords
  categoryMetadata: CategoryMetadata // category ID -> category name
  budgets: Record<string, number> // category ID -> monthly budget amount

  setTransactions: (transactions: Transaction[]) => void
  updateTransactionExcluded: (id: string, excluded: boolean) => void
  updateTransactionCategory: (id: string, categoryId: string | null) => void
  updateTransactionDate: (id: string, date: string) => void
  updateTransactionOverrideMode: (id: string, overrideMode: boolean) => void
  updateTransactionComment: (id: string, comment: string) => void
  resetTransactionDate: (id: string) => void
  resetTransactionCategory: (id: string) => void
  removeTransaction: (id: string) => void

  setCustomRules: (rules: Record<string, string[]>) => void
  setCategoryMetadata: (metadata: CategoryMetadata) => void
  updateCategory: (categoryName: string, keywords: string[]) => void
  removeCategory: (categoryName: string) => void
  renameCategory: (oldName: string, newName: string) => void
  replaceCategories: (categories: Record<string, string[]>) => void

  setBudget: (categoryName: string, amount: number) => void
  removeBudget: (categoryName: string) => void

  clearAll: () => void
  reclassifyTransactions: () => void
}

const initialData = {
  transactions: [] as Transaction[],
  customRules: {} as Record<string, string[]>,
  categoryMetadata: INITIAL_CATEGORY_METADATA,
  budgets: {} as Record<string, number>,
}

const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData,

      setTransactions: (transactions) => set({ transactions }),

      updateTransactionExcluded: (id, excluded) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, excluded } : t
          ),
        }))
      },

      updateTransactionCategory: (id, categoryId) => {
        set((state) => ({
          transactions: state.transactions.map((t) => {
            if (t.id === id) {
              const originalCategory = t.originalCategory ?? (!t.categoryOverridden ? t.category : undefined)
              return {
                ...t,
                category: categoryId,
                categoryOverridden: true,
                overridden: true,
                originalCategory,
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
              const originalDate = t.originalDate || (!t.dateOverridden ? t.date : undefined)
              return {
                ...t,
                date,
                dateOverridden: true,
                overridden: true,
                originalDate,
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
              const restoredDate = t.originalDate || t.date
              const dateOverridden = false
              const overridden = t.categoryOverridden || false
              return {
                ...t,
                date: restoredDate,
                dateOverridden,
                overridden,
                originalDate: undefined,
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
              const overridden = t.dateOverridden || false
              return {
                ...t,
                category: newCategoryId,
                categoryOverridden,
                overridden,
                originalCategory: undefined,
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

      setCustomRules: (rules) => {
        set({ customRules: rules })
        get().reclassifyTransactions()
      },

      setCategoryMetadata: (metadata) => set({ categoryMetadata: metadata }),

      updateCategory: (categoryName, keywords) => {
        set((state) => {
          const filtered = keywords.filter((k) => k.trim()).map((k) => k.trim())
          const categoryId = getOrCreateCategoryId(categoryName, state.categoryMetadata)
          const newMetadata = { ...state.categoryMetadata }
          if (!newMetadata[categoryId]) {
            newMetadata[categoryId] = categoryName
          }
          if (filtered.length === 0) {
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
        get().reclassifyTransactions()
      },

      removeCategory: (categoryName) => {
        set((state) => {
          const categoryId = getCategoryIdFromName(categoryName, state.categoryMetadata)
          if (!categoryId) return {}
          const rest = Object.fromEntries(
            Object.entries(state.customRules).filter(([key]) => key !== categoryId)
          )
          return { customRules: rest }
        })
        get().reclassifyTransactions()
      },

      renameCategory: (oldName, newName) => {
        set((state) => {
          const categoryId = getCategoryIdFromName(oldName, state.categoryMetadata)
          if (!categoryId) return {}
          return {
            categoryMetadata: {
              ...state.categoryMetadata,
              [categoryId]: newName,
            },
          }
        })
      },

      replaceCategories: (categories) => {
        const metadata: CategoryMetadata = {}
        const rules: Record<string, string[]> = {}
        for (const [categoryName, keywords] of Object.entries(categories)) {
          const id = getOrCreateCategoryId(categoryName, metadata)
          metadata[id] = categoryName
          rules[id] = keywords
        }
        set({ customRules: rules, categoryMetadata: metadata, budgets: {} })
        get().reclassifyTransactions()
      },

      setBudget: (categoryName, amount) => {
        set((state) => {
          const categoryId = getCategoryIdFromName(categoryName, state.categoryMetadata)
          if (!categoryId) return {}
          return {
            budgets: { ...state.budgets, [categoryId]: amount },
          }
        })
      },

      removeBudget: (categoryName) => {
        set((state) => {
          const categoryId = getCategoryIdFromName(categoryName, state.categoryMetadata)
          if (!categoryId) return {}
          const rest: Record<string, number> = {}
          for (const [id, amount] of Object.entries(state.budgets)) {
            if (id !== categoryId) rest[id] = amount
          }
          return { budgets: rest }
        })
      },

      clearAll: () => set(initialData),

      reclassifyTransactions: () => {
        const state = get()
        if (state.transactions.length === 0) return
        const allRules = computeAllRules(state.customRules)
        set({
          transactions: state.transactions.map((t) => {
            if (t.categoryOverridden) return { ...t }
            const newCategoryId = classifyDescription(t.description, allRules, state.categoryMetadata)
            return { ...t, category: newCategoryId }
          }),
        })
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        customRules: state.customRules,
        categoryMetadata: state.categoryMetadata,
        budgets: state.budgets,
      }),
    }
  )
)

const computeAllRules = (customRules: Record<string, string[]>): Record<string, string[]> => {
  const merged: Record<string, string[]> = { ...RULES }
  for (const [categoryId, keywords] of Object.entries(customRules)) {
    if (merged[categoryId]) {
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

  if (transactions.length === 0) return null
  const activeTransactions = transactions.filter((t) => !t.excluded)
  if (activeTransactions.length === 0) return []
  return processTransactions(activeTransactions, allRules, categoryMetadata)
}

const exportState = (): string => {
  const state = useStore.getState()
  const exportData = {
    transactions: state.transactions,
    customRules: state.customRules,
    categoryMetadata: state.categoryMetadata,
    budgets: state.budgets,
  }
  return JSON.stringify(exportData, null, 2)
}

const importState = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString) as {
      transactions?: Transaction[]
      customRules?: Record<string, string[]>
      categoryMetadata?: CategoryMetadata
      budgets?: Record<string, number>
    }
    useStore.setState({
      transactions: data.transactions ?? [],
      customRules: data.customRules ?? {},
      categoryMetadata: data.categoryMetadata ?? INITIAL_CATEGORY_METADATA,
      budgets: data.budgets ?? {},
    })
    useStore.getState().reclassifyTransactions()
    return true
  } catch {
    return false
  }
}

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
  getOrCreateCategoryId,
}
export { generateCategoryId } from '../parsing/categoryUtils.ts'
