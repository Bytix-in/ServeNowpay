import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getDecryptedCredentials } from '@/lib/payment-utils'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// POST - Configure webhook URL with Cashfree
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Get restaurant's payment credentials
    let credentials
    try {
      credentials = await getDecryptedCredentials(id)
    } catch (error) {
      return NextResponse.json(
        { error: 'Payment credentials not found. Please configure payment settings first.' },
        { status: 400 }
      )
    }

    if (!credentials) {
      return NextResponse.json(
        { error: 'Payment credentials not configured' },
        { status: 400 }
      )
    }

    // Configure webhook URL with Cashfree
    const baseUrl = credentials.environment === 'production'
      ? 'https://api.cashfree.com'
      : 'https://sandbox.cashfree.com'

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/cashfree`

    const webhookConfig = {
      webhook_url: webhookUrl,
      webhook_events: [
        'PAYMENT_SUCCESS_WEBHOOK',
        'PAYMENT_FAILED_WEBHOOK'
      ]
    }

    const response = await fetch(`${baseUrl}/pg/webhooks`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-client-id': credentials.client_id.trim(),
        'x-client-secret': credentials.client_secret.trim(),
        'x-api-version': '2022-09-01'
      },
      body: JSON.stringify(webhookConfig)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Cashfree webhook configuration error:', errorText)
      return NextResponse.json(
        { error: 'Failed to configure webhook with Cashfree', details: errorText },
        { status: response.status }
      )
    }

    const webhookData = await response.json()

    // Update restaurant with webhook configuration
    const { error: updateError } = await supabaseAdmin
      .from('restaurants')
      .update({
        webhook_configured: true,
        webhook_url: webhookUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating restaurant webhook config:', updateError)
      return NextResponse.json(
        { error: 'Failed to save webhook configuration' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook configured successfully',
      webhook_url: webhookUrl,
      webhook_data: webhookData
    })

  } catch (error) {
    console.error('Error configuring webhook:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to configure webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}