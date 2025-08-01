import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateInvoicePDF, validateOrderData } from '@/lib/generateInvoicePDF'

/**
 * Auto-generate invoice when payment status changes to completed
 * This endpoint can be called by webhooks or background jobs
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId, force = false } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Fetch order details with restaurant information
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        unique_order_id,
        customer_name,
        customer_phone,
        total_amount,
        status,
        payment_status,
        created_at,
        table_number,
        items,
        invoice_generated,
        invoice_base64,
        restaurants (
          name,
          address,
          phone_number,
          email
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if payment is completed
    if (order.payment_status !== 'completed') {
      return NextResponse.json(
        { error: 'Payment not completed yet' },
        { status: 400 }
      )
    }

    // Check if invoice already generated (unless forced)
    if (order.invoice_generated && order.invoice_base64 && !force) {
      return NextResponse.json({
        success: true,
        message: 'Invoice already exists',
        orderId: orderId,
        invoiceExists: true
      })
    }

    // Validate order data
    if (!validateOrderData(order)) {
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      )
    }

    // Generate PDF as base64
    const base64PDF = await generateInvoicePDF(order, {
      returnBase64: true,
      format: 'A4'
    }) as string

    // Update the order with the generated invoice
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        invoice_base64: base64PDF,
        invoice_generated: true,
        invoice_generated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order with invoice:', updateError)
      return NextResponse.json(
        { error: 'Failed to save invoice to order' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice generated and saved successfully',
      orderId: orderId,
      invoiceGenerated: true,
      invoiceSize: base64PDF.length
    })

  } catch (error) {
    console.error('Error in auto-generate-invoice:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}

/**
 * Process all pending invoices
 * GET endpoint to generate invoices for all completed orders without invoices
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const maxLimit = Math.min(limit, 50) // Cap at 50 to prevent overload

    // Fetch orders that need invoice generation
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        unique_order_id,
        customer_name,
        customer_phone,
        total_amount,
        status,
        payment_status,
        created_at,
        table_number,
        items,
        restaurants (
          name,
          address,
          phone_number,
          email
        )
      `)
      .eq('payment_status', 'completed')
      .or('invoice_generated.is.null,invoice_generated.eq.false')
      .limit(maxLimit)

    if (ordersError) {
      throw ordersError
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orders need invoice generation',
        processed: 0
      })
    }

    const results = []
    let successCount = 0
    let errorCount = 0

    // Process each order
    for (const order of orders) {
      try {
        // Validate order data
        if (!validateOrderData(order)) {
          results.push({
            orderId: order.id,
            success: false,
            error: 'Invalid order data'
          })
          errorCount++
          continue
        }

        // Generate PDF as base64
        const base64PDF = await generateInvoicePDF(order, {
          returnBase64: true,
          format: 'A4'
        }) as string

        // Update the order with the generated invoice
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            invoice_base64: base64PDF,
            invoice_generated: true,
            invoice_generated_at: new Date().toISOString()
          })
          .eq('id', order.id)

        if (updateError) {
          throw updateError
        }

        results.push({
          orderId: order.id,
          success: true,
          invoiceSize: base64PDF.length
        })
        successCount++

      } catch (error) {
        console.error(`Error generating invoice for order ${order.id}:`, error)
        results.push({
          orderId: order.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${orders.length} orders`,
      processed: orders.length,
      successful: successCount,
      failed: errorCount,
      results: results
    })

  } catch (error) {
    console.error('Error in batch invoice generation:', error)
    return NextResponse.json(
      { error: 'Failed to process batch invoice generation' },
      { status: 500 }
    )
  }
}