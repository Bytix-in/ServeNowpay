import { NextRequest, NextResponse } from 'next/server'
import { getDecryptedCredentials } from '@/lib/payment-utils'

export async function POST(request: NextRequest) {
  try {
    const { restaurant_id } = await request.json()

    if (!restaurant_id) {
      return NextResponse.json(
        { success: false, error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Get decrypted payment credentials
    const credentials = await getDecryptedCredentials(restaurant_id)

    if (!credentials) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment settings not found or not enabled. Please configure your Cashfree credentials first.',
          debug: { restaurant_id }
        },
        { status: 404 }
      )
    }

    if (!credentials.client_id || !credentials.client_secret) {
      return NextResponse.json(
        { success: false, error: 'Cashfree credentials not configured' },
        { status: 400 }
      )
    }

    // Test Cashfree connection by making a simple API call
    const cashfreeBaseUrl = credentials.environment === 'production' 
      ? 'https://api.cashfree.com' 
      : 'https://sandbox.cashfree.com'

    // Test with a simple order creation to validate credentials
    const testOrderId = `test_${Date.now()}`
    
    const authResponse = await fetch(`${cashfreeBaseUrl}/pg/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': credentials.client_id,
        'x-client-secret': credentials.client_secret,
        'x-api-version': '2023-08-01'
      },
      body: JSON.stringify({
        order_id: testOrderId,
        order_amount: 1.00,
        order_currency: 'INR',
        customer_details: {
          customer_id: 'test_customer',
          customer_name: 'Test Customer',
          customer_email: 'test@example.com',
          customer_phone: '9999999999'
        }
      })
    })

    const responseData = await authResponse.json()

    if (authResponse.ok || authResponse.status === 409) {
      // 409 means order already exists, which is also a successful connection test
      return NextResponse.json({
        success: true,
        message: 'Cashfree connection successful',
        environment: credentials.environment
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to connect to Cashfree',
          details: responseData
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error testing payment connection:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}