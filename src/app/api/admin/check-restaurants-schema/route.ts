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
    console.log('Checking restaurants table schema...')

    // Get a sample restaurant to see what columns exist
    const { data: restaurants, error } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error querying restaurants:', error)
      return NextResponse.json({
        error: 'Failed to query restaurants table',
        details: error.message
      }, { status: 500 })
    }

    const columns = restaurants && restaurants.length > 0 
      ? Object.keys(restaurants[0])
      : []

    console.log('Available columns in restaurants table:', columns)

    return NextResponse.json({
      success: true,
      columns,
      hasOnlineOrderingColumn: columns.includes('online_ordering_enabled'),
      sampleData: restaurants?.[0] || null
    })

  } catch (error: any) {
    console.error('Error checking schema:', error)
    return NextResponse.json({
      error: 'Failed to check schema',
      details: error.message
    }, { status: 500 })
  }
}