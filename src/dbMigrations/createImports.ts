import type { Transaction } from 'dexie'

type LegacyTx = {
  id: number
  importedAt: number
  accountId?: number | null
  importName?: string | null
  [key: string]: unknown
}

const createImports = async (tx: Transaction) => {
  const transactions = (await tx.table('transactions').toArray()) as LegacyTx[]
  const byKey = new Map<string, { name: string | null; importedAt: number; accountId: number | null }>()
  for (const transaction of transactions) {
    const key = `${transaction.importName ?? ''}\u0000${transaction.importedAt}`
    if (!byKey.has(key)) {
      byKey.set(key, {
        name: transaction.importName ?? null,
        importedAt: transaction.importedAt,
        accountId: transaction.accountId ?? null,
      })
    }
  }

  const idByKey = new Map<string, number>()
  for (const [key, group] of byKey) {
    const id = await tx.table('imports').add({
      name: group.name,
      importedAt: group.importedAt,
      accountId: group.accountId,
    })
    idByKey.set(key, id)
  }

  for (const transaction of transactions) {
    const key = `${transaction.importName ?? ''}\u0000${transaction.importedAt}`
    const importId = idByKey.get(key)
    if (importId === undefined) {
      throw new Error('Failed to assign import during migration')
    }
    const updated = transaction as LegacyTx & { importId: number }
    delete (updated as Record<string, unknown>).importedAt
    delete (updated as Record<string, unknown>).accountId
    delete (updated as Record<string, unknown>).importName
    updated.importId = importId
    await tx.table('transactions').put(updated)
  }
}

export { createImports }