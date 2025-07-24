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

    // Get all users from Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching users:', authError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Filter for manager users and check their last sign in
    const managerUsers = authData.users.filter(user => 
      user.user_metadata?.role === 'manager'
    )

    // Count active sessions (users who signed in within the last 24 hours)
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const activeManagers = managerUsers.filter(user => {
      if (!user.last_sign_in_at) return false
      const lastSignIn = new Date(user.last_sign_in_at)
      return lastSignIn > twentyFourHoursAgo
    })

    // Get restaurant details for active managers
    const activeRestaurants = []
    for (const manager of activeManagers) {
      const restaurantId = manager.user_metadata?.restaurant_id
      if (restaurantId) {
        try {
          const { data: restaurant } = await supabaseAdmin
            .from('restaurants')
            .select('id, name, status')
            .eq('id', restaurantId)
            .single()
          
          if (restaurant && restaurant.status === 'active') {
            activeRestaurants.push({
              id: restaurant.id,
              name: restaurant.name,
              managerEmail: manager.email,
              lastSignIn: manager.last_sign_in_at
            })
          }
        } catch (error) {
          console.error('Error fetching restaurant for manager:', error)
        }
      }
    }

    return NextResponse.json({
      activeCount: activeRestaurants.length,
      activeRestaurants: activeRestaurants,
      totalManagers: managerUsers.length,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}