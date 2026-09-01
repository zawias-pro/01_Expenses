type Transaction = {
  id: number
  amount: number
  description: string
  categoryId: number | null
  date: string
  importId: number
}

export type { Transaction }