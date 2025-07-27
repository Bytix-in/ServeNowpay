import { NextRequest, NextResponse } from 'next/server'
import { findOrder, validateOrderIdFormat } from '@/lib/order-utils'
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

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId

    if (!orderId) {
      return NextResponse.json({
        error: 'Order ID is required',
        code: 'MISSING_ORDER_ID'
      }, { status: 400 })
    }

    // Validate order ID format
    const validation = validateOrderIdFormat(orderId)
    if (!validation.isValid) {
      return NextResponse.json({
        error: 'Invalid order ID format',
        code: 'INVALID_ORDER_ID_FORMAT',
        validation_errors: validation.errors,
        validation_warnings: validation.warnings,
        expected_format: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (UUID v4)',
        provided: orderId
      }, { status: 400 })
    }

    // Find the order
    const result = await findOrder(orderId)

    if (result.found && result.order) {
      return NextResponse.json({
        success: true,
        order: result.order,
        search_method: result.searchMethod
      })
    } else {
      return NextResponse.json({
        error: 'Order not found',
        code: 'ORDER_NOT_FOUND',
        order_id: orderId,
        suggestions: result.suggestions || [],
        help: {
          message: 'The requested order could not be found.',
          possible_causes: [
            'Order ID was copied incorrectly',
            'Order was never created successfully',
            'Order was deleted',
            'Wrong environment (development vs production)'
          ],
          next_steps: [
            'Verify the order ID is correct',
            'Check the suggestions below',
            'Contact support if the order should exist'
          ]
        }
      }, { status: 404 })
    }

  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : 
        undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId
    const updates = await request.json()

    if (!orderId) {
      return NextResponse.json({
        error: 'Order ID is required',
        code: 'MISSING_ORDER_ID'
      }, { status: 400 })
    }

    // Validate order ID format
    const validation = validateOrderIdFormat(orderId)
    if (!validation.isValid) {
      return NextResponse.json({
        error: 'Invalid order ID format',
        code: 'INVALID_ORDER_ID_FORMAT'
      }, { status: 400 })
    }

    // Update the order
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({
        error: 'Failed to update order',
        code: 'UPDATE_FAILED',
        details: updateError.message
      }, { status: 500 })
    }

    if (!updatedOrder) {
      return NextResponse.json({
        error: 'Order not found',
        code: 'ORDER_NOT_FOUND'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : 
        undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}