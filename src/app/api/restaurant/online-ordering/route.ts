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
    console.log('POST /api/restaurant/online-ordering called')
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      })
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { restaurant_id, enabled } = body

    console.log('Request body:', { restaurant_id, enabled })

    if (!restaurant_id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Enabled status must be a boolean' },
        { status: 400 }
      )
    }

    // Update the restaurant's online ordering status
    console.log('Updating restaurant:', restaurant_id, 'to enabled:', enabled)
    
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .update({ online_ordering_enabled: enabled })
      .eq('id', restaurant_id)
      .select()

    console.log('Database update result:', { data, error })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: enabled 
        ? 'Online ordering has been enabled! Customers can now place delivery orders.'
        : 'Online ordering has been disabled. Only dine-in orders will be available.',
      enabled
    })

  } catch (error: any) {
    console.error('Error updating online ordering status:', error)
    return NextResponse.json(
      { error: `Server error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurant_id = searchParams.get('restaurant_id')

    if (!restaurant_id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Get the restaurant's online ordering status
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select('online_ordering_enabled')
      .eq('id', restaurant_id)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch online ordering status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      enabled: data?.online_ordering_enabled || false
    })

  } catch (error: any) {
    console.error('Error fetching online ordering status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch online ordering status. Please try again.' },
      { status: 500 }
    )
  }
}