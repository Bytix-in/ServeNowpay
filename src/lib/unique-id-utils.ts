import { customAlphabet } from 'nanoid'

// Create a custom alphabet that excludes confusing characters
// Excludes: 0, O, I, 1, L to avoid confusion when reading/spelling
const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
const generateUniqueId = customAlphabet(alphabet, 6)

/**
 * Generates a unique 6-character order ID that's easy to pronounce and spell
 * Uses only uppercase letters and numbers, excluding confusing characters
 */
export function generateUniqueOrderId(): string {
  return generateUniqueId()
}

/**
 * Validates if a unique order ID has the correct format
 */
export function isValidUniqueOrderId(id: string): boolean {
  if (!id || id.length !== 6) return false
  
  // Check if all characters are in our allowed alphabet
  return id.split('').every(char => alphabet.includes(char))
}