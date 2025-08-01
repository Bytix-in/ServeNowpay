import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateAndStoreInvoicePDF, validateOrderData } from '@/lib/generateInvoicePDF'

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerPhone } = await request.json()

    if (!orderId || !customerPhone) {
      return NextResponse.json(
        { error: 'Order ID and customer phone are required' },
        { status: 400 }
      )
    }

    // Fetch order details from database
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
          phone,
          gst_number
        )
      `)
      .eq('id', orderId)
      .eq('customer_phone', customerPhone)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Validate order data
    if (!validateOrderData(order)) {
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      )
    }

    // Check if invoice already exists
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id, pdf_data')
      .eq('order_id', orderId)
      .single()

    let base64PDF: string

    if (existingInvoice) {
      // Return existing invoice
      base64PDF = existingInvoice.pdf_data
    } else {
      // Generate new PDF as base64
      base64PDF = await generateAndStoreInvoicePDF(order)

      // Store the base64 PDF in the database
      const { error: insertError } = await supabase
        .from('invoices')
        .insert({
          order_id: orderId,
          customer_phone: customerPhone,
          pdf_data: base64PDF,
          invoice_number: order.unique_order_id || order.id.slice(-8),
          generated_at: new Date().toISOString(),
          restaurant_id: order.restaurants?.id || null
        })

      if (insertError) {
        console.error('Error storing invoice:', insertError)
        return NextResponse.json(
          { error: 'Failed to store invoice' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice generated and stored successfully',
      invoiceId: existingInvoice?.id || 'new',
      base64PDF: base64PDF.substring(0, 100) + '...' // Return truncated for security
    })

  } catch (error) {
    console.error('Error generating and storing PDF invoice:', error)
    return NextResponse.json(
      { error: 'Failed to generate and store invoice' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve stored invoice
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const customerPhone = searchParams.get('customerPhone')

    if (!orderId || !customerPhone) {
      return NextResponse.json(
        { error: 'Order ID and customer phone are required' },
        { status: 400 }
      )
    }

    // Fetch stored invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('pdf_data, invoice_number, generated_at')
      .eq('order_id', orderId)
      .eq('customer_phone', customerPhone)
      .single()

    if (error || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Convert base64 back to buffer and return as PDF
    const pdfBuffer = Buffer.from(invoice.pdf_data, 'base64')

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error retrieving stored invoice:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve invoice' },
      { status: 500 }
    )
  }
}