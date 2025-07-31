import { NextRequest, NextResponse } from 'next/server'
import { updateRestaurantStatus } from '@/lib/restaurant-service'

// PATCH - Update restaurant status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { status } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    if (!status || !['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (active or inactive)' },
        { status: 400 }
      )
    }

    const restaurant = await updateRestaurantStatus(id, status)

    return NextResponse.json({
      success: true,
      message: `Restaurant ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      restaurant: restaurant
    })

  } catch (error) {
    console.error('Error updating restaurant status:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update restaurant status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}