import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'staff'
  avatar?: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// Mock authentication functions for demo purposes
// In a real app, these would integrate with Supabase Auth

export async function signIn(email: string, password: string): Promise<User> {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, action: 'login' }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    const { user } = await response.json()
    
    // Store user in localStorage for demo purposes
    localStorage.setItem('user', JSON.stringify(user))
    
    return user
  } catch (error) {
    throw error
  }
}

export async function signUp(name: string, email: string, password: string): Promise<User> {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, action: 'register' }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Registration failed')
    }

    const { user } = await response.json()
    
    // Store user in localStorage for demo purposes
    localStorage.setItem('user', JSON.stringify(user))
    
    return user
  } catch (error) {
    throw error
  }
}

export async function signOut(): Promise<void> {
  try {
    await fetch('/api/auth', {
      method: 'DELETE',
    })
    
    // Remove user from localStorage
    localStorage.removeItem('user')
  } catch (error) {
    console.error('Sign out error:', error)
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export function hasRole(user: User | null, requiredRole: string): boolean {
  if (!user) return false
  
  const roleHierarchy = {
    staff: 1,
    manager: 2,
    admin: 3
  }
  
  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
  
  return userLevel >= requiredLevel
}

export function redirectByRole(user: User): string {
  switch (user.role) {
    case 'admin':
      return '/admin'
    case 'manager':
      return '/manager'
    case 'staff':
      return '/staff'
    default:
      return '/auth/login'
  }
}