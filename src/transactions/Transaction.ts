type Transaction = {
  id: number
  amount: number
  description: string
  categoryId: number | null
  importedAt: number
}

export type { Transaction }