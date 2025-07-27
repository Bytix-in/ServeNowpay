import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const body = await request.json()
    
    // Cashfree webhook payload structure
    const {
      order_id,
      order_status,
      payment_status,
      cf_payment_id,
      order_amount,
      order_currency,
      payment_time,
      payment_completion_time,
      payment_method,
      payment_group
    } = body

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    // Find the order by gateway order ID
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('payment_gateway_order_id', order_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order based on payment status
    let updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (payment_status === 'SUCCESS') {
      updateData.payment_status = 'completed'
      updateData.status = 'confirmed'
    } else if (payment_status === 'FAILED') {
      updateData.payment_status = 'failed'
      updateData.payment_error = JSON.stringify(body)
    } else if (payment_status === 'PENDING') {
      updateData.payment_status = 'pending'
    }

    // Update the order
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', order.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    // Update or create transaction record
    const transactionData = {
      restaurant_id: order.restaurant_id,
      order_id: order.id,
      payment_gateway: 'cashfree',
      gateway_transaction_id: cf_payment_id,
      gateway_order_id: order_id,
      amount: parseFloat(order_amount),
      currency: order_currency || 'INR',
      status: payment_status.toLowerCase(),
      gateway_response: body,
      updated_at: new Date().toISOString()
    }

    // Try to update existing transaction, if not found, create new one
    const { data: existingTransaction } = await supabaseAdmin
      .from('transactions')
      .select('id')
      .eq('gateway_order_id', order_id)
      .single()

    if (existingTransaction) {
      await supabaseAdmin
        .from('transactions')
        .update(transactionData)
        .eq('id', existingTransaction.id)
    } else {
      await supabaseAdmin
        .from('transactions')
        .insert([transactionData])
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' })

  } catch (error) {
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}