import Dexie, { type EntityTable } from 'dexie'
import type { Category } from './categories/Category.ts'
import type { Transaction } from './transactions/Transaction.ts'

class ExpensesDB extends Dexie {
  categories!: EntityTable<Category, 'id'>
  transactions!: EntityTable<Transaction, 'id'>

  constructor() {
    super('expenses')
    this.version(1).stores({
      categories: '++id',
      transactions: '++id',
    })
  }
}

const db = new ExpensesDB()

export { db }