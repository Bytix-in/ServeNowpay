import { NextRequest, NextResponse } from 'next/server'
import { handlePaymentStatusUpdate, paymentStatusHandler } from '@/lib/paymentStatusHandler'

/**
 * Update payment status and automatically generate invoice if completed
 * This endpoint can be used by payment gateways, webhooks, or manual updates
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      orderId, 
      paymentStatus, 
      webhookSource,
      generateInvoice = true 
    } = await request.json()

    // Validate required fields
    if (!orderId || !paymentStatus) {
      return NextResponse.json(
        { error: 'Order ID and payment status are required' },
        { status: 400 }
      )
    }

    // Validate payment status
    const validStatuses = ['pending', 'completed', 'failed', 'cancelled', 'refunded']
    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    console.log(`Payment status update request: ${orderId} -> ${paymentStatus}`)

    // Handle the payment status update
    const result = await handlePaymentStatusUpdate(orderId, paymentStatus, {
      generateInvoice,
      webhookSource
    })

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
      ...result
    })

  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update payment status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Batch update payment statuses
 */
export async function PUT(request: NextRequest) {
  try {
    const { 
      updates, 
      generateInvoices = true 
    } = await request.json()

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Validate each update
    for (const update of updates) {
      if (!update.orderId || !update.newStatus) {
        return NextResponse.json(
          { error: 'Each update must have orderId and newStatus' },
          { status: 400 }
        )
      }
    }

    console.log(`Batch payment status update: ${updates.length} orders`)

    // Process batch update
    const result = await paymentStatusHandler.batchUpdatePaymentStatus(
      updates, 
      { generateInvoices }
    )

    return NextResponse.json({
      success: true,
      message: `Batch update completed for ${updates.length} orders`,
      ...result
    })

  } catch (error) {
    console.error('Error in batch payment status update:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process batch update',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Get orders with completed payments but missing invoices
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const orders = await paymentStatusHandler.getCompletedOrdersWithoutInvoices(limit)

    return NextResponse.json({
      success: true,
      message: `Found ${orders.length} completed orders without invoices`,
      count: orders.length,
      orders
    })

  } catch (error) {
    console.error('Error getting orders without invoices:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get orders without invoices',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}