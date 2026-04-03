// Category utility functions
import type { CategoryMetadata } from './categoryTypes.ts'
import { NO_CATEGORY_ID, NO_CATEGORY_KEY } from './types.ts'

// Generate a unique category ID (independent of name)
// Uses timestamp + random to ensure uniqueness
let idCounter = 0
const generateCategoryId = (): string => {
  idCounter++
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `cat_${String(timestamp)}_${random}_${String(idCounter)}`
}

// Helper functions for ID/name conversion
// Only looks up existing IDs - never generates new ones
const getCategoryIdFromName = (name: string, metadata: CategoryMetadata): string | null => {
  // Find existing ID for this name
  for (const [id, categoryName] of Object.entries(metadata)) {
    if (categoryName === name) {
      return id
    }
  }
  // Not found - return null (caller should handle creation)
  return null
}

// Get or create category ID - use this when you need to ensure a category exists
const getOrCreateCategoryId = (name: string, metadata: CategoryMetadata): string => {
  const existingId = getCategoryIdFromName(name, metadata)
  if (existingId) {
    return existingId
  }
  // Generate new unique ID
  return generateCategoryId()
}

const getCategoryNameFromId = (id: string | null, metadata: CategoryMetadata): string => {
  if (id === null || id === '') return NO_CATEGORY_KEY
  return metadata[id] ?? NO_CATEGORY_KEY
}

const getCategorySummaryKey = (id: string | null): string => id ?? NO_CATEGORY_ID

const getCategoryIdFromSummaryKey = (summaryKey: string): string | null => {
  return summaryKey === NO_CATEGORY_ID ? null : summaryKey
}

const getCategoryNameFromSummaryKey = (summaryKey: string, metadata: CategoryMetadata): string => {
  return getCategoryNameFromId(getCategoryIdFromSummaryKey(summaryKey), metadata)
}

const getCategoryColor = (categoryName: string) => {
  if(categoryName==='(no category)'){
    return 'rgb(0,0,0,0.1)'
  }
  let h = 0
  for (let i = 0; i < categoryName.length; i++) {
    h = Math.imul(31, h) + categoryName.charCodeAt(i) | 0
  }
  const r = (h & 0xFF0000) >> 16
  const g = (h & 0x00FF00) >> 8
  const b = (h & 0x0000FF)

  return `rgb(${String((r + 256) % 256)}, ${String((g + 256) % 256)}, ${String((b + 256) % 256)})`
}

export {
  generateCategoryId,
  getCategoryIdFromName,
  getCategoryIdFromSummaryKey,
  getCategoryNameFromId,
  getCategoryNameFromSummaryKey,
  getCategorySummaryKey,
  getOrCreateCategoryId,
  getCategoryColor
}
