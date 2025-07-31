'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ChevronDown,
  Eye,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getCurrentUserWithRole, getCurrentUserWithRoleAndExpiration, signOut, type User } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import RestaurantDetailsModal from '@/components/admin/RestaurantDetailsModal'

// Define restaurant type
type Restaurant = {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Inactive';
  onboardedDate: string;
  owner: string;
  liveStatus: 'Live' | 'Not Live';
  webhook_configured?: boolean;
  webhook_url?: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [restaurantsLoading, setRestaurantsLoading] = useState(true)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [loggedInCount, setLoggedInCount] = useState(0)
  const [loggedInLoading, setLoggedInLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [activeRestaurantIds, setActiveRestaurantIds] = useState<Set<string>>(new Set())
  const [sessionExpired, setSessionExpired] = useState(false)
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(0)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use regular auth check first to avoid aggressive expiration on initial load
        const currentUser = await getCurrentUserWithRole()

        if (!currentUser || currentUser.role !== 'admin') {
          setSessionExpired(true)
          router.push('/auth/login')
          return
        }

        setUser(currentUser)
        setSessionExpired(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        setSessionExpired(true)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    const checkAuthWithExpiration = async () => {
      try {
        const currentUser = await getCurrentUserWithRoleAndExpiration()

        if (!currentUser || currentUser.role !== 'admin') {
          setSessionExpired(true)
          router.push('/auth/login')
          return
        }

        setUser(currentUser)
        setSessionExpired(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        setSessionExpired(true)
        router.push('/auth/login')
      }
    }

    // Initial check without aggressive expiration
    checkAuth()

    // Check with expiration every 5 minutes after initial load
    const authCheckInterval = setInterval(checkAuthWithExpiration, 5 * 60 * 1000)

    return () => clearInterval(authCheckInterval)
  }, [router])

  // Fetch restaurants from API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        // Get the current session token
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          console.error('No active session')
          setRestaurantsLoading(false)
          return
        }

        const response = await fetch('/api/admin/restaurants', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          const restaurantList = data.data || data.restaurants || []
          const formattedRestaurants = restaurantList.map((restaurant: any) => ({
            id: restaurant.id,
            name: restaurant.name,
            location: restaurant.address || 'No address provided',
            status: restaurant.status === 'active' ? 'Active' : 'Inactive',
            onboardedDate: new Date(restaurant.created_at).toLocaleDateString(),
            owner: restaurant.owner_name || 'Unknown',
            liveStatus: activeRestaurantIds.has(restaurant.id) ? 'Live' : 'Not Live'
          }))
          setRestaurants(formattedRestaurants)
        } else {
          console.error('Failed to fetch restaurants:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error)
      } finally {
        setRestaurantsLoading(false)
      }
    }

    if (user) {
      fetchRestaurants()
    }
  }, [user, activeRestaurantIds])

  // Fetch logged-in restaurants count
  useEffect(() => {
    const fetchLoggedInCount = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setLoggedInLoading(false)
          return
        }

        const response = await fetch('/api/admin/active-sessions', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setLoggedInCount(data.activeCount)
          setLastUpdated(data.lastUpdated)
          // Update active restaurant IDs
          const activeIds = new Set<string>(data.activeRestaurants.map((r: any) => r.id as string))
          setActiveRestaurantIds(activeIds)
        } else {
          console.error('Failed to fetch active sessions:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching active sessions:', error)
      } finally {
        setLoggedInLoading(false)
      }
    }

    // Always set up the interval, but the function will handle the user check
    if (user) {
      fetchLoggedInCount()
    }

    const interval = setInterval(() => {
      if (user) {
        fetchLoggedInCount()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [user])

  // Update restaurant live status when active restaurant IDs change
  useEffect(() => {
    setRestaurants(prev => prev.map(restaurant => ({
      ...restaurant,
      liveStatus: activeRestaurantIds.has(restaurant.id) ? 'Live' : 'Not Live'
    })))
  }, [activeRestaurantIds])

  // Handle view details
  const handleViewDetails = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId)
    setIsDetailsModalOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false)
    setSelectedRestaurantId(null)
  }

  const handleStatusUpdate = (id: string, status: 'active' | 'inactive') => {
    setRestaurants(prev => prev.map(restaurant =>
      restaurant.id === id
        ? { ...restaurant, status: status === 'active' ? 'Active' : 'Inactive' }
        : restaurant
    ))
  }

  const refreshLoggedInCount = async () => {
    setLoggedInLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/admin/active-sessions', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLoggedInCount(data.activeCount)
        setLastUpdated(data.lastUpdated)
        // Update active restaurant IDs
        const activeIds = new Set<string>(data.activeRestaurants.map((r: any) => r.id as string))
        setActiveRestaurantIds(activeIds)
      }
    } catch (error) {
      console.error('Error refreshing active sessions:', error)
    } finally {
      setLoggedInLoading(false)
    }
  }

  // Check session time remaining and show warning
  // Session monitoring with proper hooks management
  useEffect(() => {
    let sessionCheckInterval: NodeJS.Timeout | null = null

    const checkSessionTimeRemaining = async () => {
      try {
        if (!user) {
          setShowSessionWarning(false)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.last_sign_in_at) {
          setShowSessionWarning(false)
          return
        }

        const lastSignIn = new Date(session.user.last_sign_in_at).getTime()
        const now = Date.now()
        const oneDayInMs = 24 * 60 * 60 * 1000 // 24 hours
        const timeElapsed = now - lastSignIn
        const timeLeft = oneDayInMs - timeElapsed

        // Show warning if less than 1 hour left (3600000 ms)
        if (timeLeft > 0 && timeLeft < 3600000) {
          const minutesLeft = Math.max(1, Math.floor(timeLeft / 60000))
          setShowSessionWarning(true)
          setSessionTimeLeft(minutesLeft)
        } else {
          setShowSessionWarning(false)
          setSessionTimeLeft(0)
        }
      } catch (error) {
        console.error('Error checking session time:', error)
        setShowSessionWarning(false)
        setSessionTimeLeft(0)
      }
    }

    // Only start monitoring if user is authenticated
    if (user) {
      checkSessionTimeRemaining() // Initial check
      sessionCheckInterval = setInterval(checkSessionTimeRemaining, 60000) // Check every minute
    } else {
      setShowSessionWarning(false)
      setSessionTimeLeft(0)
    }

    // Cleanup function
    return () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval)
      }
    }
  }, [user]) // Only depend on user, not on other state variables

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {sessionExpired ? 'Session expired. Redirecting to login...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    )
  }

  // Don't render the dashboard if user is not authenticated
  if (!user) {
    return null
  }

  const handleExtendSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession()
      if (error) throw error

      setShowSessionWarning(false)
      setSessionTimeLeft(0)

      // Re-validate user after session refresh
      const currentUser = await getCurrentUserWithRole()
      if (currentUser && currentUser.role === 'admin') {
        setUser(currentUser)
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Error extending session:', error)
      router.push('/auth/login')
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error during logout:', error)
      router.push('/auth/login')
    }
  }



  // Calculate stats based on real data
  const totalRestaurants = restaurants.length
  const activeRestaurants = restaurants.filter(r => r.status === 'Active').length
  const inactiveRestaurants = restaurants.filter(r => r.status === 'Inactive').length

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Session Warning Banner */}
      {showSessionWarning && (
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-yellow-800">
                  Session Expiring Soon
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Your admin session will expire in <span className="font-medium">{sessionTimeLeft} minute{sessionTimeLeft !== 1 ? 's' : ''}</span>.
                  Extend your session to continue working.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleExtendSession}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium"
              >
                Extend Session
              </Button>
              <Button
                onClick={handleLogout}
                size="sm"
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's an overview of your restaurant management system.</p>
          </div>
          {user && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Logged in as</p>
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <Button
                onClick={handleLogout}
                size="sm"
                variant="ghost"
                className="text-xs text-gray-500 hover:text-gray-700 mt-1"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* System Overview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">System Overview</h2>
          </div>
          <div className="flex items-center space-x-3">
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
            <Button
              onClick={refreshLoggedInCount}
              disabled={loggedInLoading}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              {loggedInLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {restaurantsLoading ? '...' : totalRestaurants}
            </div>
            <div className="text-sm text-gray-500">Total Restaurants</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {restaurantsLoading ? '...' : activeRestaurants}
            </div>
            <div className="text-sm text-gray-500">Active Now</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {restaurantsLoading ? '...' : inactiveRestaurants}
            </div>
            <div className="text-sm text-gray-500">Inactive</div>
          </div>
          <div className="text-center relative">
            <div className="text-3xl font-bold text-blue-600 mb-1 flex items-center justify-center">
              {loggedInLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  {loggedInCount}
                  {loggedInCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </>
              )}
            </div>
            <div className="text-sm text-gray-500">Currently Logged In</div>
            {loggedInCount > 0 && (
              <div className="text-xs text-green-600 mt-1">● Active Sessions</div>
            )}
          </div>
        </div>
      </div>

      {/* All Restaurants */}
      <div className="bg-white rounded-lg border">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center mr-3">
              <div className="w-3 h-3 bg-white rounded"></div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">All Restaurants</h2>
          </div>
          <div className="bg-gray-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
            {restaurants.length}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <div className="divide-y">
            {restaurantsLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Loading restaurants...</p>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-gray-400 rounded"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants yet</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first restaurant to the platform.</p>
                <Button
                  onClick={() => router.push('/admin/add-restaurant')}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  Add Restaurant
                </Button>
              </div>
            ) : (
              restaurants.map((restaurant) => (
                <div key={restaurant.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
                        <div className="flex items-center">
                          {/* Live Status Indicator */}
                          <div className="flex items-center mr-2">
                            <div className={`w-2 h-2 rounded-full mr-1 ${restaurant.liveStatus === 'Live'
                              ? 'bg-green-500 animate-pulse'
                              : 'bg-gray-400'
                              }`}></div>
                            <span className={`text-xs font-medium ${restaurant.liveStatus === 'Live'
                              ? 'text-green-600'
                              : 'text-gray-500'
                              }`}>
                              {restaurant.liveStatus}
                            </span>
                          </div>

                          {/* Webhook Status Indicator */}
                          <div className="flex items-center mr-2">
                            <div className={`w-2 h-2 rounded-full mr-1 ${restaurant.webhook_configured
                              ? 'bg-blue-500'
                              : 'bg-orange-400'
                              }`}></div>
                            <span className={`text-xs font-medium ${restaurant.webhook_configured
                              ? 'text-blue-600'
                              : 'text-orange-600'
                              }`}>
                              {restaurant.webhook_configured ? 'Webhook' : 'No Webhook'}
                            </span>
                          </div>

                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-3 ${restaurant.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {restaurant.status}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => handleViewDetails(restaurant.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mb-1">
                        ID: {restaurant.id}
                      </div>
                      <div className="text-sm text-gray-500 mb-1">
                        {restaurant.location}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {restaurant.onboardedDate}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Restaurant Details Modal */}
      <RestaurantDetailsModal
        restaurantId={selectedRestaurantId}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  )
}