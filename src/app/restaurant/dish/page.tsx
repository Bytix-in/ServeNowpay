'use client'

import { useState } from 'react'
import { Pencil, Trash2, Clock, IndianRupee, Utensils, Check, ChevronDown } from 'lucide-react'
import { Combobox } from '@headlessui/react'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { useRestaurant } from '@/hooks/useRestaurant'
import { useMenuItems } from '@/hooks/useMenuItems'

const dishTypes = [
  'Starter',
  'Main Course',
  'Biryani',
  'Bread',
  'Snacks',
  'Pizza',
  'Burger',
  'Wraps',
  'South Indian',
  'Chinese',
  'Grill',
  'Seafood',
  'Egg',
  'Salad',
  'Dessert',
  'Beverage',
  'Combo',
  'Breakfast',
  'Kids',
  'Healthy'
]

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
  
  const [query, setQuery] = useState('')
  const [editingDish, setEditingDish] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Use the custom hooks
  const { restaurant, loading: restaurantLoading, error: restaurantError } = useRestaurant()
  const { 
    menuItems, 
    loading: menuLoading, 
    error: menuError,
    addMenuItem, 
    updateMenuItem,
    deleteMenuItem 
  } = useMenuItems(restaurant?.id)

  const filteredDishTypes =
    query === ''
      ? dishTypes
      : dishTypes.filter((dishType) =>
          dishType
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleDishTypeChange = (value: string) => {
    setForm({ ...form, type: value })
    setQuery('') // Clear the search query when a selection is made
  }

  const handleImageChange = (base64: string | null) => {
    setForm({ ...form, image: base64 })
  }

  const resetForm = () => {
    setForm({
      name: '',
      image: null,
      type: '',
      price: '',
      ingredients: '',
      prepTime: '',
      tags: ''
    })
    setQuery('')
    setIsEditing(false)
    setEditingDish(null)
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

      const result = isEditing 
        ? await updateMenuItem(editingDish.id, dishData)
        : await addMenuItem(dishData)
      
      if (result) {
        resetForm()
        alert(isEditing ? 'Dish updated successfully!' : 'Dish added successfully!')
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'save'} dish. Please try again.`)
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'saving'} dish:`, error)
      alert(`Failed to ${isEditing ? 'update' : 'save'} dish. Please try again.`)
    }
  }

  const handleEdit = (dish: any) => {
    setEditingDish(dish)
    setIsEditing(true)
    setForm({
      name: dish.name,
      image: dish.image_url || dish.image_data || null,
      type: dish.dish_type || '',
      price: dish.price.toString(),
      ingredients: dish.ingredients || dish.description || '',
      prepTime: dish.preparation_time.toString(),
      tags: dish.tags || ''
    })
    setQuery('')
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    resetForm()
  }

  // Handle Enter key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Prevent form submission
      
      const form = e.currentTarget
      const formElements = Array.from(form.elements) as HTMLElement[]
      
      // Filter only input, textarea, and select elements that are visible and not disabled
      const focusableElements = formElements.filter(element => {
        return (
          (element.tagName === 'INPUT' || 
           element.tagName === 'TEXTAREA' || 
           element.tagName === 'SELECT') &&
          !element.hasAttribute('disabled') &&
          element.offsetParent !== null // Check if element is visible
        )
      })
      
      const currentIndex = focusableElements.indexOf(e.target as HTMLElement)
      
      if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
        // Move to next field
        const nextElement = focusableElements[currentIndex + 1] as HTMLInputElement
        nextElement.focus()
        
        // For number inputs, select all text for easy replacement
        if (nextElement.type === 'number' || nextElement.type === 'text') {
          nextElement.select()
        }
      } else if (currentIndex === focusableElements.length - 1) {
        // If on last field, submit the form
        handleAddDish()
      }
    }
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
  if (restaurantError || menuError) {
    const error = restaurantError || menuError
    const isAuthError = error?.includes('logged in') || error?.includes('session')
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            {isAuthError ? 'Authentication Required' : 'Error'}
          </h1>
          <p className="text-gray-600">{error}</p>
          <div className="mt-4 space-x-4">
            {isAuthError ? (
              <Button onClick={() => window.location.href = '/auth/restaurant-login'}>
                Go to Login
              </Button>
            ) : (
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            )}
          </div>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                {isEditing ? 'Edit Dish' : 'Add New Dish'}
              </h2>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="text-gray-600"
                >
                  Cancel Edit
                </Button>
              )}
            </div>
            
            <form onKeyDown={handleKeyDown} onSubmit={(e) => e.preventDefault()}>
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
                  autoComplete="off"
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
              <Combobox value={form.type} onChange={handleDishTypeChange}>
                <div className="relative">
                  <div className="relative w-full cursor-default overflow-hidden rounded border bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                    <Combobox.Input
                      className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 focus:outline-none"
                      displayValue={(dishType: string) => dishType}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search or select dish type..."
                      autoComplete="off"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && form.type) {
                          e.preventDefault()
                          // Find the next focusable element and focus it
                          const formElement = e.currentTarget.closest('form')
                          if (formElement) {
                            const formElements = Array.from(formElement.elements) as HTMLElement[]
                            const focusableElements = formElements.filter(element => {
                              return (
                                (element.tagName === 'INPUT' || 
                                 element.tagName === 'TEXTAREA' || 
                                 element.tagName === 'SELECT') &&
                                !element.hasAttribute('disabled') &&
                                element.offsetParent !== null
                              )
                            })
                            const currentIndex = focusableElements.findIndex(el => el.contains(e.currentTarget))
                            if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
                              const nextElement = focusableElements[currentIndex + 1] as HTMLInputElement
                              nextElement.focus()
                              if (nextElement.type === 'number' || nextElement.type === 'text') {
                                nextElement.select()
                              }
                            }
                          }
                        }
                      }}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronDown
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </Combobox.Button>
                  </div>
                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {filteredDishTypes.length === 0 && query !== '' ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        Nothing found.
                      </div>
                    ) : (
                      filteredDishTypes.map((dishType) => (
                        <Combobox.Option
                          key={dishType}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-black text-white' : 'text-gray-900'
                            }`
                          }
                          value={dishType}
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? 'font-medium' : 'font-normal'
                                }`}
                              >
                                {dishType}
                              </span>
                              {selected ? (
                                <span
                                  className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                    active ? 'text-white' : 'text-black'
                                  }`}
                                >
                                  <Check className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </div>
              </Combobox>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full border rounded px-3 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="0.00"
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Ingredients (optional)</label>
              <input
                name="ingredients"
                value={form.ingredients}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="List ingredients"
                autoComplete="off"
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
                autoComplete="off"
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
                autoComplete="off"
              />
              <p className="text-xs text-gray-400 mt-1">Separate multiple tags with commas</p>
            </div>
            
            <button
              onClick={handleAddDish}
              className={`w-full py-2 rounded transition font-semibold text-lg flex items-center justify-center gap-2 ${
                isEditing 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-black text-white hover:bg-gray-900'
              }`}
              type="submit"
            >
              {isEditing ? '✓ Update Dish' : '+ Add Dish'}
            </button>
            </form>
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