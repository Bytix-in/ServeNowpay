import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { decrypt } from '@/lib/payment-utils'

export async function POST(request: NextRequest) {
  try {
    const { restaurant_id } = await request.json()

    if (!restaurant_id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Get payment settings for the restaurant
    const { data: paymentSettings, error } = await supabase
      .from('payment_settings')
      .select('cashfree_client_id, cashfree_client_secret_encrypted, cashfree_environment')
      .eq('restaurant_id', restaurant_id)
      .single()

    // Debug: Let's also check all payment settings for this restaurant
    const { data: allSettings } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('restaurant_id', restaurant_id)

    if (error || !paymentSettings) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment settings not found. Please configure your Cashfree credentials first.',
          debug: {
            restaurant_id,
            error: error?.message,
            allSettingsCount: allSettings?.length || 0,
            hasSettings: !!allSettings && allSettings.length > 0
          }
        },
        { status: 404 }
      )
    }

    if (!paymentSettings.cashfree_client_id || !paymentSettings.cashfree_client_secret_encrypted) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Incomplete payment settings. Please provide both Client ID and Client Secret.' 
        },
        { status: 400 }
      )
    }

    // Decrypt the client secret
    let clientSecret: string
    try {
      clientSecret = decrypt(paymentSettings.cashfree_client_secret_encrypted)
    } catch (decryptError) {
      console.error('Error decrypting client secret:', decryptError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to decrypt credentials. Please re-enter your Client Secret.' 
        },
        { status: 500 }
      )
    }

    // Test Cashfree API connection
    const cashfreeBaseUrl = paymentSettings.cashfree_environment === 'production' 
      ? 'https://api.cashfree.com' 
      : 'https://sandbox.cashfree.com'

    try {
      // For sandbox, use a simpler approach - just test authentication with a basic API call
      if (paymentSettings.cashfree_environment === 'sandbox') {
        // Test with a simple authentication check using the orders endpoint with GET
        const testResponse = await fetch(`${cashfreeBaseUrl}/pg/orders?limit=1`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'x-client-id': paymentSettings.cashfree_client_id,
            'x-client-secret': clientSecret,
            'x-api-version': '2023-08-01'
          }
        })

        if (testResponse.status === 401) {
          return NextResponse.json({
            success: false,
            error: 'Invalid Cashfree sandbox credentials. Please check your Client ID and Client Secret.'
          })
        }

        if (testResponse.status === 403) {
          return NextResponse.json({
            success: false,
            error: 'Access denied. Please ensure your Cashfree sandbox account is properly configured.'
          })
        }

        // For sandbox, 200 or 404 (no orders) both indicate valid credentials
        if (testResponse.ok || testResponse.status === 404) {
          return NextResponse.json({
            success: true,
            message: 'Sandbox connection successful! Your Cashfree sandbox credentials are working.',
            environment: paymentSettings.cashfree_environment
          })
        }
      }

      // For production, try to create a minimal test order
      const testOrderData = {
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

      const testResponse = await fetch(`${cashfreeBaseUrl}/pg/orders`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-client-id': paymentSettings.cashfree_client_id,
          'x-client-secret': clientSecret,
          'x-api-version': '2023-08-01'
        },
        body: JSON.stringify(testOrderData)
      })

      if (testResponse.status === 401) {
        return NextResponse.json({
          success: false,
          error: 'Invalid Cashfree credentials. Please check your Client ID and Client Secret.'
        })
      }

      if (testResponse.status === 403) {
        return NextResponse.json({
          success: false,
          error: 'Access denied. Please ensure your Cashfree account is properly configured and activated.'
        })
      }

      // For sandbox environment, 404 might be normal if no orders exist
      if (testResponse.status === 404 && paymentSettings.cashfree_environment === 'sandbox') {
        return NextResponse.json({
          success: true,
          message: 'Connection successful! Your Cashfree sandbox credentials are working. (404 is normal for empty sandbox)',
          environment: paymentSettings.cashfree_environment
        })
      }

      // If we get here, the credentials are valid (even if the specific API call fails for other reasons)
      if (testResponse.ok || testResponse.status === 422 || testResponse.status === 400) {
        // 422/400 might be returned for missing parameters, but credentials are valid
        return NextResponse.json({
          success: true,
          message: 'Connection successful! Your Cashfree credentials are valid.',
          environment: paymentSettings.cashfree_environment
        })
      }

      // Handle other errors with more specific messages
      let errorMessage = `Connection failed with status ${testResponse.status}.`
      
      if (testResponse.status === 404) {
        errorMessage = 'Cashfree API endpoint not found. This might be due to incorrect environment settings or API version.'
      } else if (testResponse.status >= 500) {
        errorMessage = 'Cashfree server error. Please try again later.'
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage
      })

    } catch (networkError) {
      console.error('Network error testing Cashfree connection:', networkError)
      return NextResponse.json({
        success: false,
        error: 'Network error. Please check your internet connection and try again.'
      })
    }

  } catch (error) {
    console.error('Error testing payment connection:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again later.' 
      },
      { status: 500 }
    )
  }
}