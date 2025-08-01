import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateInvoicePDF, validateOrderData, base64ToBuffer } from '@/lib/generateInvoicePDF'

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

    // Generate PDF using the utility function
    const pdfBuffer = await generateInvoicePDF(order, {
      returnBase64: false,
      format: 'A4'
    }) as Buffer

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.unique_order_id || order.id.slice(-8)}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error generating PDF invoice:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}

