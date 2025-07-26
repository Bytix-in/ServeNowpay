'use client'

import { useState } from 'react'
import { Pencil, Trash2, Clock, IndianRupee, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { useRestaurant } from '@/hooks/useRestaurant'
import { useMenuItems } from '@/hooks/useMenuItems'

export default function DishManagementPage() {
  const [form, setForm] = useState({
    name: '',
    image: null as string | null,
    type: '',
    price: '',
    ingredients: '',
    prepTime: '',
    tags: ''
  })

  // Use the custom hooks
  const { restaurant, loading: restaurantLoading, error: restaurantError } = useRestaurant()
  const { 
    menuItems, 
    loading: menuLoading, 
    addMenuItem, 
    deleteMenuItem 
  } = useMenuItems(restaurant?.id)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (base64: string | null) => {
    setForm({ ...form, image: base64 })
  }

  const handleAddDish = async () => {
    if (!restaurant) {
      alert('Restaurant not found. Please try again.')
      return
    }

    if (!form.name || !form.type || !form.price || !form.prepTime) {
      alert('Please fill in all required fields.')
      return
    }

    try {
      const dishData = {
        name: form.name,
        price: parseFloat(form.price),
        description: form.ingredients || 'No description provided',
        preparation_time: parseInt(form.prepTime),
        image_url: form.image || undefined,
        dish_type: form.type || undefined,
        ingredients: form.ingredients || undefined,
        tags: form.tags || undefined
      }

      const result = await addMenuItem(dishData)
      
      if (result) {
        setForm({
          name: '',
          image: null,
          type: '',
          price: '',
          ingredients: '',
          prepTime: '',
          tags: ''
        })
        alert('Dish added successfully!')
      } else {
        alert('Failed to save dish. Please try again.')
      }
    } catch (error) {
      console.error('Error saving dish:', error)
      alert('Failed to save dish. Please try again.')
    }
  }

  const handleEdit = (dish: any) => {
    console.log('Edit dish:', dish)
    // TODO: Implement edit functionality
  }

  const handleDelete = async (dishId: string) => {
    if (!confirm('Are you sure you want to delete this dish?')) {
      return
    }

    try {
      const success = await deleteMenuItem(dishId)
      
      if (success) {
        alert('Dish deleted successfully!')
      } else {
        alert('Failed to delete dish. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting dish:', error)
      alert('Failed to delete dish. Please try again.')
    }
  }

  // Loading state
  if (restaurantLoading || menuLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (restaurantError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{restaurantError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <Utensils className="w-7 h-7 text-gray-700" />
          <h1 className="text-2xl font-bold">Dish Management</h1>
        </div>
        <p className="text-gray-500 mb-8">Add and manage your restaurant's menu items</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add New Dish Form */}
          <div className="bg-white rounded-xl shadow p-8 border">
            <h2 className="text-lg font-semibold mb-6">Add New Dish</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Dish Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter dish name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Dish Image (optional)</label>
              <ImageUpload
                value={form.image}
                onChange={handleImageChange}
                placeholder="Click to upload dish image"
                className="w-full"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Dish Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select dish type</option>
                <option value="Starter">Starter</option>
                <option value="Main Course">Main Course</option>
                <option value="Dessert">Dessert</option>
                <option value="Beverage">Beverage</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                type="number"
                min="0"
                step="0.01"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="0.00"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Ingredients (optional)</label>
              <input
                name="ingredients"
                value={form.ingredients}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="List ingredients"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Prep Time (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                name="prepTime"
                value={form.prepTime}
                onChange={handleChange}
                type="number"
                min="0"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="0"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Tags (optional)</label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Special Today, Most Ordered"
              />
              <p className="text-xs text-gray-400 mt-1">Separate multiple tags with commas</p>
            </div>
            
            <button
              onClick={handleAddDish}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition font-semibold text-lg flex items-center justify-center gap-2"
              type="button"
            >
              + Add Dish
            </button>
          </div>
          
          {/* Menu Items Section */}
          <div className="bg-white rounded-xl shadow p-8 border">
            <h2 className="text-lg font-semibold mb-6">Menu Items ({menuItems.length})</h2>
            
            {menuItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Utensils className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-gray-400 text-lg mb-2">No dishes added yet</p>
                <p className="text-gray-400 mb-2">Add your first menu item to get started</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {menuItems.map((dish) => (
                  <div 
                    key={dish.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex gap-4">
                      {/* Dish Image */}
                      {(dish.image_url || dish.image_data) && (
                        <div className="flex-shrink-0">
                          <img
                            src={dish.image_url || dish.image_data || ''}
                            alt={dish.name}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                      
                      {/* Dish Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{dish.name}</h3>
                          {dish.dish_type && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {dish.dish_type}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center text-green-600 font-medium">
                            <IndianRupee className="w-4 h-4" />
                            <span>{dish.price.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-500 text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{dish.preparation_time} min</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mt-2 text-sm">
                          {dish.ingredients || dish.description}
                        </p>
                        
                        {dish.tags && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {dish.tags.split(',').map((tag: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(dish)}
                          className="p-2"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(dish.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 