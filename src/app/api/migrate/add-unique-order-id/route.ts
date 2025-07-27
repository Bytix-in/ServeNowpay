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
    // Add uniqueOrderId column to orders table
    const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS unique_order_id VARCHAR(6) UNIQUE;
        
        CREATE INDEX IF NOT EXISTS idx_orders_unique_order_id 
        ON orders(unique_order_id);
      `
    })

    if (alterError) {
      console.error('Migration error:', alterError)
      return NextResponse.json({
        success: false,
        error: 'Failed to add uniqueOrderId column',
        details: alterError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully added uniqueOrderId column to orders table'
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}