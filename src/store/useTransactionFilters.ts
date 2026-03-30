import { create } from 'zustand'

type AmountFilterType = 'none' | 'less' | 'greater' | null

interface TransactionFiltersState {
  searchQuery: string
  selectedCategory: string | null
  selectedMonthFilter: string | null
  amountFilterType: AmountFilterType
  amountFilterValue: number | null
  hasDuplicates: boolean

  setSearchQuery: (q: string) => void
  setSelectedCategory: (c: string | null) => void
  setSelectedMonthFilter: (m: string | null) => void
  setAmountFilterType: (t: AmountFilterType) => void
  setAmountFilterValue: (v: number | null) => void
  setHasDuplicates: (v: boolean) => void
  resetFilters: () => void
}

const useTransactionFilters = create<TransactionFiltersState>((set) => ({
  searchQuery: '',
  selectedCategory: null,
  selectedMonthFilter: null,
  amountFilterType: null,
  amountFilterValue: null,
  hasDuplicates: false,

  setSearchQuery: (q) => { set({ searchQuery: q }) }, 
  setSelectedCategory: (c) => { set({ selectedCategory: c }) },
  setSelectedMonthFilter: (m) => { set({ selectedMonthFilter: m }) },
  setAmountFilterType: (t) => { set({ amountFilterType: t }) },
  setAmountFilterValue: (v) => { set({ amountFilterValue: v }) },
  setHasDuplicates: (v) => { set({ hasDuplicates: v }) },
  resetFilters: () => { set({ searchQuery: '', selectedCategory: null, selectedMonthFilter: null, amountFilterType: null, amountFilterValue: null }) },
}))

export { useTransactionFilters }
