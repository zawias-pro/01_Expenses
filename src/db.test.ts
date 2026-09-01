import { beforeEach, describe, expect, it } from 'vitest'
import Dexie from 'dexie'
import { db } from './db.ts'
import { backfillAccountId } from './dbMigrations/backfillAccountId.ts'
import { backfillImportName } from './dbMigrations/backfillImportName.ts'
import { backfillDate } from './dbMigrations/backfillDate.ts'
import { backfillDateIso } from './dbMigrations/backfillDateIso.ts'
import { backfillDateOnly } from './dbMigrations/backfillDateOnly.ts'
import { createImports } from './dbMigrations/createImports.ts'
import { backfillMatcher } from './dbMigrations/backfillMatcher.ts'

describe('db', () => {
  beforeEach(async () => {
    await db.transactions.clear()
    await db.categories.clear()
    await db.imports.clear()
  })

  it('stores categories', async () => {
    await db.categories.add({ name: 'food', matcher: 'coffee' })
    const categories = await db.categories.toArray()
    expect(categories).toHaveLength(1)
    expect(categories[0]).toMatchObject({ name: 'food' })
  })

  it('stores imports and transactions', async () => {
    const importId = await db.imports.add({ importedAt: 100, name: 'January', accountId: null })
    await db.transactions.add({ amount: 25, description: 'lunch', categoryId: null, date: '2026-01-01', importId })
    const transactions = await db.transactions.toArray()
    expect(transactions).toHaveLength(1)
    expect(transactions[0]).toMatchObject({ amount: 25, description: 'lunch', categoryId: null, date: '2026-01-01', importId })
    const importRecord = await db.imports.get(importId)
    expect(importRecord).toMatchObject({ importedAt: 100, name: 'January', accountId: null })
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
    migrated.version(8)
      .stores({
        accounts: '++id',
        categories: '++id',
        imports: '++id, importedAt',
        transactions: '++id, importId',
      })
      .upgrade(createImports)

    const rows = await migrated.table('transactions').toArray()
    expect(rows).toHaveLength(1)
    expect(rows[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(rows[0].importId).toBeGreaterThan(0)
    expect(rows[0].importedAt).toBeUndefined()
    expect(rows[0].importName).toBeUndefined()
    expect(rows[0].accountId).toBeUndefined()

    const importRows = await migrated.table('imports').toArray()
    expect(importRows).toHaveLength(1)
    expect(importRows[0]).toMatchObject({ importedAt: 100, name: null, accountId: null })

    migrated.close()
    await indexedDB.deleteDatabase(name)
  })

  it('backfills matcher empty string on legacy categories during upgrade', async () => {
    const name = `migration-matcher-${Date.now()}`
    await indexedDB.deleteDatabase(name)

    const legacy = new Dexie(name)
    legacy.version(1).stores({ categories: '++id', transactions: '++id' })
    await legacy.table('categories').add({ id: 1, name: 'Food' })
    legacy.close()

    const migrated = new Dexie(name)
    migrated.version(1).stores({ categories: '++id', transactions: '++id' })
    migrated.version(9)
      .stores({
        accounts: '++id',
        categories: '++id',
        imports: '++id, importedAt',
        transactions: '++id, importId',
      })
      .upgrade(backfillMatcher)

    const rows = await migrated.table('categories').toArray()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual({ id: 1, name: 'Food', matcher: '' })

    migrated.close()
    await indexedDB.deleteDatabase(name)
  })

  it('repairs broken customCategory references (regression)', async () => {
    const { repairBrokenCategories } = await import('./dbMigrations/repairBrokenCategories.ts')
    const name = `migration-repair-${Date.now()}`
    await indexedDB.deleteDatabase(name)

    const db1 = new Dexie(name)
    db1.version(1).stores({ categories: '++id', transactions: '++id' })
    await db1.table('categories').add({ id: 1, name: 'Food', matcher: '' })
    await db1.table('transactions').add({ id: 10, amount: 10, description: 'lunch', categoryId: null, date: '2026-01-01', importId: 1, customCategoryId: 1, customDate: null, comment: null })
    await db1.table('transactions').add({ id: 11, amount: 20, description: 'other', categoryId: 1, date: '2026-01-02', importId: 1, customCategoryId: null, customDate: null, comment: null })
    // delete category 1 to make both transactions broken (one via custom, one via original)
    await db1.table('categories').delete(1)
    db1.close()

    const db2 = new Dexie(name)
    db2.version(1).stores({ categories: '++id', transactions: '++id' })
    db2.version(2).stores({ categories: '++id', transactions: '++id' }).upgrade(repairBrokenCategories)
    await db2.open()
    const txs = await db2.table('transactions').toArray()
    // both should be repaired to null (no category)
    expect(txs.find((t) => t.id === 10)?.customCategoryId).toBeNull()
    expect(txs.find((t) => t.id === 11)?.categoryId).toBeNull()
    db2.close()
    await indexedDB.deleteDatabase(name)
  })
})