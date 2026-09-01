type Transaction = {
  id: number
  amount: number
  description: string
  categoryId: number | null
  accountId: number | null
  date: string
  importedAt: number
  importName: string | null
}

export type { Transaction }