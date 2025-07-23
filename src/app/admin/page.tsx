'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users,
  Settings,
  BarChart3,
  Shield,
  CreditCard,
  Database,
  Activity,
  Loader2,
  LogOut,
  LayoutGrid,
  PlusCircle,
  Store,
  Calendar,
  MapPin,
  Info,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getCurrentUserWithRole, signOut, type User } from '@/lib/auth'

// Define restaurant type
type Restaurant = {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'pending' | 'inactive';
  onboardedDate: string;
  owner: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out failed:', error)
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

  // Don't render the dashboard if user is not authenticated
  if (!user) {
    return null
  }
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Monthly Revenue',
      value: '$45,231',
      change: '+8%',
      icon: CreditCard,
      color: 'text-green-600'
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: 'Stable',
      icon: Activity,
      color: 'text-emerald-600'
    },
    {
      title: 'Active Sessions',
      value: '1,234',
      change: '+5%',
      icon: Shield,
      color: 'text-purple-600'
    }
  ]

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      icon: Users,
      href: '#'
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences',
      icon: Settings,
      href: '#'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics and reports',
      icon: BarChart3,
      href: '#'
    },
    {
      title: 'Security',
      description: 'Manage security settings and audit logs',
      icon: Shield,
      href: '#'
    },
    {
      title: 'Billing',
      description: 'Manage subscriptions and billing information',
      icon: CreditCard,
      href: '#'
    },
    {
      title: 'Database',
      description: 'Database management and backups',
      icon: Database,
      href: '#'
    }
  ]

  // This will be populated when restaurants are onboarded
  // Using a static empty array for now
  const restaurants: Restaurant[] = []

  // Sample restaurant data structure for future use
  // const sampleRestaurant = {
  //   id: '1',
  //   name: 'Sample Restaurant',
  //   location: 'New York, NY',
  //   status: 'active',
  //   onboardedDate: '2025-07-20',
  //   owner: 'John Doe'
  // }

  // Navigation items for the sidebar
  const navItems = [
    { name: 'Dashboard', icon: LayoutGrid, href: '/admin', active: true },
    { name: 'Add Restaurant', icon: PlusCircle, href: '/admin/add-restaurant' },
    { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { name: 'Settings', icon: Settings, href: '/admin/settings' },
  ]

  // Quick actions for the sidebar
  const sidebarQuickActions = [
    { name: 'New Restaurant', icon: PlusCircle, href: '/admin/add-restaurant' },
  ]

  return (
    <>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-card p-6 rounded-lg border"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-muted-foreground text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Restaurant Onboarding List */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Restaurant Onboarding</h2>
            <Button variant="outline" onClick={() => router.push('/admin/add-restaurant')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Restaurant
            </Button>
          </div>

          {restaurants.length > 0 ? (
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Restaurant Name</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Owner</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Onboarded Date</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {restaurants.map((restaurant) => (
                      <tr key={restaurant.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle font-medium">
                          <div className="flex items-center">
                            <Store className="h-4 w-4 mr-2 text-gray-500" />
                            {restaurant.name}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            {restaurant.location}
                          </div>
                        </td>
                        <td className="p-4 align-middle">{restaurant.owner}</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            {restaurant.onboardedDate}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${restaurant.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : restaurant.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                            {restaurant.status}
                          </span>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border shadow-sm p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Info className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No restaurants onboarded yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Restaurants will appear here once they are onboarded through the Add Restaurant page.
              </p>
              <Button onClick={() => router.push('/admin/add-restaurant')}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Your First Restaurant
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}