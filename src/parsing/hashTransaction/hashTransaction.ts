/**
 * Generates a hash for a transaction based on date, description, and amount.
 * This is used to detect duplicate transactions.
 * 
 * @param date - Transaction date
 * @param description - Transaction description
 * @param amount - Transaction amount string
 * @returns A hash string (first 16 characters of SHA-256)
 */
const hashTransaction = (date: string, description: string, amount: string): string => {
  // Normalize inputs: trim and lowercase for consistent hashing
  const normalizedDate = (date || '').trim()
  const normalizedDescription = (description || '').trim().toLowerCase()
  const normalizedAmount = (amount || '').trim()
  
  // Combine into a single string
  const combined = `${normalizedDate}|${normalizedDescription}|${normalizedAmount}`
  
  // Simple hash function (djb2-like algorithm)
  // This is a fast, non-cryptographic hash suitable for duplicate detection
  let hash = 5381
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) + hash) + combined.charCodeAt(i)
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Convert to positive hex string and take first 16 characters
  const hashStr = Math.abs(hash).toString(16).padStart(8, '0')
  
  // Add a second pass for better distribution
  let hash2 = 0
  for (let i = 0; i < combined.length; i++) {
    hash2 = ((hash2 << 5) - hash2) + combined.charCodeAt(i)
    hash2 = hash2 & hash2
  }
  const hash2Str = Math.abs(hash2).toString(16).padStart(8, '0')
  
  return (hashStr + hash2Str).substring(0, 16)
}

export { hashTransaction }
