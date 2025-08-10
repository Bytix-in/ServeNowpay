import { NextRequest, NextResponse } from 'next/server'
import { createOrderWithValidation } from '@/lib/order-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      restaurant_id,
      customer_name,
      customer_phone,
      table_number,
      customer_address,
      customer_note,
      order_type,
      payment_method,
      items,
      total_amount
    } = body

    // Validate required fields
    if (!restaurant_id || !customer_name || !customer_phone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create order using the existing utility function
    const orderResult = await createOrderWithValidation({
      restaurant_id,
      customer_name,
      customer_phone,
      table_number: order_type === 'dine_in' ? table_number : null,
      customer_address: order_type === 'online' ? customer_address : null,
      customer_note: customer_note || null,
      order_type,
      payment_method,
      items,
      total_amount,
      status: 'pending',
      payment_status: 'completed' // Cash orders are considered paid
    })

    if (!orderResult.success) {
      return NextResponse.json(
        { error: orderResult.error || 'Failed to create order' },
        { status: 500 }
      )
    }

    const order = orderResult.order

    return NextResponse.json({
      success: true,
      order_id: order.id,
      unique_order_id: order.unique_order_id,
      message: 'Cash order placed successfully!'
    })

  } catch (error) {
    console.error('Error in create-cash-order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}