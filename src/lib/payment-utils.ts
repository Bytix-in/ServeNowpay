import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

// Encryption key - in production, use environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here'
const ALGORITHM = 'aes-256-cbc'

export function encrypt(text: string): string {
  try {
    // Create a key from the encryption key
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    // Combine IV and encrypted text
    return iv.toString('hex') + ':' + encrypted
  } catch (error) {
    // Fallback to simple base64 encoding
    return Buffer.from(text).toString('base64')
  }
}

export function decrypt(encryptedText: string): string {
  try {
    // Check if it's the old format (base64) or new format (hex:encrypted)
    if (!encryptedText.includes(':')) {
      // Old format - base64 decode
      return Buffer.from(encryptedText, 'base64').toString('utf8')
    }
    
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const [ivHex, encrypted] = encryptedText.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    // Fallback to base64 decode
    try {
      return Buffer.from(encryptedText, 'base64').toString('utf8')
    } catch {
      return encryptedText // Return as-is if all else fails
    }
  }
}

// Helper function to get decrypted credentials
export async function getDecryptedCredentials(restaurant_id: string) {
  try {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('cashfree_client_id, cashfree_client_secret_encrypted, cashfree_environment, is_payment_enabled')
      .eq('restaurant_id', restaurant_id)
      .single()

    if (error || !data) {
      return null
    }

    if (!data.is_payment_enabled) {
      return null
    }

    return {
      client_id: data.cashfree_client_id,
      client_secret: decrypt(data.cashfree_client_secret_encrypted),
      environment: data.cashfree_environment
    }
  } catch (error) {
    return null
  }
}