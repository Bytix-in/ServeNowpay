import { NextRequest, NextResponse } from 'next/server'

// Mock menu data
let menuItems = [
  {
    id: 1,
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, and our special sauce',
    price: 12.99,
    category: 'Main Course',
    image: '/images/burger.jpg',
    available: true,
    ingredients: ['beef patty', 'lettuce', 'tomato', 'special sauce', 'bun'],
    allergens: ['gluten', 'dairy'],
    calories: 650
  },
  {
    id: 2,
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with parmesan cheese and croutons',
    price: 8.99,
    category: 'Salads',
    image: '/images/caesar-salad.jpg',
    available: true,
    ingredients: ['romaine lettuce', 'parmesan cheese', 'croutons', 'caesar dressing'],
    allergens: ['dairy', 'gluten'],
    calories: 320
  },
  {
    id: 3,
    name: 'Margherita Pizza',
    description: 'Traditional pizza with tomato sauce, mozzarella, and fresh basil',
    price: 14.99,
    category: 'Pizza',
    image: '/images/margherita-pizza.jpg',
    available: true,
    ingredients: ['pizza dough', 'tomato sauce', 'mozzarella', 'fresh basil'],
    allergens: ['gluten', 'dairy'],
    calories: 800
  },
  {
    id: 4,
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with chocolate frosting',
    price: 6.99,
    category: 'Desserts',
    image: '/images/chocolate-cake.jpg',
    available: true,
    ingredients: ['chocolate', 'flour', 'eggs', 'butter', 'sugar'],
    allergens: ['gluten', 'dairy', 'eggs'],
    calories: 450
  }
]

// Get all menu items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const available = searchParams.get('available')

    let filteredItems = menuItems

    if (category) {
      filteredItems = filteredItems.filter(item => 
        item.category.toLowerCase() === category.toLowerCase()
      )
    }

    if (available === 'true') {
      filteredItems = filteredItems.filter(item => item.available)
    }

    return NextResponse.json({ menuItems: filteredItems })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    )
  }
}

// Create new menu item
export async function POST(request: NextRequest) {
  try {
    const newItem = await request.json()
    
    const menuItem = {
      id: menuItems.length + 1,
      ...newItem,
      available: true
    }

    menuItems.push(menuItem)

    return NextResponse.json({ 
      menuItem,
      message: 'Menu item created successfully'
    }, { status: 201 })
  } catch (error) {
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
    
    const itemIndex = menuItems.findIndex(item => item.id === id)
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      )
    }

    menuItems[itemIndex] = { ...menuItems[itemIndex], ...updates }

    return NextResponse.json({ 
      menuItem: menuItems[itemIndex],
      message: 'Menu item updated successfully'
    })
  } catch (error) {
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
    const id = parseInt(searchParams.get('id') || '0')

    const itemIndex = menuItems.findIndex(item => item.id === id)
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      )
    }

    menuItems.splice(itemIndex, 1)

    return NextResponse.json({ message: 'Menu item deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    )
  }
}