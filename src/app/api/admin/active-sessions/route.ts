import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Create Supabase admin client
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

// Helper function to get authenticated user from request
async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    // Check if user has admin role
    const role = user.user_metadata?.role || 'staff'
    if (role !== 'admin') {
      return null
    }

    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      role: role as 'admin'
    }
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Check restaurants that are currently logged in
    const { data: loggedInRestaurants, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, status, last_login_at, is_logged_in')
      .eq('is_logged_in', true)
      .eq('status', 'active')
      .not('last_login_at', 'is', null)

    if (restaurantError) {
      console.error('Error fetching restaurant login status:', restaurantError)
    }

    // Filter restaurants that logged in within the last 24 hours
    const activeRestaurants: any[] = []
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    if (loggedInRestaurants) {
      loggedInRestaurants.forEach(restaurant => {
        if (restaurant.last_login_at) {
          const lastLogin = new Date(restaurant.last_login_at)
          if (lastLogin > twentyFourHoursAgo) {
            activeRestaurants.push({
              id: restaurant.id,
              name: restaurant.name,
              loginTime: restaurant.last_login_at,
              lastActivity: restaurant.last_login_at
            })
          }
        }
      })
    }

    // Get total restaurant count
    const { count: totalRestaurants } = await supabaseAdmin
      .from('restaurants')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      activeCount: activeRestaurants.length,
      activeRestaurants: activeRestaurants,
      totalRestaurants: totalRestaurants || 0,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}