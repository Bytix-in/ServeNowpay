import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
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

// Validation schema for staff
const staffSchema = z.object({
  restaurant_id: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  role: z.enum(['waiter', 'cook', 'cashier', 'manager', 'cleaner']).default('waiter'),
  email: z.string().email().optional().or(z.literal('')),
})

// GET - Fetch all staff for a restaurant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurant_id = searchParams.get('restaurant_id')

    if (!restaurant_id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    const { data: staff, error } = await supabaseAdmin
      .from('staff')
      .select('*')
      .eq('restaurant_id', restaurant_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching staff:', error)
      return NextResponse.json(
        { error: 'Failed to fetch staff' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: staff || []
    })

  } catch (error) {
    console.error('Error in GET /api/staff:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add new staff member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = staffSchema.parse(body)

    // Generate username and password
    const username = `${validatedData.name.toLowerCase().replace(/\s+/g, '')}_${Date.now().toString().slice(-4)}`
    const defaultPassword = 'staff123' // Default password, should be changed on first login
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    // Clean email field - convert empty string to null
    const staffData = {
      ...validatedData,
      email: validatedData.email && validatedData.email.trim() !== '' ? validatedData.email : null,
      username: username,
      password_hash: hashedPassword,
      status: 'active',
      is_active: true
    }

    // Check if staff with same phone already exists for this restaurant
    const { data: existingStaff } = await supabaseAdmin
      .from('staff')
      .select('id')
      .eq('restaurant_id', staffData.restaurant_id)
      .eq('phone', staffData.phone)
      .single()

    if (existingStaff) {
      return NextResponse.json(
        { error: 'Staff member with this phone number already exists' },
        { status: 409 }
      )
    }

    // Insert new staff member
    const { data: newStaff, error } = await supabaseAdmin
      .from('staff')
      .insert([staffData])
      .select()
      .single()

    if (error) {
      console.error('Error creating staff:', error)
      return NextResponse.json(
        { error: 'Failed to create staff member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: newStaff,
      credentials: {
        username: username,
        password: defaultPassword
      },
      message: 'Staff member added successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/staff:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update staff member
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Staff ID is required' },
        { status: 400 }
      )
    }

    // Clean email field
    if (updateData.email !== undefined) {
      updateData.email = updateData.email && updateData.email.trim() !== '' ? updateData.email : null
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString()

    const { data: updatedStaff, error } = await supabaseAdmin
      .from('staff')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating staff:', error)
      return NextResponse.json(
        { error: 'Failed to update staff member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedStaff,
      message: 'Staff member updated successfully'
    })

  } catch (error) {
    console.error('Error in PUT /api/staff:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove staff member
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Staff ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('staff')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting staff:', error)
      return NextResponse.json(
        { error: 'Failed to delete staff member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/staff:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}