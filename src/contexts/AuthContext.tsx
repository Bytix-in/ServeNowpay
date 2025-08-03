'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email?: string
  name?: string
  role: 'admin' | 'restaurant'
  restaurantId?: string
  restaurantSlug?: string
  restaurantName?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInRestaurant: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  isRestaurant: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      setLoading(true)
      
      // Check for restaurant session first
      const restaurantSession = localStorage.getItem('restaurant_session')
      if (restaurantSession) {
        const session = JSON.parse(restaurantSession)
        
        // Verify the session is still valid
        const { data: restaurant, error } = await supabase
          .from('restaurants')
          .select('id, name, slug, restaurant_username')
          .eq('id', session.restaurantId)
          .single()

        if (!error && restaurant) {
          setUser({
            id: restaurant.id,
            name: restaurant.name,
            role: 'restaurant',
            restaurantId: restaurant.id,
            restaurantSlug: restaurant.slug,
            restaurantName: restaurant.name
          })
          setLoading(false)
          return
        } else {
          // Invalid session, clear it
          localStorage.removeItem('restaurant_session')
        }
      }

      // Check for admin session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session check error:', error)
        setUser(null)
        setLoading(false)
        return
      }

      if (session?.user) {
        // This is an admin user
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email,
          role: 'admin'
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Session check error:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email,
          role: 'admin'
        })
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signInRestaurant = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, action: 'login' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      if (data.success && (data.restaurant || data.user)) {
        const restaurantData = data.restaurant || data.user
        const restaurantUser: User = {
          id: restaurantData.id,
          name: restaurantData.name,
          email: restaurantData.email,
          role: 'restaurant',
          restaurantId: restaurantData.restaurantId || restaurantData.id,
          restaurantSlug: restaurantData.restaurantSlug,
          restaurantName: restaurantData.name
        }

        // Store session in localStorage
        localStorage.setItem('restaurant_session', JSON.stringify({
          restaurantId: restaurantData.restaurantId || restaurantData.id,
          username: username,
          loginTime: new Date().toISOString()
        }))

        setUser(restaurantUser)
      }
    } catch (error) {
      console.error('Restaurant sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      // Clear restaurant session
      localStorage.removeItem('restaurant_session')
      
      // Sign out from Supabase (for admin users)
      await supabase.auth.signOut()
      
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signInRestaurant,
    signOut,
    isAuthenticated: !!user,
    isRestaurant: user?.role === 'restaurant',
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}