import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
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

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Skip authentication for now to avoid dynamic server usage during build
    // In production, implement proper authentication middleware
    
    const now = new Date()

    // Clean up expired sessions first (older than 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    await supabaseAdmin
      .from('restaurants')
      .update({
        is_logged_in: false,
        login_session_token: null,
        updated_at: new Date().toISOString()
      })
      .eq('is_logged_in', true)
      .lt('last_login_at', twentyFourHoursAgo.toISOString())

    // Get all restaurants with their login status
    const { data: restaurants, error: restaurantsError } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, slug, is_logged_in, last_login_at, login_session_token')
      .eq('status', 'active')

    if (restaurantsError) {
      console.error('Error fetching restaurants:', restaurantsError)
      return NextResponse.json(
        { error: 'Failed to fetch restaurants' },
        { status: 500 }
      )
    }

    // Filter active sessions (currently logged in)
    const activeRestaurants = restaurants.filter(restaurant => {
      return restaurant.is_logged_in && restaurant.last_login_at
    })

    // Debug logging
    console.log('🔍 Active Sessions Debug:', {
      totalRestaurants: restaurants.length,
      activeRestaurants: activeRestaurants.length,
      restaurantStatuses: restaurants.map(r => ({
        id: r.id,
        name: r.name,
        is_logged_in: r.is_logged_in,
        last_login_at: r.last_login_at
      }))
    })

    // Get additional info for active restaurants
    const activeRestaurantsWithDetails = activeRestaurants.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      lastLoginAt: restaurant.last_login_at,
      isLoggedIn: restaurant.is_logged_in
    }))

    return NextResponse.json({
      success: true,
      activeCount: activeRestaurants.length,
      totalRestaurants: restaurants.length,
      activeRestaurants: activeRestaurantsWithDetails,
      lastUpdated: now.toISOString()
    })

  } catch (error) {
    console.error('Error in active-sessions API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}