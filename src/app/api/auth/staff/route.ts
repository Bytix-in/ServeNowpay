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

// Staff login endpoint
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

    if (action === 'login') {
      // Query the staff table for the username
      const { data: staff, error } = await supabaseAdmin
        .from('staff')
        .select(`
          *,
          restaurants!inner(id, name, slug, status)
        `)
        .eq('username', username.trim())
        .eq('is_active', true)
        .eq('status', 'active')
        .single()

      if (error || !staff) {
        return NextResponse.json(
          { error: 'Invalid username or password' },
          { status: 401 }
        )
      }

      // Check if restaurant is active
      if (staff.restaurants.status !== 'active') {
        return NextResponse.json(
          { error: 'Restaurant is currently inactive' },
          { status: 401 }
        )
      }

      // Check if staff has credentials set up
      if (!staff.password_hash) {
        return NextResponse.json(
          { error: 'Staff login not configured. Please contact your manager.' },
          { status: 401 }
        )
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, staff.password_hash)
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid username or password' },
          { status: 401 }
        )
      }

      // Update staff login status
      const sessionToken = crypto.randomUUID();
      await supabaseAdmin
        .from('staff')
        .update({
          last_login_at: new Date().toISOString(),
          session_token: sessionToken,
          is_online: true
        })
        .eq('id', staff.id);

      // Return staff information
      return NextResponse.json({
        user: {
          id: staff.id,
          email: staff.email || '',
          role: 'staff',
          name: staff.name,
          staffId: staff.id,
          staffRole: staff.role,
          restaurantId: staff.restaurant_id,
          restaurantName: staff.restaurants.name,
          restaurantSlug: staff.restaurants.slug
        },
        staff: {
          id: staff.id,
          name: staff.name,
          phone: staff.phone,
          email: staff.email,
          role: staff.role,
          status: staff.status,
          restaurant_id: staff.restaurant_id,
          restaurant_name: staff.restaurants.name
        },
        message: 'Login successful'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Staff auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    )
  }
}

// Staff logout endpoint
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const staff_id = searchParams.get('staff_id');

    if (staff_id) {
      // Update staff offline status
      await supabaseAdmin
        .from('staff')
        .update({
          session_token: null,
          is_online: false
        })
        .eq('id', staff_id);
    }

    return NextResponse.json({ message: 'Staff logged out successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}