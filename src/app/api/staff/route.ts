import { NextRequest, NextResponse } from 'next/server'

// Mock staff data
let staff = [
  {
    id: 'staff_001',
    name: 'Sarah Wilson',
    email: 'sarah@servenow.com',
    phone: '+1 (555) 111-2222',
    role: 'senior_staff',
    status: 'online',
    shift: {
      start: '09:00',
      end: '17:00',
      break: '12:00-13:00'
    },
    performance: {
      ordersToday: 12,
      ordersThisWeek: 67,
      rating: 4.8,
      completionRate: 0.94
    },
    permissions: ['take_orders', 'manage_tables', 'process_payments'],
    hireDate: '2023-01-15',
    hourlyRate: 18.50,
    isActive: true
  },
  {
    id: 'staff_002',
    name: 'Mike Chen',
    email: 'mike@servenow.com',
    phone: '+1 (555) 333-4444',
    role: 'staff',
    status: 'online',
    shift: {
      start: '10:00',
      end: '18:00',
      break: '13:00-14:00'
    },
    performance: {
      ordersToday: 8,
      ordersThisWeek: 45,
      rating: 4.6,
      completionRate: 0.89
    },
    permissions: ['take_orders', 'manage_tables'],
    hireDate: '2023-03-20',
    hourlyRate: 16.00,
    isActive: true
  },
  {
    id: 'staff_003',
    name: 'Emma Davis',
    email: 'emma@servenow.com',
    phone: '+1 (555) 555-6666',
    role: 'staff',
    status: 'break',
    shift: {
      start: '11:00',
      end: '19:00',
      break: '14:00-15:00'
    },
    performance: {
      ordersToday: 6,
      ordersThisWeek: 38,
      rating: 4.7,
      completionRate: 0.91
    },
    permissions: ['take_orders'],
    hireDate: '2023-05-10',
    hourlyRate: 15.50,
    isActive: true
  }
]

// Get all staff members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const role = searchParams.get('role')
    const active = searchParams.get('active')

    let filteredStaff = staff

    if (status) {
      filteredStaff = filteredStaff.filter(member => member.status === status)
    }

    if (role) {
      filteredStaff = filteredStaff.filter(member => member.role === role)
    }

    if (active === 'true') {
      filteredStaff = filteredStaff.filter(member => member.isActive)
    }

    return NextResponse.json({ staff: filteredStaff })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch staff members' },
      { status: 500 }
    )
  }
}

// Create new staff member
export async function POST(request: NextRequest) {
  try {
    const staffData = await request.json()
    
    const newStaff = {
      id: `staff_${Date.now()}`,
      ...staffData,
      status: 'offline',
      performance: {
        ordersToday: 0,
        ordersThisWeek: 0,
        rating: 0,
        completionRate: 0
      },
      hireDate: new Date().toISOString().split('T')[0],
      isActive: true
    }

    staff.push(newStaff)

    return NextResponse.json({ 
      staff: newStaff,
      message: 'Staff member added successfully'
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    )
  }
}

// Update staff member
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json()
    
    const staffIndex = staff.findIndex(member => member.id === id)
    if (staffIndex === -1) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      )
    }

    staff[staffIndex] = { ...staff[staffIndex], ...updates }

    return NextResponse.json({ 
      staff: staff[staffIndex],
      message: 'Staff member updated successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    )
  }
}

// Delete staff member
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const staffIndex = staff.findIndex(member => member.id === id)
    if (staffIndex === -1) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      )
    }

    // Soft delete - mark as inactive instead of removing
    staff[staffIndex].isActive = false

    return NextResponse.json({ message: 'Staff member deactivated successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    )
  }
}