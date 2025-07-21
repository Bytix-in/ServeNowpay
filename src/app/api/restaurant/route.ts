import { NextRequest, NextResponse } from 'next/server'

// Mock restaurant data
const restaurants = [
  {
    id: 1,
    name: 'ServeNow Restaurant',
    address: '123 Main St, City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'contact@servenow-restaurant.com',
    cuisine: 'American',
    rating: 4.5,
    hours: {
      monday: '9:00 AM - 10:00 PM',
      tuesday: '9:00 AM - 10:00 PM',
      wednesday: '9:00 AM - 10:00 PM',
      thursday: '9:00 AM - 10:00 PM',
      friday: '9:00 AM - 11:00 PM',
      saturday: '9:00 AM - 11:00 PM',
      sunday: '10:00 AM - 9:00 PM'
    },
    settings: {
      taxRate: 0.08,
      serviceCharge: 0.15,
      currency: 'USD',
      timezone: 'America/New_York'
    }
  }
]

// Get restaurant information
export async function GET() {
  try {
    return NextResponse.json({ restaurant: restaurants[0] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch restaurant information' },
      { status: 500 }
    )
  }
}

// Update restaurant information
export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json()
    
    // In a real app, you'd update the database
    const updatedRestaurant = { ...restaurants[0], ...updates }
    restaurants[0] = updatedRestaurant

    return NextResponse.json({ 
      restaurant: updatedRestaurant,
      message: 'Restaurant information updated successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update restaurant information' },
      { status: 500 }
    )
  }
}