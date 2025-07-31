import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with service role key for admin operations
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

// GET - Fetch specific order details
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params

    if (!orderId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Order ID is required',
          code: 'MISSING_ORDER_ID'
        },
        { status: 400 }
      )
    }

    // Try to find order by ID first
    let { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    // If not found by ID, try by unique_order_id
    if (error && error.code === 'PGRST116') {
      const { data: orderByUniqueId, error: uniqueError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('unique_order_id', orderId)
        .single()

      if (!uniqueError && orderByUniqueId) {
        order = orderByUniqueId
        error = null
      }
    }

    if (error || !order) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      order: order
    })

  } catch (error) {
    console.error('Error fetching order details:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch order details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PATCH - Update order details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params
    const body = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Order ID is required' 
        },
        { status: 400 }
      )
    }

    // Update order in database
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    // If not found by ID, try by unique_order_id
    if (error && error.code === 'PGRST116') {
      const { data: orderByUniqueId, error: uniqueError } = await supabaseAdmin
        .from('orders')
        .update({
          ...body,
          updated_at: new Date().toISOString()
        })
        .eq('unique_order_id', orderId)
        .select()
        .single()

      if (!uniqueError && orderByUniqueId) {
        return NextResponse.json({
          success: true,
          message: 'Order updated successfully',
          order: orderByUniqueId
        })
      }
    }

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to update order' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: order
    })

  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update order' 
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params

    if (!orderId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Order ID is required' 
        },
        { status: 400 }
      )
    }

    // Delete order from database
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (error) {
      console.error('Error deleting order:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to delete order' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete order' 
      },
      { status: 500 }
    )
  }
}