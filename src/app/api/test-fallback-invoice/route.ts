import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateSimpleInvoiceHTML, generateInvoiceData } from '@/lib/generateInvoiceFallback'

/**
 * Test endpoint for fallback invoice generation
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Fetch order details
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

    // Generate fallback HTML invoice
    const invoiceHTML = generateSimpleInvoiceHTML(order)
    
    // Convert to base64 for storage
    const base64Invoice = Buffer.from(invoiceHTML, 'utf8').toString('base64')

    // Update the order with the fallback invoice
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        invoice_base64: base64Invoice,
        invoice_generated: true,
        invoice_generated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order with fallback invoice:', updateError)
      return NextResponse.json(
        { error: 'Failed to save fallback invoice' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Fallback invoice generated successfully',
      orderId: orderId,
      invoiceType: 'HTML',
      invoiceSize: base64Invoice.length
    })

  } catch (error) {
    console.error('Error in fallback invoice generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate fallback invoice' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to download the fallback invoice as HTML
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Fetch order details
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

    // Generate HTML invoice
    const invoiceHTML = generateSimpleInvoiceHTML(order)

    // Return as HTML response
    return new NextResponse(invoiceHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="invoice-${order.unique_order_id || order.id.slice(-8)}.html"`
      }
    })

  } catch (error) {
    console.error('Error generating fallback invoice HTML:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice HTML' },
      { status: 500 }
    )
  }
}