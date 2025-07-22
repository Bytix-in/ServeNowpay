import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { encrypt } from '@/lib/payment-utils'

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

// The getDecryptedCredentials function has been moved to /src/lib/payment-utils.ts