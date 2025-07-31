import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

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

// Verify Cashfree webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-webhook-signature')
    
    // For development/testing, allow requests without signature
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!signature && !isDevelopment) {
      console.log('No webhook signature provided')
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
    }

    // Parse the webhook payload
    const webhookData = JSON.parse(body)
    
    // Log webhook for monitoring (production-safe)
    console.log(`[WEBHOOK] ${new Date().toISOString()} - Type: ${webhookData.type}`)

    const { type, data } = webhookData

    // Handle payment success webhook
    if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const { order } = data
      const orderId = order?.order_id
      
      if (!orderId) {
        console.error('No order ID in webhook data')
        return NextResponse.json({ error: 'No order ID provided' }, { status: 400 })
      }

      // Find the order in our database using the Cashfree order ID
      const { data: dbOrder, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('payment_gateway_order_id', orderId)
        .single()

      if (orderError || !dbOrder) {
        console.log(`Order not found for Cashfree order ID: ${orderId}`)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // Update payment status to completed, but keep order status as pending for restaurant workflow
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'completed',
          status: 'pending', // Order is placed, waiting for restaurant to accept
          updated_at: new Date().toISOString()
        })
        .eq('id', dbOrder.id)

      if (updateError) {
        console.error('Error updating order:', updateError)
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Payment confirmed' })
    }

    // Handle payment failure webhook
    if (type === 'PAYMENT_FAILED_WEBHOOK') {
      const { order } = data
      const orderId = order?.order_id
      
      if (!orderId) {
        return NextResponse.json({ error: 'No order ID provided' }, { status: 400 })
      }

      // Find the order in our database
      const { data: dbOrder, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('payment_gateway_order_id', orderId)
        .single()

      if (orderError || !dbOrder) {
        console.log(`Order not found for Cashfree order ID: ${orderId}`)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // Update order status to failed (this will trigger Supabase Realtime)
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', dbOrder.id)

      if (updateError) {
        console.error('Error updating order:', updateError)
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
      }

      console.log(`Order ${dbOrder.id} marked as failed via webhook`)
      return NextResponse.json({ success: true, message: 'Payment failure recorded' })
    }

    // Handle other webhook types
    console.log(`Unhandled webhook type: ${type}`)
    return NextResponse.json({ success: true, message: 'Webhook received' })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}