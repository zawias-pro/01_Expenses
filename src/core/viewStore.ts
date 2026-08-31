import type { View } from './view.ts'

type ViewListener = () => void

type ViewStore = {
  get: () => View
  set: (view: View) => void
  subscribe: (listener: ViewListener) => () => void
}

let currentView: View = 'table'
const listeners = new Set<ViewListener>()

const viewStore: ViewStore = {
  get: () => currentView,
  set: (view) => {
    currentView = view
    listeners.forEach((listener) => listener())
  },
  subscribe: (listener) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

export { viewStore }