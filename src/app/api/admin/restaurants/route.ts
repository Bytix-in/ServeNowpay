import { NextRequest, NextResponse } from 'next/server'
import { createRestaurant, getAllRestaurants, type CreateRestaurantData } from '@/lib/restaurant-service'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Create Supabase admin client with service role key
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

// GET - Get all restaurants
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

    const restaurants = await getAllRestaurants()
    return NextResponse.json({ restaurants })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}

// POST - Create new restaurant
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['restaurantName', 'ownerName', 'phoneNumber', 'email', 'address']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const restaurantData: CreateRestaurantData = {
      restaurantName: body.restaurantName,
      ownerName: body.ownerName,
      phoneNumber: body.phoneNumber,
      email: body.email,
      address: body.address,
      cuisineTags: body.cuisineTags || '',
      seatingCapacity: body.seatingCapacity || '0'
    }

    const credentials = await createRestaurant(restaurantData)
    
    // Create manager user in Supabase Auth using admin client
    try {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: `${credentials.managerUsername}@servenow.local`,
        password: credentials.managerPassword,
        user_metadata: {
          role: 'manager',
          name: `${restaurantData.restaurantName} Manager`,
          restaurant_id: credentials.restaurantId,
          restaurant_name: restaurantData.restaurantName
        },
        email_confirm: true
      })

      if (authError) {
        console.error('Auth user creation error:', authError)
        // Clean up the restaurant record if auth user creation fails
        if (credentials.databaseId) {
          await supabase.from('restaurants').delete().eq('id', credentials.databaseId)
        }
        throw new Error(`Failed to create manager account: ${authError.message}`)
      }
    } catch (authError) {
      console.error('Auth user creation failed:', authError)
      // Clean up the restaurant record
      if (credentials.databaseId) {
        await supabase.from('restaurants').delete().eq('id', credentials.databaseId)
      }
      throw new Error('Failed to create manager account')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Restaurant created successfully',
      credentials
    })
  } catch (error) {
    console.error('Error creating restaurant:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create restaurant' },
      { status: 500 }
    )
  }
}