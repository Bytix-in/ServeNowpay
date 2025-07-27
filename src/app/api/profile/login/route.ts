import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({
        success: false,
        error: 'Phone number is required'
      }, { status: 400 })
    }

    // Clean phone number (remove any non-digits)
    const cleanPhone = phone.replace(/\D/g, '')

    if (cleanPhone.length < 10) {
      return NextResponse.json({
        success: false,
        error: 'Please enter a valid phone number'
      }, { status: 400 })
    }

    // Check if user has any orders with this phone number
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('customer_name, customer_phone')
      .eq('customer_phone', cleanPhone)
      .limit(1)

    if (ordersError) {
      console.error('Database error:', ordersError)
      return NextResponse.json({
        success: false,
        error: 'Failed to verify phone number'
      }, { status: 500 })
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No orders found for this phone number. Please check your number or place an order first.'
      }, { status: 404 })
    }

    // Get customer name from the first order
    const customerName = orders[0].customer_name

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      customerName: customerName,
      phone: cleanPhone
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Login failed. Please try again.'
    }, { status: 500 })
  }
}