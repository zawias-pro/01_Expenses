// Category utility functions
import type { CategoryMetadata } from './categoryTypes.ts'

// Generate a unique category ID (independent of name)
// Uses timestamp + random to ensure uniqueness
let idCounter = 0
const generateCategoryId = (): string => {
  idCounter++
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `cat_${timestamp}_${random}_${idCounter}`
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
  if (id === null || id === '') return '(no category)'
  return metadata[id] ?? '(no category)'
}

export { generateCategoryId, getCategoryIdFromName, getCategoryNameFromId, getOrCreateCategoryId }
