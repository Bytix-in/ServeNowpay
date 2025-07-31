'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Store, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

const restaurantLoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type RestaurantLoginInput = z.infer<typeof restaurantLoginSchema>

export default function RestaurantLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { signInRestaurant, user, isRestaurant } = useAuth()

  // Redirect if already logged in as restaurant
  useEffect(() => {
    if (user && isRestaurant) {
      router.push('/restaurant')
    }
  }, [user, isRestaurant, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RestaurantLoginInput>({
    resolver: zodResolver(restaurantLoginSchema),
  })

  const onSubmit = async (data: RestaurantLoginInput) => {
    setIsLoading(true)
    setError(null)

    try {
      await signInRestaurant(data.username, data.password)
      
      // Redirect to restaurant dashboard
      router.push('/restaurant')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Restaurant Login
          </h2>
          <p className="text-gray-600">
            Access your restaurant dashboard with your credentials
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="username">Restaurant Username</Label>
              <Input
                id="username"
                type="text"
                {...register('username')}
                placeholder="Enter your restaurant username"
                className={errors.username ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Enter your password"
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In to Restaurant'
              )}
            </Button>
          </form>

          {/* Help Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have restaurant credentials?{' '}
              <Link href="/contact" className="text-black font-medium hover:underline">
                Contact Support
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link href="/access" className="text-black font-medium hover:underline">
                ← Back to Access Portal
              </Link>
            </p>
          </div>
        </div>

        {/* Help Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Need Help?</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>Contact your system administrator to get your restaurant login credentials.</p>
            <p className="text-xs text-gray-600 mt-2">
              Your username and password are provided when your restaurant is set up in the system.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}