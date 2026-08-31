type Transaction = {
  id: number
  amount: number
  description: string
  categoryId: number | null
  accountId: number | null
  importedAt: number
}

export type { Transaction }