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

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        setLoading(true)
        setError(null)
        
        // Get restaurant data from localStorage (set during restaurant login)
        const userData = localStorage.getItem('user')
        
        if (!userData) {
          setError('No restaurant logged in')
          return
        }

        const user = JSON.parse(userData)
        
        if (user.role !== 'restaurant' || !user.restaurantId) {
          setError('Invalid restaurant session')
          return
        }

        // Fetch restaurant data from database using the restaurant ID
        let { data, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id, name, slug, owner_id, address, phone_number, email')
          .eq('id', user.restaurantId)
          .single()

        // If restaurant not found with the stored ID, try to find by name/slug as fallback
        if (restaurantError && user.name) {
          console.log('Restaurant not found with stored ID, trying by name:', user.name)
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('restaurants')
            .select('id, name, slug, owner_id, address, phone_number, email')
            .eq('name', user.name)
            .single()
          
          if (fallbackData && !fallbackError) {
            data = fallbackData
            restaurantError = null
            
            // Update localStorage with correct restaurant ID
            const updatedUser = { ...user, restaurantId: fallbackData.id }
            localStorage.setItem('user', JSON.stringify(updatedUser))
            console.log('Updated localStorage with correct restaurant ID:', fallbackData.id)
          }
        }
        
        if (restaurantError) {
          console.error('Restaurant query error:', restaurantError)
          throw new Error(restaurantError.message)
        }
        
        if (!data) {
          throw new Error('Restaurant not found')
        }
        
        setRestaurant(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        console.error('Error fetching restaurant:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [])

  return { restaurant, loading, error }
}