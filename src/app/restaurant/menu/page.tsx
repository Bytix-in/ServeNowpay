'use client'

import { useState, useEffect } from 'react'
import { Clock, IndianRupee, ExternalLink, QrCode, Download, Utensils } from 'lucide-react'
import QRCodeComponent from 'react-qr-code'
import { Button } from '@/components/ui/Button'
import { useRestaurant } from '@/hooks/useRestaurant'
import { useMenuItems } from '@/hooks/useMenuItems'


export default function MenuDisplayPage() {
  const [showQRCode, setShowQRCode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Use the custom hooks
  const { restaurant, loading: restaurantLoading, error: restaurantError } = useRestaurant()
  const { 
    menuItems, 
    loading: menuLoading,
    error: menuError
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

  // Loading state with timeout
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
    const isAuthError = restaurantError?.includes('logged in') || restaurantError?.includes('session')
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            {isAuthError ? 'Authentication Required' : 'Error'}
          </h1>
          <p className="text-gray-600">{restaurantError || menuError}</p>
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
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Food Menu</h1>
      
      {/* Menu Sharing Section - Fixed at top */}
      {restaurant && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Share Your Menu</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Public Menu URL Section */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Public Menu URL</h3>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Share this link with your customers to view your menu:
                </p>
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors break-all text-sm"
                >
                  <span className="break-all">{menuUrl}</span>
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                </a>
              </div>
            </div>

            {/* Menu QR Code Section */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Menu QR Code</h3>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  Generate a QR code for customers to quickly access your menu:
                </p>
                
                {!showQRCode ? (
                  <Button
                    onClick={handleGenerateQR}
                    className="inline-flex items-center gap-2 text-sm"
                  >
                    <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                    Generate QR Code
                  </Button>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {/* QR Code Display */}
                    <div className="flex justify-center">
                      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
                        <QRCodeComponent
                          id="menu-qr-code"
                          value={menuUrl}
                          size={mounted && window.innerWidth < 640 ? 150 : 200}
                          level="H"
                        />
                      </div>
                    </div>
                    
                    {/* QR Code Info */}
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                        Scan this QR code to view the menu
                      </p>
                      <p className="text-xs text-gray-500 mb-3 sm:mb-4 break-all">
                        Links to: {menuUrl}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowQRCode(false)}
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        Hide QR Code
                      </Button>
                      
                      <Button
                        onClick={handleDownloadQR}
                        size="sm"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
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
      


      {/* Menu Display Section */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold">Current Menu Items</h2>
          <div className="text-xs sm:text-sm text-gray-600">
            {menuItems.length} {menuItems.length === 1 ? 'dish' : 'dishes'} in your menu
          </div>
        </div>
        
        {menuItems.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Utensils className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-500 text-base sm:text-lg mb-2">No dishes in your menu yet</p>
            <p className="text-gray-400 text-sm sm:text-base mb-4">Add dishes using the "Dish" section to build your menu</p>
            <Button 
              onClick={() => window.location.href = '/restaurant/dish'}
              className="inline-flex items-center gap-2 text-sm"
            >
              <Utensils className="w-3 h-3 sm:w-4 sm:h-4" />
              Go to Dish Management
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {menuItems.map((dish) => (
                <div 
                  key={dish.id} 
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex flex-col h-full">
                    {/* Dish Image */}
                    {(dish.image_url || dish.image_data) ? (
                      <div className="w-full h-36 sm:h-48 overflow-hidden">
                        <img
                          src={dish.image_url || dish.image_data || ''}
                          alt={dish.name}
                          className="w-full h-full object-cover"

                        />
                      </div>
                    ) : (
                      <div className="w-full h-36 sm:h-48 bg-gray-100 flex items-center justify-center relative">
                        <Utensils className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300" />
                        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
                          No image
                        </div>
                      </div>
                    )}
                    
                    {/* Dish Info */}
                    <div className="p-4 sm:p-6 flex flex-col flex-grow">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{dish.name}</h3>
                        {dish.dish_type && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full self-start sm:self-center">
                            {dish.dish_type}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                        <div className="flex items-center text-green-600 font-medium">
                          <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-sm sm:text-base">{dish.price.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span>{dish.preparation_time} min</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-xs sm:text-sm flex-grow mb-3">
                        {dish.ingredients || dish.description}
                      </p>
                      
                      {dish.tags && (
                        <div className="flex flex-wrap gap-1">
                          {dish.tags.split(',').map((tag: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}