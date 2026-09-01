import Dexie, { type EntityTable } from 'dexie'
import type { Account } from './accounts/Account.ts'
import type { Category } from './categories/Category.ts'
import type { ImportRecord } from './imports/Import.ts'
import type { Transaction } from './transactions/Transaction.ts'
import { backfillAccountId } from './dbMigrations/backfillAccountId.ts'
import { backfillImportName } from './dbMigrations/backfillImportName.ts'
import { backfillDate } from './dbMigrations/backfillDate.ts'
import { backfillDateIso } from './dbMigrations/backfillDateIso.ts'
import { backfillDateOnly } from './dbMigrations/backfillDateOnly.ts'
import { createImports } from './dbMigrations/createImports.ts'

class ExpensesDB extends Dexie {
  accounts!: EntityTable<Account, 'id'>
  categories!: EntityTable<Category, 'id'>
  imports!: EntityTable<ImportRecord, 'id'>
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
    this.version(5)
      .stores({
        accounts: '++id',
        categories: '++id',
        transactions: '++id, accountId',
      })
      .upgrade(backfillDate)
    this.version(6)
      .stores({
        accounts: '++id',
        categories: '++id',
        transactions: '++id, accountId',
      })
      .upgrade(backfillDateIso)
    this.version(7)
      .stores({
        accounts: '++id',
        categories: '++id',
        transactions: '++id, accountId',
      })
      .upgrade(backfillDateOnly)
    this.version(8)
      .stores({
        accounts: '++id',
        categories: '++id',
        imports: '++id, importedAt',
        transactions: '++id, importId',
      })
      .upgrade(createImports)
  }
}

const db = new ExpensesDB()

export { db }