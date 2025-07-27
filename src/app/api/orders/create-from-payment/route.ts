import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateUniqueOrderId } from '@/lib/unique-id-utils'

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

async function generateUniqueOrderIdWithRetry(maxRetries = 5): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const uniqueId = generateUniqueOrderId()
    
    // Check if this ID already exists
    const { data: existing } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('unique_order_id', uniqueId)
      .single()
    
    if (!existing) {
      return uniqueId
    }
  }
  
  throw new Error('Failed to generate unique order ID after multiple attempts')
}

export async function POST(request: NextRequest) {
  try {
    const { 
      orderId, 
      restaurantId, 
      customerName, 
      customerPhone, 
      tableNumber, 
      items, 
      totalAmount,
      paymentGatewayOrderId 
    } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Check if order already exists
    const { data: existingOrder, error: checkError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (existingOrder) {
      // Order already exists, return it
      return NextResponse.json({
        success: true,
        order: existingOrder,
        created: false,
        message: 'Order already exists'
      })
    }

    // If we have all the required data, create the order
    if (restaurantId && customerName && customerPhone && tableNumber && items && totalAmount) {
      const uniqueOrderId = await generateUniqueOrderIdWithRetry()
      
      const { data: newOrder, error: createError } = await supabaseAdmin
        .from('orders')
        .insert({
          id: orderId,
          restaurant_id: restaurantId,
          customer_name: customerName,
          customer_phone: customerPhone,
          table_number: tableNumber,
          items: items,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'verifying',
          payment_gateway_order_id: paymentGatewayOrderId || null,
          unique_order_id: uniqueOrderId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('Order creation error:', createError)
        return NextResponse.json({
          success: false,
          error: 'Failed to create order',
          details: createError.message
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        order: newOrder,
        created: true,
        message: 'Order created successfully'
      })
    }

    // If order doesn't exist and we don't have enough data to create it
    return NextResponse.json({
      success: false,
      error: 'Order not found and insufficient data to create new order',
      code: 'ORDER_NOT_FOUND_INSUFFICIENT_DATA',
      message: 'The order does not exist in the database. To create a new order, please provide restaurant_id, customer details, items, and total_amount.',
      required_fields: ['restaurantId', 'customerName', 'customerPhone', 'tableNumber', 'items', 'totalAmount']
    }, { status: 404 })

  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}