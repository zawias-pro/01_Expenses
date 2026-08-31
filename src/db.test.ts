import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db.ts'

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
    await db.transactions.add({ amount: 25, description: 'lunch', categoryId: null, importedAt: 100 })
    const transactions = await db.transactions.toArray()
    expect(transactions).toHaveLength(1)
    expect(transactions[0]).toMatchObject({ amount: 25, description: 'lunch', categoryId: null, importedAt: 100 })
  })
})