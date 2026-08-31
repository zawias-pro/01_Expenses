import { useAppStore } from '../appStore.ts'

const useView = () => useAppStore((state) => state.view)

export { useView }