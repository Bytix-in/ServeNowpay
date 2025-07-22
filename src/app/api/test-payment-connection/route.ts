import { NextRequest, NextResponse } from 'next/server'
import { getDecryptedCredentials } from '../payment-settings/route'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurant_id } = body

    if (!restaurant_id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Get decrypted credentials
    const credentials = await getDecryptedCredentials(restaurant_id)
    
    if (!credentials) {
      return NextResponse.json(
        { error: 'Payment settings not found or not enabled' },
        { status: 404 }
      )
    }

    // Test Cashfree API connection with correct endpoints
    const baseUrl = credentials.environment === 'production' 
      ? 'https://api.cashfree.com' 
      : 'https://sandbox.cashfree.com'

    console.log('Testing connection with:', {
      baseUrl,
      client_id: credentials.client_id,
      environment: credentials.environment
    })

    // Try the correct auth endpoint - Cashfree uses different auth flow
    // Let's test by creating a simple order instead of getting auth token
    const testOrderPayload = {
      order_id: `test_${Date.now()}`,
      order_amount: 1.00,
      order_currency: 'INR',
      customer_details: {
        customer_id: 'test_customer',
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '9999999999'
      }
    }

    const authResponse = await fetch(`${baseUrl}/pg/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': credentials.client_id,
        'x-client-secret': credentials.client_secret,
        'x-api-version': '2022-09-01'
      },
      body: JSON.stringify(testOrderPayload)
    })

    console.log('Auth response status:', authResponse.status)

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      console.error('Cashfree auth error:', errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }
      
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials or API error',
        details: errorData,
        status: authResponse.status
      })
    }

    const authData = await authResponse.json()

    return NextResponse.json({
      success: true,
      message: 'Connection successful',
      environment: credentials.environment
    })

  } catch (error) {
    console.error('Error testing payment connection:', error)
    return NextResponse.json({
      success: false,
      error: 'Connection test failed'
    })
  }
}