type Transaction = {
  id: number
  amount: number
  description: string
  categoryId: number | null
  date: string
  importId: number
  customDate?: string | null
  customCategoryId?: number | null
  comment?: string | null
}

export type { Transaction }