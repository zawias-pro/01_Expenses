import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Transaction, MonthlySummary } from '../parsing/types.ts'
import { parseRules } from '../parsing/parseRules/parseRules.ts'
import { classifyDescription } from '../parsing/classifyDescription/classifyDescription.ts'
import { processTransactions } from '../parsing/processTransactions/processTransactions.ts'
import { parseAmount } from '../parsing/parseAmount/parseAmount.ts'

// NOTE: This is a development app, not production. No migrations needed.
// Start with 0 categories. User imports or adds categories.
const { rules: RULES, metadata: INITIAL_METADATA } = parseRules('')
const STORAGE_KEY = 'expense-analyzer-data'

import type { CategoryMetadata } from '../parsing/categoryTypes.ts'
export type { CategoryMetadata }

import { getCategoryIdFromName, getCategoryNameFromId, getOrCreateCategoryId } from '../parsing/categoryUtils.ts'

const INITIAL_CATEGORY_METADATA = INITIAL_METADATA

type View = 'csv' | 'categories' | 'transactions' | 'summary' | 'chart'
type PeriodSelectionType = 'month' | 'year' | 'all'

interface PeriodSelectionState {
  selectionType: PeriodSelectionType
  selectedYear: number | null
  selectedMonth: { year: number; month: number } | null

  setSelectionType: (type: PeriodSelectionType) => void
  setSelectedYear: (year: number | null) => void
  setSelectedMonth: (month: { year: number; month: number } | null) => void
}

interface AppState extends PeriodSelectionState {
  transactions: Transaction[]
  customRules: Record<string, string[]> // category ID -> keywords
  categoryMetadata: CategoryMetadata // category ID -> category name

  setTransactions: (transactions: Transaction[]) => void
  updateTransactionExcluded: (id: string, excluded: boolean) => void
  toggleTransactionExcluded: (id: string) => void
  updateTransactionCategory: (id: string, categoryId: string | null) => void
  updateTransactionDate: (id: string, date: string) => void
  updateTransactionOverrideMode: (id: string, overrideMode: boolean) => void
  updateTransactionComment: (id: string, comment: string) => void
  resetTransactionDate: (id: string) => void
  resetTransactionCategory: (id: string) => void
  removeTransaction: (id: string) => void

  setCustomRules: (rules: Record<string, string[]>) => void
  setCategoryMetadata: (metadata: CategoryMetadata) => void
  updateCategory: (categoryName: string, keywords: string[], preservePreviousKeywords?: boolean) => void
  removeCategory: (categoryName: string) => void
  renameCategory: (oldName: string, newName: string) => void
  replaceCategories: (categories: Record<string, string[]>) => void

  clearAll: () => void
  reclassifyTransactions: () => void
}

const initialData = {
  transactions: [] as Transaction[],
  customRules: {} as Record<string, string[]>,
  categoryMetadata: INITIAL_CATEGORY_METADATA,
  selectionType: 'month' as PeriodSelectionType,
  selectedYear: null as number | null,
  selectedMonth: null as { year: number; month: number } | null,
}

