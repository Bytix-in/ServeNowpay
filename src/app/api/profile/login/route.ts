import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Clean phone number (remove any non-digits)
    const cleanPhone = phone.replace(/\D/g, '')

    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid phone number' },
        { status: 400 }
      )
    }

    // Check if customer exists in orders table
    const { data: orders, error } = await supabase
      .from('orders')
      .select('customer_name, customer_phone')
      .eq('customer_phone', cleanPhone)
      .limit(1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Database error occurred' },
        { status: 500 }
      )
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No orders found for this phone number' },
        { status: 404 }
      )
    }

    // Return success with customer name
    return NextResponse.json({
      success: true,
      customerName: orders[0].customer_name,
      phone: cleanPhone
    })

  } catch (error) {
    console.error('Profile login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}