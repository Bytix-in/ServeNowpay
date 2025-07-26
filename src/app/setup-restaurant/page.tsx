'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Store, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

const setupSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type SetupInput = z.infer<typeof setupSchema>

export default function SetupRestaurantPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loadingRestaurants, setLoadingRestaurants] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SetupInput>({
    resolver: zodResolver(setupSchema),
  })

  const loadRestaurants = async () => {
    setLoadingRestaurants(true)
    try {
      const response = await fetch('/api/test-db-connection')
      const data = await response.json()
      
      if (data.status === 'success') {
        setRestaurants(data.data.sampleRestaurants || [])
      } else {
        setResult({ success: false, error: data.message })
      }
    } catch (error) {
      setResult({ success: false, error: 'Failed to load restaurants' })
    } finally {
      setLoadingRestaurants(false)
    }
  }

  const onSubmit = async (data: SetupInput) => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/create-restaurant-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: data.restaurantId,
          username: data.username,
          password: data.password
        }),
      })

      const responseData = await response.json()

      if (response.ok) {
        setResult({ 
          success: true, 
          message: responseData.message,
          restaurant: responseData.restaurant
        })
        reset()
        // Reload restaurants to show updated status
        loadRestaurants()
      } else {
        setResult({ success: false, error: responseData.error })
      }
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Setup failed' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Restaurant Credential Setup
          </h1>
          <p className="text-gray-600">
            Set up login credentials for restaurants in the system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Setup Form */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Create Restaurant Credentials</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="restaurantId">Restaurant ID</Label>
                <Input
                  id="restaurantId"
                  {...register('restaurantId')}
                  placeholder="Enter restaurant ID from database"
                  className={errors.restaurantId ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.restaurantId && (
                  <p className="text-red-500 text-sm mt-1">{errors.restaurantId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...register('username')}
                  placeholder="Choose a unique username"
                  className={errors.username ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Enter secure password"
                  className={errors.password ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="Confirm password"
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Setup Restaurant Credentials'
                )}
              </Button>
            </form>

            {/* Result */}
            {result && (
              <div className={`mt-6 p-4 rounded-lg ${
                result.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.success ? 'Success!' : 'Error'}
                    </p>
                    <p className={`text-sm ${
                      result.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.message || result.error}
                    </p>
                    {result.restaurant && (
                      <div className="mt-2 text-sm text-green-700">
                        <p><strong>Restaurant:</strong> {result.restaurant.name}</p>
                        <p><strong>Username:</strong> {result.restaurant.username}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Restaurant List */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Available Restaurants</h2>
              <Button
                onClick={loadRestaurants}
                disabled={loadingRestaurants}
                variant="outline"
                size="sm"
              >
                {loadingRestaurants ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>

            <div className="space-y-3">
              {restaurants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Store className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No restaurants found</p>
                  <Button
                    onClick={loadRestaurants}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Load Restaurants
                  </Button>
                </div>
              ) : (
                restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ID: {restaurant.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          restaurant.hasCredentials
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {restaurant.hasCredentials ? 'Has Login' : 'No Login'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Status: {restaurant.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}