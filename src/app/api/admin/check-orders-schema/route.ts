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

export async function GET(request: NextRequest) {
  try {
    console.log('Checking orders table schema...')

    // Get a sample order to see what columns exist
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error querying orders:', error)
      return NextResponse.json({
        error: 'Failed to query orders table',
        details: error.message
      }, { status: 500 })
    }

    const columns = orders && orders.length > 0 
      ? Object.keys(orders[0])
      : []

    console.log('Available columns in orders table:', columns)

    // Check for required columns
    const requiredColumns = [
      'customer_address',
      'order_type'
    ]

    const missingColumns = requiredColumns.filter(col => !columns.includes(col))

    return NextResponse.json({
      success: true,
      columns,
      missingColumns,
      sampleData: orders?.[0] || null
    })

  } catch (error: any) {
    console.error('Error checking orders schema:', error)
    return NextResponse.json({
      error: 'Failed to check orders schema',
      details: error.message
    }, { status: 500 })
  }
}