import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Login endpoint
export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json()

    if (action === 'login') {
      // Simulate authentication logic
      // In a real app, you'd verify credentials with Supabase Auth
      const mockUsers = [
        { email: 'admin@servenow.com', password: 'admin123', role: 'admin' }
      ]

      const user = mockUsers.find(u => u.email === email && u.password === password)
      
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // In a real app, you'd create a JWT token or session
      return NextResponse.json({
        user: {
          id: Math.random().toString(36).substr(2, 9),
          email: user.email,
          role: user.role,
          name: user.role.charAt(0).toUpperCase() + user.role.slice(1) + ' User'
        },
        token: 'mock-jwt-token'
      })
    }

    if (action === 'register') {
      const { name, email, password } = await request.json()
      
      // Simulate user registration
      // In a real app, you'd use Supabase Auth
      return NextResponse.json({
        user: {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name,
          role: 'restaurant' // Default role
        },
        message: 'User registered successfully'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Logout endpoint
export async function DELETE() {
  try {
    // In a real app, you'd invalidate the session/token
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}