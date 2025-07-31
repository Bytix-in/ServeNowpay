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

// POST - Generate new manager credentials
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // First, get the restaurant details including current username
    const { data: restaurant, error: fetchError } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, restaurant_username')
      .eq('id', id)
      .single()

    if (fetchError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Keep existing username or generate new one if none exists
    let currentUsername = restaurant.restaurant_username
    if (!currentUsername) {
      currentUsername = generateManagerUsername(restaurant.name)
    }

    // Generate only new password
    const newPassword = generatePassword()
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update restaurant with new password only (keep existing username)
    const { error: updateError } = await supabaseAdmin
      .from('restaurants')
      .update({
        restaurant_username: currentUsername,
        restaurant_password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating restaurant credentials:', updateError)
      return NextResponse.json(
        { error: 'Failed to update restaurant credentials' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'New password generated successfully',
      username: currentUsername,
      password: newPassword
    })

  } catch (error) {
    console.error('Error generating credentials:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate credentials',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}