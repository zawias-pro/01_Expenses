import { create } from 'zustand'
import type { View } from './core/view.ts'
import type { AmountFilter } from './transactions/TransactionsTable/AmountFilterForm.tsx'
import type { DateFilter } from './transactions/TransactionsTable/DateFilterForm.tsx'

const emptyAmountFilter: AmountFilter = { min: '', max: '' }
const emptyDateFilter: DateFilter = { from: '', to: '' }

type AppState = {
  view: View
  setView: (view: View) => void
  amountFilter: AmountFilter
  setAmountFilter: (filter: AmountFilter) => void
  categoryFilter: Set<string>
  setCategoryFilter: (filter: Set<string>) => void
  accountFilter: Set<string>
  setAccountFilter: (filter: Set<string>) => void
  descriptionFilter: string
  setDescriptionFilter: (filter: string) => void
  dateFilter: DateFilter
  setDateFilter: (filter: DateFilter) => void
  importFilter: Set<string>
  setImportFilter: (filter: Set<string>) => void
  changedFilter: Set<string>
  setChangedFilter: (filter: Set<string>) => void
  resetTableFilters: () => void
  focusImport: (importId: number) => void
}

const useAppStore = create<AppState>((set) => ({
  view: 'table',
  setView: (view) => set({ view }),
  amountFilter: emptyAmountFilter,
  setAmountFilter: (amountFilter) => set({ amountFilter }),
  categoryFilter: new Set(),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  accountFilter: new Set(),
  setAccountFilter: (accountFilter) => set({ accountFilter }),
  descriptionFilter: '',
  setDescriptionFilter: (descriptionFilter) => set({ descriptionFilter }),
  dateFilter: emptyDateFilter,
  setDateFilter: (dateFilter) => set({ dateFilter }),
  importFilter: new Set(),
  setImportFilter: (importFilter) => set({ importFilter }),
  changedFilter: new Set(),
  setChangedFilter: (changedFilter) => set({ changedFilter }),
  resetTableFilters: () =>
    set({
      amountFilter: emptyAmountFilter,
      categoryFilter: new Set(),
      accountFilter: new Set(),
      descriptionFilter: '',
      dateFilter: emptyDateFilter,
      importFilter: new Set(),
      changedFilter: new Set(),
    }),
  focusImport: (importId) => {
    set({
      view: 'table',
      amountFilter: emptyAmountFilter,
      categoryFilter: new Set(),
      accountFilter: new Set(),
      descriptionFilter: '',
      dateFilter: emptyDateFilter,
      importFilter: new Set([String(importId)]),
      changedFilter: new Set(),
    })
  },
}))

export { useAppStore }