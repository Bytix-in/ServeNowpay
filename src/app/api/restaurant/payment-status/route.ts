import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const restaurant_id = request.nextUrl.searchParams.get('restaurant_id')

    if (!restaurant_id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Check if restaurant has payment settings configured
    const { data: paymentSettings, error } = await supabase
      .from('payment_settings')
      .select('id, cashfree_client_id, is_payment_enabled, cashfree_environment')
      .eq('restaurant_id', restaurant_id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    const hasCredentials = paymentSettings && paymentSettings.cashfree_client_id
    const isEnabled = paymentSettings?.is_payment_enabled || false

    return NextResponse.json({
      success: true,
      data: {
        hasCredentials,
        isEnabled,
        environment: paymentSettings?.cashfree_environment || 'sandbox',
        requiresSetup: !hasCredentials
      }
    })

  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}