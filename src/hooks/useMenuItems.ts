import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MenuItem, MenuItemFormValues } from '@/schemas/menu'

export function useMenuItems(restaurantId?: string) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false)
      return
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError('Request timeout - please try again')
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    async function fetchMenuItems() {
      try {
        setLoading(true)
        setError(null)
        
        const { data, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false })
        
        if (menuError) {
          throw new Error(menuError.message)
        }
        setMenuItems(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
        clearTimeout(timeoutId)
      }
    }

    fetchMenuItems()

    return () => {
      clearTimeout(timeoutId)
    }
  }, [restaurantId])

  const addMenuItem = async (values: MenuItemFormValues & { 
    image_url?: string | null, 
    dish_type?: string, 
    ingredients?: string, 
    tags?: string 
  }) => {
    if (!restaurantId) {
      setError('Restaurant ID is required')
      return null
    }

    try {
      const insertData = {
        restaurant_id: restaurantId,
        name: values.name,
        price: values.price,
        description: values.description,
        preparation_time: values.preparation_time,
        image_url: values.image_url || null,
        dish_type: values.dish_type || 'Main Course',
        ingredients: values.ingredients || '',
        tags: values.tags || ''
      }
      
      const { data, error: insertError } = await supabase
        .from('menu_items')
        .insert([insertData])
        .select('*')
      
      if (insertError) {
        throw new Error(insertError.message)
      }
      
      // Update the local state with the new menu item
      if (data && data.length > 0) {
        setMenuItems(prev => [data[0], ...prev])
        return data[0]
      }
      
      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      return null
    }
  }

  const updateMenuItem = async (id: string, values: MenuItemFormValues & { 
    image_url?: string | null, 
    dish_type?: string, 
    ingredients?: string, 
    tags?: string 
  }) => {
    try {
      const updateData = {
        name: values.name,
        price: values.price,
        description: values.description,
        preparation_time: values.preparation_time,
        image_url: values.image_url || null,
        dish_type: values.dish_type || 'Main Course',
        ingredients: values.ingredients || '',
        tags: values.tags || ''
      }
      
      const { data, error: updateError } = await supabase
        .from('menu_items')
        .update(updateData)
        .eq('id', id)
        .select()
      
      if (updateError) throw new Error(updateError.message)
      
      // Update the local state with the updated menu item
      if (data && data.length > 0) {
        setMenuItems(prev => 
          prev.map(item => item.id === id ? data[0] : item)
        )
        return data[0]
      }
      
      return null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      return null
    }
  }

  const deleteMenuItem = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw new Error(deleteError.message)
      
      // Update the local state by removing the deleted item
      setMenuItems(prev => prev.filter(item => item.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      return false
    }
  }

  return { 
    menuItems, 
    loading, 
    error, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem 
  }
}