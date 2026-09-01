import type { Transaction } from 'dexie'

const repairBrokenCategories = async (tx: Transaction) => {
  const categories = await tx.table('categories').toArray()
  const catIds = new Set((categories as { id: number }[]).map((c) => c.id))
  await tx.table('transactions').toCollection().modify((t: { categoryId: number | null; customCategoryId?: number | null }) => {
    const custom = t.customCategoryId ?? null
    const effective = custom !== null ? custom : t.categoryId
    if (effective !== null && !catIds.has(effective)) {
      // effective is broken - clear the source that provided it
      if (custom !== null) {
        t.customCategoryId = null
      } else {
        t.categoryId = null
      }
    }
  })
}

export { repairBrokenCategories }
