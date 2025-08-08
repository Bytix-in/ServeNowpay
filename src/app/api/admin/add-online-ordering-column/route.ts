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

export async function POST(request: NextRequest) {
  try {
    console.log('Adding online_ordering_enabled column to restaurants table...')

    // Add the column using raw SQL
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE restaurants 
        ADD COLUMN IF NOT EXISTS online_ordering_enabled BOOLEAN DEFAULT false;
      `
    })

    if (error) {
      console.error('Error adding column:', error)
      
      // Try alternative approach using direct SQL execution
      const { data: altData, error: altError } = await supabaseAdmin
        .from('restaurants')
        .select('id')
        .limit(1)

      if (altError) {
        return NextResponse.json({
          error: 'Database connection failed',
          details: altError.message
        }, { status: 500 })
      }

      // If we can query but can't add column, it might be a permissions issue
      return NextResponse.json({
        error: 'Failed to add column. This might be a database permissions issue.',
        details: error.message,
        suggestion: 'Please add the column manually in your Supabase dashboard: ALTER TABLE restaurants ADD COLUMN online_ordering_enabled BOOLEAN DEFAULT false;'
      }, { status: 500 })
    }

    console.log('Column added successfully:', data)

    return NextResponse.json({
      success: true,
      message: 'online_ordering_enabled column added successfully to restaurants table'
    })

  } catch (error: any) {
    console.error('Error in add-online-ordering-column:', error)
    return NextResponse.json({
      error: 'Failed to add column',
      details: error.message
    }, { status: 500 })
  }
}