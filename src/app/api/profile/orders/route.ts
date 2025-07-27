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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({
        success: false,
        error: 'Phone number is required'
      }, { status: 400 })
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '')

    // Fetch orders for this phone number
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        unique_order_id,
        restaurant_id,
        customer_name,
        customer_phone,
        table_number,
        items,
        total_amount,
        status,
        payment_status,
        created_at
      `)
      .eq('customer_phone', cleanPhone)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Database error:', ordersError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch orders'
      }, { status: 500 })
    }

    // Fetch restaurant details separately for each order
    const transformedOrders = []
    
    if (orders) {
      for (const order of orders) {
        let restaurantData = null
        
        if (order.restaurant_id) {
          try {
            const { data: restaurant, error: restaurantError } = await supabaseAdmin
              .from('restaurants')
              .select('name, address')
              .eq('id', order.restaurant_id)
              .single()
            
            if (!restaurantError && restaurant) {
              restaurantData = {
                name: restaurant.name || 'Unknown Restaurant',
                address: restaurant.address || null
              }
            }
          } catch (err) {
            console.error('Error fetching restaurant data:', err)
            // Continue with null restaurant data
          }
        }
        
        transformedOrders.push({
          ...order,
          restaurant: restaurantData
        })
      }
    }

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      total: transformedOrders.length
    })

  } catch (error) {
    console.error('Fetch orders error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch orders'
    }, { status: 500 })
  }
}