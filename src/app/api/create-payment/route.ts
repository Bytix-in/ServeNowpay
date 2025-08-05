import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { getDecryptedCredentials } from '@/lib/payment-utils'

// Create a Supabase client with service role key for admin operations
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

// Define interfaces for type safety

interface CashfreeOrder {
  order_id: string;
  payment_session_id: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      restaurant_id,
      customer_name,
      customer_phone,
      table_number,
      items,
      total_amount,
      payment_method = 'online' // Default to online for payment API
    } = body



    if (!restaurant_id || !customer_name || !customer_phone || !table_number || !items || !total_amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get restaurant's payment credentials
    let credentials
    try {
      credentials = await getDecryptedCredentials(restaurant_id)
    } catch (credError) {
      credentials = null
    }

    if (!credentials) {

      // Check if restaurant exists and is active
      const { data: restaurantCheck, error: restaurantError } = await supabaseAdmin
        .from('restaurants')
        .select('id, name, status')
        .eq('id', restaurant_id)
        .single()

      if (restaurantError || !restaurantCheck) {
        return NextResponse.json(
          { error: 'Restaurant not found' },
          { status: 404 }
        )
      }

      if (restaurantCheck.status !== 'active') {
        return NextResponse.json(
          { error: 'Restaurant is currently not accepting orders' },
          { status: 400 }
        )
      }

      // Create order without payment processing using enhanced validation
      try {
        const { createOrderWithValidation } = await import('@/lib/order-utils')
        
        const orderResult = await createOrderWithValidation({
          restaurant_id,
          customer_name,
          customer_phone,
          table_number,
          payment_method,
          items,
          total_amount,
          status: 'pending',
          payment_status: 'not_configured'
        })

        if (!orderResult.success) {
          throw new Error(orderResult.error || 'Failed to create order')
        }

        const order = orderResult.order

        return NextResponse.json({
          success: true,
          order_id: order.id,
          message: 'Order placed successfully! The restaurant will process payment manually.',
          redirect_url: `/payment/success?order_id=${order.id}&no_payment=true`,
          payment_configured: false
        })
      } catch (fallbackError: any) {
        return NextResponse.json(
          { error: `Failed to create order: ${fallbackError?.message || 'Unknown error'}` },
          { status: 500 }
        )
      }
    }

    // Create order using enhanced validation
    const { createOrderWithValidation } = await import('@/lib/order-utils')
    
    const orderResult = await createOrderWithValidation({
      restaurant_id,
      customer_name,
      customer_phone,
      table_number,
      payment_method,
      items,
      total_amount,
      status: 'pending',
      payment_status: 'pending'
    })

    if (!orderResult.success) {
      console.error('Order creation failed:', orderResult.error)
      throw new Error(orderResult.error || 'Failed to create order')
    }

    const order = orderResult.order


    // Create Cashfree order directly (no separate auth needed)
    const baseUrl = credentials.environment === 'production'
      ? 'https://api.cashfree.com'
      : 'https://sandbox.cashfree.com'

    // Create Cashfree order with more standardized format
    let appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // For production mode, ensure HTTPS is used (required by Cashfree production)
    if (credentials.environment === 'production') {
      // If we're using localhost in development but testing production mode
      if (appUrl.startsWith('http://localhost')) {
        // Use a dummy HTTPS URL for testing production mode locally
        appUrl = 'https://example.com';
      } else if (appUrl.startsWith('http://')) {
        // Convert any other HTTP URL to HTTPS
        appUrl = appUrl.replace('http://', 'https://');
      }
    }

    // Format order ID to ensure it meets Cashfree requirements
    // Cashfree requires alphanumeric order IDs with max 50 characters
    const timestamp = Date.now().toString().slice(-10); // Use last 10 digits of timestamp
    const shortOrderId = order.id.replace(/-/g, '').slice(0, 20); // Use first 20 chars of UUID without dashes
    const cashfreeOrderId = `ord_${timestamp}_${shortOrderId}`; // This will be under 50 chars

    const orderPayload = {
      order_id: cashfreeOrderId,
      order_amount: total_amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_name: customer_name,
        customer_email: `${customer_phone.replace(/[^0-9]/g, '')}@servenow.app`, // Clean phone number
        customer_phone: customer_phone.replace(/[^0-9]/g, '') // Ensure phone is numeric only
      },
      order_meta: {
        return_url: `${appUrl}/payment/success?order_id=${order.id}`,
        notify_url: `${appUrl}/api/payment-webhook`
      }
    }

    // Validate credentials before making the API call
    if (!credentials.client_id || !credentials.client_secret) {
      // Update order with error information
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'failed',
          payment_error: JSON.stringify({ message: 'Invalid payment credentials' }),
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      throw new Error('Invalid payment credentials: Missing client ID or secret');
    }

    // Trim any whitespace from credentials
    credentials.client_id = credentials.client_id.trim();
    credentials.client_secret = credentials.client_secret.trim();

    // Make the API call
    let createOrderResponse;
    let cashfreeOrder: CashfreeOrder;

    try {
      createOrderResponse = await fetch(`${baseUrl}/pg/orders`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-client-id': credentials.client_id,
          'x-client-secret': credentials.client_secret,
          'x-api-version': '2022-09-01' // Using a more stable API version
        },
        body: JSON.stringify(orderPayload)
      });

      // Parse the response once and store it
      let responseData;
      try {
        responseData = await createOrderResponse.json();
      } catch (e) {
        const textResponse = await createOrderResponse.text();
        throw new Error(`Failed to parse Cashfree response: ${textResponse}`);
      }

      if (!createOrderResponse.ok) {
        // Update order with error information
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'failed',
            payment_error: JSON.stringify(responseData),
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);

        throw new Error(`Failed to create Cashfree order: ${JSON.stringify(responseData)}`);
      }

      // Use the already parsed response
      cashfreeOrder = responseData;

    } catch (apiError: any) {
      // Update order with error information
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'failed',
          payment_error: JSON.stringify({ message: apiError?.message || 'API call failed' }),
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      throw apiError;
    }

    // Update order with Cashfree order ID
    await supabaseAdmin
      .from('orders')
      .update({
        payment_gateway_order_id: cashfreeOrder.order_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)

    // Create transaction record
    await supabaseAdmin
      .from('transactions')
      .insert([{
        restaurant_id,
        order_id: order.id,
        payment_gateway: 'cashfree',
        gateway_order_id: cashfreeOrder.order_id,
        amount: total_amount,
        currency: 'INR',
        status: 'pending',
        gateway_response: cashfreeOrder
      }])

    return NextResponse.json({
      success: true,
      order_id: order.id,
      payment_session_id: cashfreeOrder.payment_session_id,
      cashfree_order_id: cashfreeOrder.order_id,
      environment: credentials.environment
    })

  } catch (error: any) {
    // Provide more specific error messages based on the error type
    let userFriendlyMessage = 'Failed to create payment'
    let statusCode = 500
    
    if (error.message?.includes('credentials')) {
      userFriendlyMessage = 'Payment system not configured. Please contact the restaurant.'
      statusCode = 400
    } else if (error.message?.includes('Cashfree')) {
      userFriendlyMessage = 'Payment gateway error. Please try again or contact support.'
      statusCode = 502
    } else if (error.message?.includes('order')) {
      userFriendlyMessage = 'Failed to create order. Please check your details and try again.'
      statusCode = 400
    }
    
    return NextResponse.json(
      {
        error: userFriendlyMessage,
        details: error?.message || 'Unknown error'
      },
      { status: statusCode }
    )
  }
}