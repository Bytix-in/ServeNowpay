import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

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

// Generate a unique manager username
function generateManagerUsername(restaurantName: string): string {
  const baseUsername = restaurantName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 10)
  
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  return `mgr_${baseUsername}_${randomSuffix}`
}

// Generate a secure random password
function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const restaurantId = params.id

    // Get restaurant details
    const { data: restaurant, error: fetchError } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single()

    if (fetchError || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    // Generate new credentials
    const newUsername = generateManagerUsername(restaurant.name)
    const newPassword = generatePassword()
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Update restaurant with new credentials
    const { data: updatedRestaurant, error: updateError } = await supabaseAdmin
      .from('restaurants')
      .update({
        restaurant_username: newUsername,
        restaurant_password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', restaurantId)
      .select()
      .single()

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json({ error: 'Failed to update credentials' }, { status: 500 })
    }

    // Update or create Supabase Auth user
    try {
      const authEmail = `${newUsername}@servenow.local`
      
      // Try to find existing auth user by email
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = existingUsers.users.find(u => u.email === authEmail)

      if (existingUser) {
        // Update existing user
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: newPassword,
          user_metadata: {
            role: 'manager',
            name: `${restaurant.name} Manager`,
            restaurant_id: restaurantId,
            restaurant_name: restaurant.name
          }
        })
      } else {
        // Create new auth user
        await supabaseAdmin.auth.admin.createUser({
          email: authEmail,
          password: newPassword,
          user_metadata: {
            role: 'manager',
            name: `${restaurant.name} Manager`,
            restaurant_id: restaurantId,
            restaurant_name: restaurant.name
          },
          email_confirm: true
        })
      }
    } catch (authError) {
      console.error('Auth user creation/update error:', authError)
      // Don't fail the request if auth user creation fails
      // The database credentials are still updated
    }

    return NextResponse.json({
      message: 'New credentials generated successfully',
      username: newUsername,
      password: newPassword,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}