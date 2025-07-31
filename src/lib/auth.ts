import { supabase } from './supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'restaurant'
  avatar?: string
  restaurantId?: string
  restaurantSlug?: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// Supabase authentication functions
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('No user returned from authentication')
    }

    // Get user with role from metadata
    const userWithRole = await getUserWithRole(data.user)
    return userWithRole
  } catch (error) {
    throw error
  }
}

// Restaurant authentication function
export async function signInRestaurant(username: string, password: string): Promise<User> {
  try {
    const response = await fetch('/api/auth/restaurant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        action: 'login'
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Restaurant authentication failed')
    }

    return data.user
  } catch (error) {
    throw error
  }
}

// Get user with role from Supabase user metadata
export async function getUserWithRole(supabaseUser: SupabaseUser): Promise<User> {
  const role = supabaseUser.user_metadata?.role || 'restaurant'
  const name = supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User'
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name,
    role,
    avatar: supabaseUser.user_metadata?.avatar_url
  }
}

// Get current authenticated user with role
export async function getCurrentUserWithRole(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return await getUserWithRole(user)
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Sign out user from Supabase
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

export function hasRole(user: User | null, requiredRole: string): boolean {
  if (!user) return false
  
  const roleHierarchy = {
    restaurant: 1,
    admin: 2
  }
  
  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
  
  return userLevel >= requiredLevel
}

// Check if token is expired (1 day = 24 hours)
export async function isTokenExpired(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return true
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000) // Current time in seconds
    const expiresAt = session.expires_at || 0
    
    // Add buffer of 5 minutes (300 seconds) before actual expiration
    return now >= (expiresAt - 300)
  } catch (error) {
    console.error('Error checking token expiration:', error)
    return true
  }
}

// Check if session is older than 1 day
export async function isSessionExpired(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return true
    }

    // Check if session is older than 1 day (24 hours)
    const sessionCreated = new Date(session.user.created_at).getTime()
    const lastSignIn = session.user.last_sign_in_at ? new Date(session.user.last_sign_in_at).getTime() : sessionCreated
    const now = Date.now()
    const oneDayInMs = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    
    return (now - lastSignIn) > oneDayInMs
  } catch (error) {
    console.error('Error checking session expiration:', error)
    return true
  }
}

// Enhanced getCurrentUserWithRole with expiration check
export async function getCurrentUserWithRoleAndExpiration(): Promise<User | null> {
  try {
    // First get the current user
    const currentUser = await getCurrentUserWithRole()
    if (!currentUser) {
      return null
    }

    // Then check if session is expired (only for admin users)
    if (currentUser.role === 'admin') {
      const sessionExpired = await isSessionExpired()
      if (sessionExpired) {
        // Auto sign out if expired
        await signOut()
        return null
      }
    }

    return currentUser
  } catch (error) {
    console.error('Error getting current user with expiration check:', error)
    return null
  }
}

export function redirectByRole(user: User): string {
  switch (user.role) {
    case 'admin':
      return '/admin'
    case 'restaurant':
      return '/restaurant'
    default:
      return '/auth/login'
  }
}