'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getCurrentUserWithRole, type User } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function AddRestaurant() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [credentials, setCredentials] = useState<any>(null)
  const router = useRouter()
  
  // Form state
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    phoneNumber: '',
    email: '',
    address: '',
    cuisineTags: '',
    seatingCapacity: ''
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUserWithRole()
        
        if (!currentUser || currentUser.role !== 'admin') {
          router.push('/auth/login')
          return
        }
        
        setUser(currentUser)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Validate required fields
      if (!formData.restaurantName || !formData.ownerName || !formData.phoneNumber || !formData.email || !formData.address) {
        alert('Please fill in all required fields')
        setIsSubmitting(false)
        return
      }

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session. Please login again.')
      }

      // Call API to create restaurant
      const response = await fetch('/api/admin/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create restaurant')
      }

      if (result.success && result.credentials) {
        setCredentials(result.credentials)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Error creating restaurant:', error)
      alert(error instanceof Error ? error.message : 'Failed to create restaurant')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render the page if user is not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center mb-4 sm:mb-6">
        <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900 mr-2" />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Restaurant</h1>
      </div>
      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Create a new restaurant and generate manager credentials</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Restaurant Details Form */}
        <div className="bg-white rounded-lg border p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Restaurant Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                id="restaurantName"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter restaurant name"
              />
            </div>

            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                Owner Name
              </label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter owner name"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter restaurant address"
              />
            </div>

            <div>
              <label htmlFor="cuisineTags" className="block text-sm font-medium text-gray-700 mb-1">
                Cuisine Tags (comma-separated)
              </label>
              <input
                type="text"
                id="cuisineTags"
                name="cuisineTags"
                value={formData.cuisineTags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Italian, Pizza, Fine Dining"
              />
            </div>

            <div>
              <label htmlFor="seatingCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                Seating Capacity
              </label>
              <input
                type="number"
                id="seatingCapacity"
                name="seatingCapacity"
                value={formData.seatingCapacity}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <Button 
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Restaurant...
                </>
              ) : (
                'Create Restaurant'
              )}
            </Button>
          </form>
        </div>

        {/* Generated Credentials */}
        <div className="bg-white rounded-lg border p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Generated Credentials</h2>
          
          {!credentials ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No credentials generated yet</p>
              <p className="text-sm text-gray-400">Fill out the form and click a restaurant to generate credentials</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-3">Restaurant Created Successfully!</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant ID</label>
                    <div className="bg-white border rounded px-3 py-2 text-sm font-mono">
                      {credentials.restaurantId}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manager Username</label>
                    <div className="bg-white border rounded px-3 py-2 text-sm font-mono">
                      {credentials.managerUsername}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manager Password</label>
                    <div className="bg-white border rounded px-3 py-2 text-sm font-mono">
                      {credentials.managerPassword}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Login URL</label>
                    <div className="bg-white border rounded px-3 py-2 text-sm text-blue-600">
                      {credentials.loginUrl}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm text-green-700">
                    Please save these credentials securely and share them with the restaurant manager.
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    const credentialsText = `
Restaurant ID: ${credentials.restaurantId}
Manager Username: ${credentials.managerUsername}
Manager Password: ${credentials.managerPassword}
Login URL: ${credentials.loginUrl}
                    `.trim()
                    navigator.clipboard.writeText(credentialsText)
                  }}
                >
                  Copy Credentials
                </Button>
                <Button 
                  className="flex-1 bg-black hover:bg-gray-800"
                  onClick={() => {
                    // Reset form and credentials for creating another restaurant
                    setCredentials(null)
                    setFormData({
                      restaurantName: '',
                      ownerName: '',
                      phoneNumber: '',
                      email: '',
                      address: '',
                      cuisineTags: '',
                      seatingCapacity: ''
                    })
                  }}
                >
                  Add Another Restaurant
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push('/admin')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}