const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData,

      setSelectionType: (selectionType) => set({ selectionType }),
      setSelectedYear: (selectedYear) => set({ selectedYear }),
      setSelectedMonth: (selectedMonth) => set({ selectedMonth }),

      setTransactions: (transactions) => set({ transactions }),

      updateTransactionExcluded: (id, excluded) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, excluded } : t
          ),
        }))
      },

      toggleTransactionExcluded: (id) => {

        set((state) => ({
          transactions: state.transactions.map((t) => {
              if (t.id === id) {
                return { ...t, excluded: !t.excluded }
              }

              return t
            }
          ),
        }))
      },

      updateTransactionCategory: (id, categoryId) => {
        set((state) => ({
          transactions: state.transactions.map((t) => {
            if (t.id === id) {
              return {
                ...t,
                category: categoryId,
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
              return {
                ...t,
                date,
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
        set(state => ({
          transactions: state.transactions.map((t) => {
            if (t.id === id) {
              return {
                ...t,
                date: t.originalDate,
              }
            }
            return t
          }),
        }))
      },

      resetTransactionCategory: (id) => {
        set((state) => ({
          transactions: state.transactions.map((t) => {
            if (t.id === id) {
              return {
                ...t,
                category: t.originalCategory,
              }
            }
            return t
          }),
        }))
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

      updateCategory: (categoryName, keywords, preservePreviousKeywords) => {
        set((state) => {
          const categoryId = getOrCreateCategoryId(categoryName, state.categoryMetadata)

          const previousKeywords = preservePreviousKeywords
            ?(state.customRules[categoryId] || [])
            :[]

          const filtered = [...previousKeywords, ...keywords].filter((k) => k.trim()).map((k) => k.trim())

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
        set({ customRules: rules, categoryMetadata: metadata })
        get().reclassifyTransactions()
      },

      clearAll: () => set(initialData),

      reclassifyTransactions: () => {
        set((state) => {
          const allRules = computeAllRules(state.customRules)

          return {
            transactions: state.transactions.map((t) => {
              const hasCustomCategory = t.category !== t.originalCategory
              const newCategoryId = classifyDescription(t.description, allRules)

              return {
                ...t,
                originalCategory: newCategoryId,
                category: hasCustomCategory?t.category:newCategoryId
              }
            }),
          }
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
        selectionType: state.selectionType,
        selectedYear: state.selectedYear,
        selectedMonth: state.selectedMonth,
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

const useCategoriesSortedByTotalAmount = () => {
  const transactions = useStore((state) => state.transactions)
  const categoryMetadata = useStore((state) => state.categoryMetadata)

  return useMemo(() => {
    const totalsByCategoryId: Record<string, number> = {}

    transactions.forEach((transaction) => {
      if (transaction.excluded || transaction.category === null) {
        return
      }

      const amount = Math.abs(parseAmount(transaction.amount))
      totalsByCategoryId[transaction.category] = (totalsByCategoryId[transaction.category] || 0) + amount
    })

    return Object.entries(categoryMetadata)
      .map(([categoryId, categoryName]) => ({
        categoryId,
        categoryName,
        totalAmount: totalsByCategoryId[categoryId] || 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount || a.categoryName.localeCompare(b.categoryName))
      .map(c=>c.categoryId)
  }, [categoryMetadata, transactions])
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

const useSummaries = (): MonthlySummary[] => {
  const transactions = useStore((state) => state.transactions)

  const activeTransactions = transactions.filter((t) => !t.excluded)
  if (activeTransactions.length === 0) return []
  return processTransactions(activeTransactions)
}

const exportState = (): string => {
  const state = useStore.getState()
  const exportData = {
    transactions: state.transactions,
    customRules: state.customRules,
    categoryMetadata: state.categoryMetadata,
  }
  return JSON.stringify(exportData, null, 2)
}

const importState = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString) as {
      transactions?: Transaction[]
      customRules?: Record<string, string[]>
      categoryMetadata?: CategoryMetadata
      selectionType?: PeriodSelectionType
      selectedYear?: number | null
      selectedMonth?: { year: number; month: number } | null
    }
    useStore.setState({
      transactions: data.transactions ?? [],
      customRules: data.customRules ?? {},
      categoryMetadata: data.categoryMetadata ?? INITIAL_CATEGORY_METADATA,
      selectionType: data.selectionType ?? 'month',
      selectedYear: data.selectedYear ?? null,
      selectedMonth: data.selectedMonth ?? null,
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
  useCategoriesSortedByTotalAmount,
  useCategoryMetadata,
  useSummaries,
  exportState,
  importState,
  getCategoryIdFromName,
  getCategoryNameFromId,
  getOrCreateCategoryId,
}
export { generateCategoryId } from '../parsing/categoryUtils.ts'
export type { View }
