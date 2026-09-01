import { beforeEach, describe, expect, it } from 'vitest'
import Dexie from 'dexie'
import { db } from './db.ts'
import { backfillAccountId } from './dbMigrations/backfillAccountId.ts'
import { backfillImportName } from './dbMigrations/backfillImportName.ts'
import { backfillDate } from './dbMigrations/backfillDate.ts'
import { backfillDateIso } from './dbMigrations/backfillDateIso.ts'
import { backfillDateOnly } from './dbMigrations/backfillDateOnly.ts'

describe('db', () => {
  beforeEach(async () => {
    await db.transactions.clear()
    await db.categories.clear()
  })

  it('stores categories', async () => {
    await db.categories.add({ name: 'food' })
    const categories = await db.categories.toArray()
    expect(categories).toHaveLength(1)
    expect(categories[0]).toMatchObject({ name: 'food' })
  })

  it('stores transactions', async () => {
    await db.transactions.add({ amount: 25, description: 'lunch', categoryId: null, date: new Date(50).toISOString(), importedAt: 100, accountId: null, importName: null })
    const transactions = await db.transactions.toArray()
    expect(transactions).toHaveLength(1)
    expect(transactions[0]).toMatchObject({ amount: 25, description: 'lunch', categoryId: null, date: new Date(50).toISOString(), importedAt: 100, accountId: null, importName: null })
  })

  it('backfills accountId null on legacy transactions during upgrade', async () => {
    const name = `migration-test-${Date.now()}`
    await indexedDB.deleteDatabase(name)

    const legacy = new Dexie(name)
    legacy.version(1).stores({ categories: '++id', transactions: '++id' })
    await legacy.table('transactions').add({ id: 1, amount: 25, description: 'lunch', categoryId: null, importedAt: 100 })
    legacy.close()

    const migrated = new Dexie(name)
    migrated.version(1).stores({ categories: '++id', transactions: '++id' })
    migrated.version(2).stores({ accounts: '++id', categories: '++id', transactions: '++id, accountId' })
    migrated.version(3)
      .stores({ accounts: '++id', categories: '++id', transactions: '++id, accountId' })
      .upgrade(backfillAccountId)

    const rows = await migrated.table('transactions').toArray()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual({ id: 1, amount: 25, description: 'lunch', categoryId: null, accountId: null, importedAt: 100 })

    migrated.close()
    await indexedDB.deleteDatabase(name)
  })

  it('backfills importName null on legacy transactions during upgrade', async () => {
    const name = `migration-importname-${Date.now()}`
    await indexedDB.deleteDatabase(name)

    const legacy = new Dexie(name)
    legacy.version(1).stores({ categories: '++id', transactions: '++id' })
    await legacy.table('transactions').add({ id: 1, amount: 25, description: 'lunch', categoryId: null, importedAt: 100 })
    legacy.close()

    const migrated = new Dexie(name)
    migrated.version(1).stores({ categories: '++id', transactions: '++id' })
    migrated.version(2).stores({ accounts: '++id', categories: '++id', transactions: '++id, accountId' })
    migrated.version(3)
      .stores({ accounts: '++id', categories: '++id', transactions: '++id, accountId' })
      .upgrade(backfillAccountId)
    migrated.version(4)
      .stores({ accounts: '++id', categories: '++id', transactions: '++id, accountId' })
      .upgrade(backfillImportName)

    const rows = await migrated.table('transactions').toArray()
    expect(rows).toHaveLength(1)
    expect(rows[0].importName).toBeNull()

    migrated.close()
    await indexedDB.deleteDatabase(name)
  })

  it('backfills date from importedAt and converts to ISO on legacy transactions during upgrade', async () => {
    const name = `migration-date-${Date.now()}`
    await indexedDB.deleteDatabase(name)

    const legacy = new Dexie(name)
    legacy.version(1).stores({ categories: '++id', transactions: '++id' })
    await legacy.table('transactions').add({ id: 1, amount: 25, description: 'lunch', categoryId: null, importedAt: 100 })
    legacy.close()

    const migrated = new Dexie(name)
    migrated.version(1).stores({ categories: '++id', transactions: '++id' })
    migrated.version(2).stores({ accounts: '++id', categories: '++id', transactions: '++id, accountId' })
    migrated.version(3)
      .stores({ accounts: '++id', categories: '++id', transactions: '++id, accountId' })
      .upgrade(backfillAccountId)
    migrated.version(4)
      .stores({ accounts: '++id', categories: '++id', transactions: '++id, accountId' })
      .upgrade(backfillImportName)
    migrated.version(5)
      .stores({ accounts: '++id', categories: '++id', transactions: '++id, accountId' })
      .upgrade(backfillDate)
    migrated.version(6)
      .stores({ accounts: '++id', categories: '++id', transactions: '++id, accountId' })
      .upgrade(backfillDateIso)
    migrated.version(7)
      .stores({ accounts: '++id', categories: '++id', transactions: '++id, accountId' })
      .upgrade(backfillDateOnly)

    const rows = await migrated.table('transactions').toArray()
    expect(rows).toHaveLength(1)
    expect(rows[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/)

    migrated.close()
    await indexedDB.deleteDatabase(name)
  })
})