import { create } from 'zustand'
import type { View } from './core/view.ts'

type AppState = {
  view: View
  setView: (view: View) => void
}

const useAppStore = create<AppState>((set) => ({
  view: 'table',
  setView: (view) => set({ view }),
}))

export { useAppStore }