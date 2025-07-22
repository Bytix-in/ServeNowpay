'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Trash2, Clock, IndianRupee, ExternalLink, QrCode, Download } from 'lucide-react'
import QRCodeComponent from 'react-qr-code'
import { menuItemSchema, type MenuItemFormValues } from '@/schemas/menu'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { useRestaurant } from '@/hooks/useRestaurant'
import { useMenuItems } from '@/hooks/useMenuItems'

export default function MenuManagementPage() {
  const [showQRCode, setShowQRCode] = useState(false)
  
  // Use the custom hooks
  const { restaurant, loading: restaurantLoading, error: restaurantError } = useRestaurant()
  const { 
    menuItems, 
    loading: menuLoading, 
    addMenuItem, 
    deleteMenuItem 
  } = useMenuItems(restaurant?.id)
  
  // Get dynamic base URL
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}`
    }
    return 'http://localhost:3001' // fallback for SSR
  }
  
  const baseUrl = getBaseUrl()
  const menuUrl = restaurant ? `${baseUrl}/${restaurant.slug}/menu` : ''
  
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      price: 1,
      description: '',
      preparation_time: 1
    }
  })

  const onSubmit = async (data: MenuItemFormValues) => {
    if (!restaurant) {
      alert('Restaurant not found. Please try again.')
      return
    }

    try {
      const result = await addMenuItem(data)
      
      if (result) {
        reset()
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

  // QR Code handlers
  const handleGenerateQR = () => {
    setShowQRCode(true)
  }

  const handleDownloadQR = () => {
    if (!restaurant) return
    
    const svg = document.getElementById('menu-qr-code')
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        // Create download link
        const pngFile = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.download = `${restaurant.slug}-menu-qr.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
      
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Menu Management</h1>
      
      {/* Menu Sharing Section - Fixed at top */}
      {restaurant && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-6">Share Your Menu</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Public Menu URL Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Public Menu URL</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Share this link with your customers to view your menu:
                </p>
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors break-all"
                >
                  <span>{menuUrl}</span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
            </div>

            {/* Menu QR Code Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Menu QR Code</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  Generate a QR code for customers to quickly access your menu:
                </p>
                
                {!showQRCode ? (
                  <Button
                    onClick={handleGenerateQR}
                    className="inline-flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    Generate QR Code
                  </Button>
                ) : (
                  <div className="space-y-4">
                    {/* QR Code Display */}
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <QRCodeComponent
                          id="menu-qr-code"
                          value={menuUrl}
                          size={200}
                          level="H"
                        />
                      </div>
                    </div>
                    
                    {/* QR Code Info */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">
                        Scan this QR code to view the menu
                      </p>
                      <p className="text-xs text-gray-500 mb-4 break-all">
                        Links to: {menuUrl}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowQRCode(false)}
                        size="sm"
                      >
                        Hide QR Code
                      </Button>
                      
                      <Button
                        onClick={handleDownloadQR}
                        size="sm"
                        className="inline-flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download QR
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Add New Dish</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Dish Name */}
            <div>
              <Label htmlFor="name">Dish Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Butter Chicken"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="299.00"
                {...register('price')}
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your dish..."
                rows={3}
                {...register('description')}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Preparation Time */}
            <div>
              <Label htmlFor="preparation_time">Preparation Time (minutes)</Label>
              <Input
                id="preparation_time"
                type="number"
                placeholder="15"
                {...register('preparation_time')}
                className={errors.preparation_time ? 'border-red-500' : ''}
              />
              {errors.preparation_time && (
                <p className="text-red-500 text-sm mt-1">{errors.preparation_time.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding Dish...' : 'Add Dish'}
            </Button>
          </form>
        </div>
        
        {/* Dishes List Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Current Menu Items</h2>
          
          {menuItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No dishes added yet. Add your first dish!</p>
            </div>
          ) : (
            <>
              {/* Menu Items Counter */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  {menuItems.length} {menuItems.length === 1 ? 'dish' : 'dishes'} in your menu
                </p>
              </div>
              
              {/* Scrollable Menu Items Container */}
              <div className="max-h-96 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {menuItems.map((dish) => (
                  <div 
                    key={dish.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{dish.name}</h3>
                        
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
                        
                        <p className="text-gray-600 mt-2 text-sm">{dish.description}</p>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}