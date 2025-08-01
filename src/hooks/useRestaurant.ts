import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Restaurant = {
  id: string
  name: string
  slug: string
  owner_id: string | null
  address?: string
  phone_number?: string
  email?: string
}

export function useRestaurant() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError('Request timeout - please try again')
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    async function fetchRestaurant() {
      try {
        setLoading(true)
        setError(null)
        
        // Get restaurant data from localStorage (set during restaurant login)
        const restaurantSession = localStorage.getItem('restaurant_session')
        
        if (!restaurantSession) {
          setError('No restaurant logged in')
          return
        }

        const session = JSON.parse(restaurantSession)
        
        if (!session.restaurantId) {
          setError('Invalid restaurant session')
          return
        }

        // Fetch restaurant data from database using the restaurant ID
        let { data, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id, name, slug, owner_id, address, phone_number, email')
          .eq('id', session.restaurantId)
          .single()

        // If restaurant not found with the stored ID, try to find by username as fallback
        if (restaurantError && session.username) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('restaurants')
            .select('id, name, slug, owner_id, address, phone_number, email')
            .eq('restaurant_username', session.username)
            .single()
          
          if (fallbackData && !fallbackError) {
            data = fallbackData
            restaurantError = null
            
            // Update localStorage with correct restaurant ID
            const updatedSession = { ...session, restaurantId: fallbackData.id }
            localStorage.setItem('restaurant_session', JSON.stringify(updatedSession))
          }
        }
        
        if (restaurantError) {
          throw new Error(restaurantError.message)
        }
        
        if (!data) {
          throw new Error('Restaurant not found')
        }
        
        setRestaurant(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
        clearTimeout(timeoutId)
      }
    }

    fetchRestaurant()

    return () => {
      clearTimeout(timeoutId)
    }
  }, [mounted])

  return { restaurant, loading, error }
}