import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

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

// POST - Restaurant login
export async function POST(request: NextRequest) {
  try {
    const { username, password, action } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (action !== 'login') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Find restaurant by username
    const { data: restaurant, error: fetchError } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, slug, restaurant_username, restaurant_password_hash, status, owner_name, email')
      .eq('restaurant_username', username.trim())
      .single()

    if (fetchError || !restaurant) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Check if restaurant is active
    if (restaurant.status !== 'active') {
      return NextResponse.json(
        { error: 'Restaurant account is inactive. Please contact support.' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, restaurant.restaurant_password_hash)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Update login status and session
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
    const { error: updateError } = await supabaseAdmin
      .from('restaurants')
      .update({
        is_logged_in: true,
        last_login_at: new Date().toISOString(),
        login_session_token: sessionToken,
        updated_at: new Date().toISOString()
      })
      .eq('id', restaurant.id)

    if (updateError) {
      console.error('Error updating login status:', updateError)
      // Don't fail the login for this, just log it
    }

    // Return user data in the format expected by the frontend
    const user = {
      id: restaurant.id,
      email: restaurant.email || `${restaurant.restaurant_username}@restaurant.local`,
      name: restaurant.owner_name || restaurant.name,
      role: 'restaurant' as const,
      restaurantId: restaurant.id,
      restaurantSlug: restaurant.slug
    }

    return NextResponse.json({
      success: true,
      restaurant: user,
      user: user, // Keep both for compatibility
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Restaurant authentication error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// GET - Check restaurant session (optional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get('session')

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token required' },
        { status: 400 }
      )
    }

    // Find restaurant by session token
    const { data: restaurant, error } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, slug, restaurant_username, status, owner_name, email, is_logged_in, last_login_at')
      .eq('login_session_token', sessionToken)
      .eq('is_logged_in', true)
      .single()

    if (error || !restaurant) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Check if session is still valid (within 24 hours)
    const lastLogin = new Date(restaurant.last_login_at).getTime()
    const now = Date.now()
    const oneDayInMs = 24 * 60 * 60 * 1000

    if (now - lastLogin > oneDayInMs) {
      // Session expired, clear it
      await supabaseAdmin
        .from('restaurants')
        .update({
          is_logged_in: false,
          login_session_token: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurant.id)

      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    // Return user data
    const user = {
      id: restaurant.id,
      email: restaurant.email || `${restaurant.restaurant_username}@restaurant.local`,
      name: restaurant.owner_name || restaurant.name,
      role: 'restaurant' as const,
      restaurantId: restaurant.id,
      restaurantSlug: restaurant.slug
    }

    return NextResponse.json({
      success: true,
      user: user,
      valid: true
    })

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: 'Session check failed' },
      { status: 500 }
    )
  }
}