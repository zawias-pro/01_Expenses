import { create } from 'zustand'
import type { View } from './core/view.ts'
import type { AmountFilter } from './transactions/TransactionsTable/AmountFilterForm.tsx'
import type { ImportedAtFilter } from './transactions/TransactionsTable/ImportedAtFilterForm.tsx'

const emptyAmountFilter: AmountFilter = { min: '', max: '' }
const emptyImportedAtFilter: ImportedAtFilter = { from: '', to: '' }

const toLocalInputValue = (ms: number) => {
  const date = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

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
  importedAtFilter: ImportedAtFilter
  setImportedAtFilter: (filter: ImportedAtFilter) => void
  importNameFilter: Set<string>
  setImportNameFilter: (filter: Set<string>) => void
  resetTableFilters: () => void
  focusImport: (importedAt: number) => void
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
  importedAtFilter: emptyImportedAtFilter,
  setImportedAtFilter: (importedAtFilter) => set({ importedAtFilter }),
  importNameFilter: new Set(),
  setImportNameFilter: (importNameFilter) => set({ importNameFilter }),
  resetTableFilters: () =>
    set({
      amountFilter: emptyAmountFilter,
      categoryFilter: new Set(),
      accountFilter: new Set(),
      descriptionFilter: '',
      importedAtFilter: emptyImportedAtFilter,
      importNameFilter: new Set(),
    }),
  focusImport: (importedAt) => {
    const value = toLocalInputValue(importedAt)
    set({
      view: 'table',
      amountFilter: emptyAmountFilter,
      categoryFilter: new Set(),
      accountFilter: new Set(),
      descriptionFilter: '',
      importNameFilter: new Set(),
      importedAtFilter: { from: value, to: value },
    })
  },
}))

export { useAppStore }