import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MenuItem, MenuItemFormValues } from '@/schemas/menu'

export function useMenuItems(restaurantId?: string) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!restaurantId) return

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
          console.error('Menu items query error:', menuError)
          throw new Error(menuError.message)
        }
        
        setMenuItems(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        console.error('Error fetching menu items:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [restaurantId])

  const addMenuItem = async (values: MenuItemFormValues) => {
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
        preparation_time: values.preparation_time
      }
      
      const { data, error: insertError } = await supabase
        .from('menu_items')
        .insert([insertData])
        .select('*')
      
      if (insertError) {
        console.error('Supabase error:', insertError)
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
      console.error('Error adding menu item:', err)
      setError(errorMessage)
      return null
    }
  }

  const updateMenuItem = async (id: string, values: Partial<MenuItemFormValues>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('menu_items')
        .update(values)
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
      console.error(err)
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
      console.error(err)
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