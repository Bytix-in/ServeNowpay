import { NextRequest, NextResponse } from 'next/server'

// Mock orders data
let orders = [
  {
    id: 1234,
    customerId: 'cust_001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1 (555) 123-4567',
    tableNumber: 12,
    items: [
      { id: 1, name: 'Classic Burger', quantity: 2, price: 12.99, total: 25.98 },
      { id: 2, name: 'Caesar Salad', quantity: 1, price: 8.99, total: 8.99 }
    ],
    subtotal: 34.97,
    tax: 2.80,
    tip: 5.25,
    total: 43.02,
    status: 'in_progress',
    priority: 'high',
    orderType: 'dine_in',
    notes: 'No onions on the burger',
    createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    updatedAt: new Date().toISOString(),
    estimatedTime: 15
  },
  {
    id: 1235,
    customerId: 'cust_002',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '+1 (555) 987-6543',
    tableNumber: 8,
    items: [
      { id: 3, name: 'Margherita Pizza', quantity: 1, price: 14.99, total: 14.99 }
    ],
    subtotal: 14.99,
    tax: 1.20,
    tip: 2.25,
    total: 18.44,
    status: 'completed',
    priority: 'medium',
    orderType: 'dine_in',
    notes: '',
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    updatedAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
    estimatedTime: 20
  }
]

// Get all orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let filteredOrders = orders

    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status)
    }

    // Sort by creation date (newest first)
    filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Apply limit
    filteredOrders = filteredOrders.slice(0, limit)

    return NextResponse.json({ 
      orders: filteredOrders,
      total: orders.length
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// Create new order
export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    
    const newOrder = {
      id: Math.floor(Math.random() * 9000) + 1000, // Generate random 4-digit ID
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    orders.push(newOrder)

    return NextResponse.json({ 
      order: newOrder,
      message: 'Order created successfully'
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

// Update order
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json()
    
    const orderIndex = orders.findIndex(order => order.id === id)
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    orders[orderIndex] = { 
      ...orders[orderIndex], 
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({ 
      order: orders[orderIndex],
      message: 'Order updated successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}