import { NextRequest, NextResponse } from 'next/server'

// Mock tables data
let tables = [
  {
    id: 1,
    number: 1,
    capacity: 2,
    status: 'available',
    location: 'main_floor',
    assignedStaff: null,
    currentOrder: null,
    reservedBy: null,
    reservedAt: null,
    lastCleaned: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    notes: ''
  },
  {
    id: 2,
    number: 2,
    capacity: 4,
    status: 'occupied',
    location: 'main_floor',
    assignedStaff: 'staff_001',
    currentOrder: 1234,
    reservedBy: null,
    reservedAt: null,
    lastCleaned: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    notes: 'Customer requested quiet area'
  },
  {
    id: 3,
    number: 3,
    capacity: 6,
    status: 'reserved',
    location: 'main_floor',
    assignedStaff: 'staff_002',
    currentOrder: null,
    reservedBy: 'Johnson Family',
    reservedAt: new Date(Date.now() + 1800000).toISOString(), // 30 minutes from now
    lastCleaned: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
    notes: 'Birthday celebration - need high chair'
  },
  {
    id: 4,
    number: 4,
    capacity: 2,
    status: 'cleaning',
    location: 'main_floor',
    assignedStaff: null,
    currentOrder: null,
    reservedBy: null,
    reservedAt: null,
    lastCleaned: new Date().toISOString(),
    notes: 'Deep cleaning in progress'
  },
  {
    id: 5,
    number: 5,
    capacity: 8,
    status: 'available',
    location: 'private_room',
    assignedStaff: null,
    currentOrder: null,
    reservedBy: null,
    reservedAt: null,
    lastCleaned: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
    notes: 'Private dining room with projector'
  }
]

// Get all tables
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const location = searchParams.get('location')
    const staffId = searchParams.get('staffId')

    let filteredTables = tables

    if (status) {
      filteredTables = filteredTables.filter(table => table.status === status)
    }

    if (location) {
      filteredTables = filteredTables.filter(table => table.location === location)
    }

    if (staffId) {
      filteredTables = filteredTables.filter(table => table.assignedStaff === staffId)
    }

    // Sort by table number
    filteredTables.sort((a, b) => a.number - b.number)

    return NextResponse.json({ tables: filteredTables })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    )
  }
}

// Create new table
export async function POST(request: NextRequest) {
  try {
    const tableData = await request.json()
    
    const newTable = {
      id: tables.length + 1,
      ...tableData,
      status: 'available',
      assignedStaff: null,
      currentOrder: null,
      reservedBy: null,
      reservedAt: null,
      lastCleaned: new Date().toISOString(),
      notes: ''
    }

    tables.push(newTable)

    return NextResponse.json({ 
      table: newTable,
      message: 'Table created successfully'
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    )
  }
}

// Update table
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json()
    
    const tableIndex = tables.findIndex(table => table.id === id)
    if (tableIndex === -1) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      )
    }

    // Update lastCleaned if status is being changed to available
    if (updates.status === 'available' && tables[tableIndex].status !== 'available') {
      updates.lastCleaned = new Date().toISOString()
    }

    tables[tableIndex] = { ...tables[tableIndex], ...updates }

    return NextResponse.json({ 
      table: tables[tableIndex],
      message: 'Table updated successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update table' },
      { status: 500 }
    )
  }
}

// Delete table
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '0')

    const tableIndex = tables.findIndex(table => table.id === id)
    if (tableIndex === -1) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      )
    }

    // Check if table is currently occupied
    if (tables[tableIndex].status === 'occupied') {
      return NextResponse.json(
        { error: 'Cannot delete occupied table' },
        { status: 400 }
      )
    }

    tables.splice(tableIndex, 1)

    return NextResponse.json({ message: 'Table deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete table' },
      { status: 500 }
    )
  }
}