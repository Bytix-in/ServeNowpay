import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Restaurant = {
  id: string
  name: string
  slug: string
  owner_id: string
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
        
        // First get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          // If no user is authenticated, fetch the demo restaurant from database
          console.log('No authenticated user, fetching demo restaurant')
          try {
            const { data: demoRestaurant, error: demoError } = await supabase
              .from('restaurants')
              .select('id, name, slug, owner_id')
              .eq('slug', 'mycafe')
              .single()
            
            if (demoError || !demoRestaurant) {
              throw new Error('Demo restaurant not found')
            }
            
            setRestaurant(demoRestaurant)
            return
          } catch (err) {
            console.error('Error fetching demo restaurant:', err)
            setError('Demo restaurant not available')
            return
          }
        }
        
        // Then fetch the restaurant owned by this user
        const { data, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id, name, slug, owner_id')
          .eq('owner_id', user.id)
          .maybeSingle()
        
        if (restaurantError) {
          console.error('Restaurant query error:', restaurantError)
          throw new Error(restaurantError.message)
        }
        
        if (!data) {
          // No restaurant found for this user, fetch the demo restaurant from database
          console.log('No restaurant found for user, fetching demo restaurant from database')
          try {
            const { data: demoRestaurant, error: demoError } = await supabase
              .from('restaurants')
              .select('id, name, slug, owner_id')
              .eq('slug', 'mycafe')
              .single()
            
            if (demoError || !demoRestaurant) {
              throw new Error('Demo restaurant not found')
            }
            
            setRestaurant(demoRestaurant)
            return
          } catch (err) {
            console.error('Error fetching demo restaurant:', err)
            setError('Demo restaurant not available')
            return
          }
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