// Category utility functions
import type { CategoryMetadata } from './categoryTypes.ts'

// Generate a stable ID from a category name
export const generateCategoryId = (name: string): string => {
  // Use a simple hash-like function to generate stable IDs from names
  // This ensures the same name always gets the same ID
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `cat_${Math.abs(hash).toString(36)}`
}

// Helper functions for ID/name conversion
export const getCategoryIdFromName = (name: string, metadata: CategoryMetadata): string => {
  // First, try to find existing ID for this name
  for (const [id, categoryName] of Object.entries(metadata)) {
    if (categoryName === name) {
      return id
    }
  }
  // If not found, generate a new ID
  return generateCategoryId(name)
}

export const getCategoryNameFromId = (id: string, metadata: CategoryMetadata): string => {
  return metadata[id] || 'others'
}
