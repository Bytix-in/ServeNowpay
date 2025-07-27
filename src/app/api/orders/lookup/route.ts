import { NextRequest, NextResponse } from 'next/server'
import { findOrder, validateOrderIdFormat, findOrderByGatewayId } from '@/lib/order-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    const gatewayOrderId = searchParams.get('gateway_order_id')

    if (!orderId && !gatewayOrderId) {
      return NextResponse.json({ 
        error: 'Either order_id or gateway_order_id must be provided',
        usage: {
          order_id: 'Search by internal order ID (UUID format)',
          gateway_order_id: 'Search by payment gateway order ID'
        }
      }, { status: 400 })
    }

    let result
    let searchType = ''

    if (orderId) {
      searchType = 'order_id'
      
      const validation = validateOrderIdFormat(orderId)
      if (!validation.isValid) {
        return NextResponse.json({
          error: 'Invalid order ID format',
          validation_errors: validation.errors,
          validation_warnings: validation.warnings,
          expected_format: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (UUID v4)',
          provided: orderId,
          search_type: searchType
        }, { status: 400 })
      }

      result = await findOrder(orderId)
    } else if (gatewayOrderId) {
      searchType = 'gateway_order_id'
      result = await findOrderByGatewayId(gatewayOrderId)
    }

    if (result?.found) {
      return NextResponse.json({
        success: true,
        order: result.order,
        search_method: result.searchMethod,
        search_type: searchType,
        message: 'Order found successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result?.error || 'Order not found',
        suggestions: result?.suggestions || [],
        search_type: searchType,
        help: {
          message: 'Order not found. Check the suggestions below or verify the order ID.',
          tips: [
            'Ensure the order ID is copied correctly without extra spaces',
            'Check if you meant to search by gateway_order_id instead',
            'Verify the order was created successfully',
            'Check recent orders in the admin panel'
          ]
        }
      }, { status: 404 })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}