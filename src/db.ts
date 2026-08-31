import Dexie, { type EntityTable } from 'dexie'
import type { Account } from './accounts/Account.ts'
import type { Category } from './categories/Category.ts'
import type { Transaction } from './transactions/Transaction.ts'
import { backfillAccountId } from './dbMigrations/backfillAccountId.ts'
import { backfillImportName } from './dbMigrations/backfillImportName.ts'

class ExpensesDB extends Dexie {
  accounts!: EntityTable<Account, 'id'>
  categories!: EntityTable<Category, 'id'>
  transactions!: EntityTable<Transaction, 'id'>

  constructor() {
    super('expenses')
    this.version(1).stores({
      categories: '++id',
      transactions: '++id',
    })
    this.version(2).stores({
      accounts: '++id',
      categories: '++id',
      transactions: '++id, accountId',
    })
    this.version(3)
      .stores({
        accounts: '++id',
        categories: '++id',
        transactions: '++id, accountId',
      })
      .upgrade(backfillAccountId)
    this.version(4)
      .stores({
        accounts: '++id',
        categories: '++id',
        transactions: '++id, accountId',
      })
      .upgrade(backfillImportName)
  }
}

const db = new ExpensesDB()

export { db }