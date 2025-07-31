/**
 * Utility functions for generating unique order IDs
 */

/**
 * Generate a unique 6-character order ID
 * Format: 2 letters + 4 numbers (e.g., AB1234)
 */
export function generateUniqueOrderId(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  // Generate 2 random letters
  let result = '';
  for (let i = 0; i < 2; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // Generate 4 random numbers
  for (let i = 0; i < 4; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return result;
}

/**
 * Generate a unique order ID with custom format
 */
export function generateCustomOrderId(prefix: string = '', length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  
  const remainingLength = length - prefix.length;
  for (let i = 0; i < remainingLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Validate order ID format
 */
export function isValidOrderId(orderId: string): boolean {
  // Check if it's 6 characters long and contains only letters and numbers
  const regex = /^[A-Z0-9]{6}$/;
  return regex.test(orderId);
}