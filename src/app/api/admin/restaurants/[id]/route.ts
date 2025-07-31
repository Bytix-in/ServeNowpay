import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getRestaurantById, updateRestaurantStatus } from '@/lib/restaurant-service'

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

// GET - Fetch specific restaurant details
export async function GET(
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

    const restaurant = await getRestaurantById(id)

    return NextResponse.json({
      success: true,
      restaurant: restaurant
    })

  } catch (error) {
    console.error('Error fetching restaurant details:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch restaurant details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PATCH - Update restaurant details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

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
        ...body,
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
      restaurant: restaurant
    })

  } catch (error) {
    console.error('Error updating restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to update restaurant' },
      { status: 500 }
    )
  }
}

// DELETE - Delete restaurant
export async function DELETE(
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