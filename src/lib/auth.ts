import { supabase } from './supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

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

// Get user with role from Supabase user metadata
export async function getUserWithRole(supabaseUser: SupabaseUser): Promise<User> {
  const role = supabaseUser.user_metadata?.role || 'staff'
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