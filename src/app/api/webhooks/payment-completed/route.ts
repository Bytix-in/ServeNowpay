import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Webhook handler for payment completion
 * This endpoint should be called when a payment is marked as completed
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentStatus, webhookSource } = await request.json()

    // Validate webhook data
    if (!orderId || !paymentStatus) {
      return NextResponse.json(
        { error: 'Order ID and payment status are required' },
        { status: 400 }
      )
    }

    // Only process completed payments
    if (paymentStatus !== 'completed') {
      return NextResponse.json({
        success: true,
        message: 'Payment not completed, no action needed',
        orderId: orderId
      })
    }

    console.log(`Payment completed webhook received for order: ${orderId} from ${webhookSource || 'unknown'}`)

    // Update the order payment status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select('id, payment_status, invoice_generated')
      .single()

    if (updateError) {
      console.error('Error updating order payment status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      )
    }

    // Trigger invoice generation asynchronously
    try {
      const invoiceResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auto-generate-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          force: false
        })
      })

      const invoiceResult = await invoiceResponse.json()

      return NextResponse.json({
        success: true,
        message: 'Payment completed and invoice generation triggered',
        orderId: orderId,
        paymentUpdated: true,
        invoiceGeneration: invoiceResult
      })

    } catch (invoiceError) {
      console.error('Error triggering invoice generation:', invoiceError)
      
      // Return success for payment update even if invoice generation fails
      // Invoice can be generated later via batch process
      return NextResponse.json({
        success: true,
        message: 'Payment completed, invoice generation will be retried',
        orderId: orderId,
        paymentUpdated: true,
        invoiceGeneration: { error: 'Will retry later' }
      })
    }

  } catch (error) {
    console.error('Error in payment completion webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process payment completion' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check webhook status
 */
export async function GET() {
  return NextResponse.json({
    service: 'Payment Completion Webhook',
    status: 'active',
    timestamp: new Date().toISOString()
  })
}