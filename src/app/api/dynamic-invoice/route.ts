import { NextRequest, NextResponse } from 'next/server'
import { generateDynamicInvoice, validateOrderForInvoice, fetchInvoiceData } from '@/lib/dynamicInvoiceGenerator'

/**
 * Dynamic Invoice API - Generates invoices on-demand from immutable order data
 * NO STORAGE WHATSOEVER - always fresh and accurate from order details
 */

/**
 * GET: Generate and return invoice HTML
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const customerPhone = searchParams.get('customerPhone')
    const format = searchParams.get('format') || 'html' // html, json

    if (!orderId || !customerPhone) {
      return NextResponse.json(
        { error: 'Order ID and customer phone are required' },
        { status: 400 }
      )
    }

    // Validate order eligibility
    const validation = await validateOrderForInvoice(orderId)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Verify customer phone matches (security check)
    const { supabase } = await import('@/lib/supabase')
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('customer_phone, unique_order_id')
      .eq('id', orderId)
      .single()

    if (orderError || !order || order.customer_phone !== customerPhone) {
      return NextResponse.json(
        { error: 'Order not found or phone number mismatch' },
        { status: 404 }
      )
    }

    if (format === 'json') {
      // Return structured invoice data
      const invoiceData = await fetchInvoiceData(orderId)
      return NextResponse.json({
        success: true,
        data: invoiceData,
        generatedAt: new Date().toISOString(),
        type: 'dynamic-invoice-data'
      })
    } else {
      // Return HTML invoice
      const htmlContent = await generateDynamicInvoice(orderId)
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Invoice-Source': 'fresh-generation',
          'X-Invoice-Order': order.unique_order_id || orderId.slice(-8),
          'X-Storage-Type': 'none'
        }
      })
    }

  } catch (error) {
    console.error('Error in dynamic invoice GET:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate dynamic invoice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST: Generate invoice with additional options
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId, customerPhone, options = {} } = await request.json()

    if (!orderId || !customerPhone) {
      return NextResponse.json(
        { error: 'Order ID and customer phone are required' },
        { status: 400 }
      )
    }

    // Validate order eligibility
    const validation = await validateOrderForInvoice(orderId)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Verify customer phone matches (security check)
    const { supabase } = await import('@/lib/supabase')
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('customer_phone, unique_order_id')
      .eq('id', orderId)
      .single()

    if (orderError || !order || order.customer_phone !== customerPhone) {
      return NextResponse.json(
        { error: 'Order not found or phone number mismatch' },
        { status: 404 }
      )
    }

    console.log(`🧾 Generating dynamic invoice for order: ${orderId}`)

    // Generate invoice data and HTML
    const [invoiceData, htmlContent] = await Promise.all([
      fetchInvoiceData(orderId),
      generateDynamicInvoice(orderId)
    ])

    console.log(`✅ Dynamic invoice generated successfully for order: ${orderId}`)

    return NextResponse.json({
      success: true,
      message: 'Fresh invoice generated successfully',
      data: {
        orderId: orderId,
        uniqueOrderId: order.unique_order_id || orderId.slice(-8),
        customerName: invoiceData.customer_name,
        totalAmount: invoiceData.total_amount,
        itemCount: invoiceData.items.length,
        generatedAt: new Date().toISOString(),
        htmlContent: options.includeHtml ? htmlContent : undefined,
        invoiceData: options.includeData ? invoiceData : undefined
      },
      type: 'fresh-invoice-generation',
      storageType: 'none'
    })

  } catch (error) {
    console.error('Error in dynamic invoice POST:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate dynamic invoice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT: Validate order for invoice generation
 */
export async function PUT(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Validate order eligibility
    const validation = await validateOrderForInvoice(orderId)

    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        orderId: orderId,
        isReady: false,
        error: validation.error,
        type: 'invoice-validation'
      })
    }

    // Get basic order info
    const { supabase } = await import('@/lib/supabase')
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        unique_order_id,
        customer_name,
        total_amount,
        payment_status,
        created_at
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({
        success: false,
        orderId: orderId,
        isReady: false,
        error: 'Order not found',
        type: 'invoice-validation'
      })
    }

    return NextResponse.json({
      success: true,
      orderId: orderId,
      isReady: true,
      orderInfo: {
        uniqueOrderId: order.unique_order_id,
        customerName: order.customer_name,
        totalAmount: order.total_amount,
        paymentStatus: order.payment_status,
        createdAt: order.created_at
      },
      type: 'invoice-validation'
    })

  } catch (error) {
    console.error('Error in dynamic invoice validation:', error)
    return NextResponse.json(
      { 
        error: 'Failed to validate order for invoice generation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}