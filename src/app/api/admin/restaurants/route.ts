import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRestaurant, getAllRestaurants, type CreateRestaurantData } from '@/lib/restaurant-service'

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

// GET - Fetch all restaurants (admin only)
export async function GET(request: NextRequest) {
  try {
    const restaurants = await getAllRestaurants()
    
    return NextResponse.json({
      success: true,
      data: restaurants,
      restaurants: restaurants, // Also include for backward compatibility
      count: restaurants?.length || 0
    })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch restaurants',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Create new restaurant (admin only)
export async function POST(request: NextRequest) {
  try {

    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['restaurantName', 'ownerName', 'phoneNumber', 'email', 'address']
    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate seating capacity if provided
    if (body.seatingCapacity && (isNaN(parseInt(body.seatingCapacity)) || parseInt(body.seatingCapacity) < 1)) {
      return NextResponse.json(
        { error: 'Seating capacity must be a positive number' },
        { status: 400 }
      )
    }

    // Create restaurant data object
    const restaurantData: CreateRestaurantData = {
      restaurantName: body.restaurantName.trim(),
      ownerName: body.ownerName.trim(),
      phoneNumber: body.phoneNumber.trim(),
      email: body.email.trim(),
      address: body.address.trim(),
      cuisineTags: body.cuisineTags?.trim() || '',
      seatingCapacity: body.seatingCapacity?.trim() || ''
    }

    // Create restaurant using the service
    const credentials = await createRestaurant(restaurantData)

    return NextResponse.json({
      success: true,
      message: 'Restaurant created successfully',
      credentials: credentials
    })

  } catch (error) {
    console.error('Error creating restaurant:', error)
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'A restaurant with this information already exists' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create restaurant' },
      { status: 500 }
    )
  }
}

// PUT - Update restaurant (admin only)
export async function PUT(request: NextRequest) {
  try {

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Update restaurant in database
    const { data: restaurant, error } = await supabaseAdmin
      .from('restaurants')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating restaurant:', error)
      return NextResponse.json(
        { error: 'Failed to update restaurant' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant
    })

  } catch (error) {
    console.error('Error updating restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to update restaurant' },
      { status: 500 }
    )
  }
}

// DELETE - Delete restaurant (admin only)
export async function DELETE(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Delete restaurant from database (this will cascade to related records)
    const { error } = await supabaseAdmin
      .from('restaurants')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting restaurant:', error)
      return NextResponse.json(
        { error: 'Failed to delete restaurant' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Restaurant deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to delete restaurant' },
      { status: 500 }
    )
  }
}