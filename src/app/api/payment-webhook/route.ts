import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Payment webhook received:', body)

    const { 
      order_id, 
      payment_status, 
      payment_amount, 
      payment_currency,
      payment_time,
      payment_id,
      payment_method
    } = body

    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Update order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        payment_status: payment_status,
        payment_id: payment_id,
        status: payment_status === 'SUCCESS' ? 'confirmed' : 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)

    if (orderError) {
      console.error('Error updating order:', orderError)
    }

    // Update transaction status
    const { error: transactionError } = await supabase
      .from('transactions')
      .update({
        status: payment_status === 'SUCCESS' ? 'completed' : 'failed',
        gateway_transaction_id: payment_id,
        gateway_response: body,
        updated_at: new Date().toISOString()
      })
      .eq('gateway_order_id', order_id)

    if (transactionError) {
      console.error('Error updating transaction:', transactionError)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error processing payment webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}