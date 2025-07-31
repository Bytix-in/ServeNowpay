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

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // If already completed or failed, return current status
    if (order.payment_status === 'completed' || order.payment_status === 'failed') {
      return NextResponse.json({
        success: true,
        payment_status: order.payment_status,
        order: order
      })
    }

    // If no gateway order ID, can't verify with Cashfree
    if (!order.payment_gateway_order_id) {
      return NextResponse.json({
        success: true,
        payment_status: 'pending',
        order: order,
        message: 'No payment gateway order ID found'
      })
    }

    // Get restaurant's payment credentials
    let credentials
    try {
      credentials = await getDecryptedCredentials(order.restaurant_id)
    } catch (error) {
      return NextResponse.json({
        success: true,
        payment_status: order.payment_status,
        order: order,
        message: 'Cannot verify payment - credentials not available'
      })
    }

    if (!credentials) {
      return NextResponse.json({
        success: true,
        payment_status: order.payment_status,
        order: order,
        message: 'Cannot verify payment - no credentials configured'
      })
    }

    // Check payment status with Cashfree
    const baseUrl = credentials.environment === 'production'
      ? 'https://api.cashfree.com'
      : 'https://sandbox.cashfree.com'

    try {
      const response = await fetch(`${baseUrl}/pg/orders/${order.payment_gateway_order_id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'x-client-id': credentials.client_id.trim(),
          'x-client-secret': credentials.client_secret.trim(),
          'x-api-version': '2022-09-01'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Cashfree API error: ${response.status} - ${errorText}`)
        
        // Return error for proper handling
        return NextResponse.json({
          success: false,
          error: `Cashfree API error: ${response.status}`,
          details: errorText,
          payment_status: order.payment_status,
          order: order
        }, { status: response.status })
      }

      const paymentData = await response.json()
      
      // Update order based on Cashfree response
      let newPaymentStatus = order.payment_status
      let newOrderStatus = order.status

      if (paymentData.order_status === 'PAID') {
        newPaymentStatus = 'completed'
        newOrderStatus = 'pending' // Order is placed, waiting for restaurant to accept
      } else if (paymentData.order_status === 'EXPIRED' || paymentData.order_status === 'CANCELLED') {
        newPaymentStatus = 'failed'
        newOrderStatus = 'cancelled'
      } else if (paymentData.order_status === 'ACTIVE') {
        newPaymentStatus = 'pending'
      }

      // Update order in database if status changed (this will trigger Supabase Realtime)
      if (newPaymentStatus !== order.payment_status || newOrderStatus !== order.status) {
        
        const { data: updatedOrder, error: updateError } = await supabaseAdmin
          .from('orders')
          .update({
            payment_status: newPaymentStatus,
            status: newOrderStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
          .select()
          .single()

        if (updateError) {
          console.error('Database update error:', updateError)
          return NextResponse.json({
            success: false,
            error: 'Failed to update order in database',
            payment_status: order.payment_status,
            order: order
          }, { status: 500 })
        }

        if (updatedOrder) {
          return NextResponse.json({
            success: true,
            payment_status: newPaymentStatus,
            order: updatedOrder,
            cashfree_status: paymentData.order_status
          })
        }
      }

      return NextResponse.json({
        success: true,
        payment_status: newPaymentStatus,
        order: order,
        cashfree_status: paymentData.order_status
      })

    } catch (apiError) {
      console.error('Cashfree API error:', apiError)
      
      return NextResponse.json({
        success: false,
        error: 'Payment verification failed',
        details: apiError instanceof Error ? apiError.message : 'Unknown error',
        payment_status: order.payment_status,
        order: order
      }, { status: 500 })
    }

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Payment verification failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}