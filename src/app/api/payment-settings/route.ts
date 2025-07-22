import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

// Encryption key - in production, use environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here'
const ALGORITHM = 'aes-256-cbc'

function encrypt(text: string): string {
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
    console.error('Encryption error:', error)
    // Fallback to simple base64 encoding for development
    return Buffer.from(text).toString('base64')
  }
}

function decrypt(encryptedText: string): string {
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
    console.error('Decryption error:', error)
    // Fallback to base64 decode
    try {
      return Buffer.from(encryptedText, 'base64').toString('utf8')
    } catch {
      return encryptedText // Return as-is if all else fails
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurant_id, cashfree_client_id, cashfree_client_secret, cashfree_environment } = body

    if (!restaurant_id || !cashfree_client_id || !cashfree_client_secret) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Encrypt the client secret
    const encryptedSecret = encrypt(cashfree_client_secret)

    // Check if payment settings already exist
    const { data: existingSettings, error: checkError } = await supabase
      .from('payment_settings')
      .select('id')
      .eq('restaurant_id', restaurant_id)
      .single()

    let result

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('payment_settings')
        .update({
          cashfree_client_id,
          cashfree_client_secret_encrypted: encryptedSecret,
          cashfree_environment,
          updated_at: new Date().toISOString()
        })
        .eq('restaurant_id', restaurant_id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('payment_settings')
        .insert([{
          restaurant_id,
          cashfree_client_id,
          cashfree_client_secret_encrypted: encryptedSecret,
          cashfree_environment,
          is_payment_enabled: false
        }])
        .select()
        .single()

      if (error) throw error
      result = data
    }

    // Return settings without the encrypted secret
    const { cashfree_client_secret_encrypted, ...safeResult } = result
    
    return NextResponse.json({
      success: true,
      data: safeResult
    })

  } catch (error) {
    console.error('Error saving payment settings:', error)
    return NextResponse.json(
      { error: 'Failed to save payment settings' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurant_id = searchParams.get('restaurant_id')

    if (!restaurant_id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('payment_settings')
      .select('id, restaurant_id, cashfree_client_id, cashfree_environment, is_payment_enabled, created_at, updated_at')
      .eq('restaurant_id', restaurant_id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data || null
    })

  } catch (error) {
    console.error('Error fetching payment settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment settings' },
      { status: 500 }
    )
  }
}

// Helper function to get decrypted credentials (for internal use)
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
    console.error('Error getting decrypted credentials:', error)
    return null
  }
}