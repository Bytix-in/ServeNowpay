'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RestaurantProtectedRouteProps {
  children: React.ReactNode
}

export function RestaurantProtectedRoute({ children }: RestaurantProtectedRouteProps) {
  const { user, loading, isRestaurant } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !isRestaurant)) {
      router.push('/auth/restaurant-login')
    }
  }, [user, loading, isRestaurant, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !isRestaurant) {
    return null
  }

  return <>{children}</>
}