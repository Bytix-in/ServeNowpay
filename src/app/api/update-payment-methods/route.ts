import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Update all orders with NULL payment_method to 'online' as default
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_method: 'online' })
      .is('payment_method', null)
      .select('id')

    if (error) {
      console.error('Error updating payment methods:', error)
      return NextResponse.json(
        { error: 'Failed to update payment methods' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      updated_count: data?.length || 0,
      message: `Updated ${data?.length || 0} orders with default payment method`
    })

  } catch (error) {
    console.error('Error in update-payment-methods:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}