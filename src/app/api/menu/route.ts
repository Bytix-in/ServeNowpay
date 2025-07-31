import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

// Get all menu items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurant_id')
    const category = searchParams.get('category')
    const available = searchParams.get('available')

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('dish_type', category)
    }

    const { data: menuItems, error } = await query

    if (error) {
      console.error('Error fetching menu items:', error)
      return NextResponse.json(
        { error: 'Failed to fetch menu items' },
        { status: 500 }
      )
    }

    // Filter by availability if requested
    let filteredItems = menuItems || []
    if (available === 'true') {
      // For now, assume all items are available since we don't have an 'available' field
      // You can add this field to the database schema if needed
    }

    return NextResponse.json({ 
      success: true,
      menuItems: filteredItems 
    })
  } catch (error) {
    console.error('Error in GET /api/menu:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    )
  }
}

// Create new menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['restaurant_id', 'name', 'description', 'price', 'preparation_time']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate price and preparation_time are numbers
    if (isNaN(parseFloat(body.price)) || parseFloat(body.price) <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      )
    }

    if (isNaN(parseInt(body.preparation_time)) || parseInt(body.preparation_time) <= 0) {
      return NextResponse.json(
        { error: 'Preparation time must be a positive number' },
        { status: 400 }
      )
    }

    // Prepare menu item data for database
    const menuItemData = {
      restaurant_id: body.restaurant_id,
      name: body.name.trim(),
      description: body.description.trim(),
      price: parseFloat(body.price),
      preparation_time: parseInt(body.preparation_time),
      dish_type: body.dish_type || body.category || 'Main Course',
      ingredients: body.ingredients || '',
      tags: body.tags || '',
      image_url: body.image_url || null,
      image_data: body.image_data || null
    }

    // Insert into database
    const { data: menuItem, error } = await supabaseAdmin
      .from('menu_items')
      .insert([menuItemData])
      .select()
      .single()

    if (error) {
      console.error('Error creating menu item:', error)
      return NextResponse.json(
        { error: 'Failed to create menu item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      menuItem,
      message: 'Menu item created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/menu:', error)
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    )
  }
}

// Update menu item
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Menu item ID is required' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    // Remove any undefined or null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key]
      }
    })

    const { data: menuItem, error } = await supabaseAdmin
      .from('menu_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating menu item:', error)
      return NextResponse.json(
        { error: 'Failed to update menu item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      menuItem,
      message: 'Menu item updated successfully'
    })
  } catch (error) {
    console.error('Error in PUT /api/menu:', error)
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    )
  }
}

// Delete menu item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Menu item ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('menu_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting menu item:', error)
      return NextResponse.json(
        { error: 'Failed to delete menu item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Menu item deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/menu:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    )
  }
}