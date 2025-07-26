import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// Admin endpoint to create or update restaurant credentials
export async function POST(request: NextRequest) {
  try {
    const { restaurantId, username, password } = await request.json()

    // Validate input
    if (!restaurantId || !username || !password) {
      return NextResponse.json(
        { error: 'Restaurant ID, username, and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if restaurant exists
    const { data: restaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('id, name, restaurant_username')
      .eq('id', restaurantId)
      .single()

    if (fetchError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Check if username is already taken by another restaurant
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('restaurant_username', username.trim())
      .neq('id', restaurantId)
      .single()

    if (existingRestaurant) {
      return NextResponse.json(
        { error: 'Username is already taken by another restaurant' },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update restaurant with credentials
    const { error: updateError } = await supabase
      .from('restaurants')
      .update({
        restaurant_username: username.trim(),
        restaurant_password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', restaurantId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      message: 'Restaurant credentials created successfully',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        username: username.trim()
      }
    })
  } catch (error) {
    console.error('Create restaurant credentials error:', error)
    return NextResponse.json(
      { error: 'Failed to create restaurant credentials' },
      { status: 500 }
    )
  }
}

// Get restaurant info for credential setup
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('id, name, restaurant_username, status')
      .eq('id', restaurantId)
      .single()

    if (error || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        username: restaurant.restaurant_username,
        status: restaurant.status,
        hasCredentials: !!restaurant.restaurant_username
      }
    })
  } catch (error) {
    console.error('Get restaurant info error:', error)
    return NextResponse.json(
      { error: 'Failed to get restaurant information' },
      { status: 500 }
    )
  }
}