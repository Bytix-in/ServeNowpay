import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const phone = searchParams.get('phone')

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

    // Fetch orders for the customer with restaurant information
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurant:restaurants(name, address)
      `)
      .eq('customer_phone', cleanPhone)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Database error occurred' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orders: orders || []
    })

  } catch (error) {
    console.error('Profile orders error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}