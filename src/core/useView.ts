import { useSyncExternalStore } from 'react'
import { viewStore } from './viewStore.ts'

const useView = () => useSyncExternalStore(viewStore.subscribe, viewStore.get)

export { useView }