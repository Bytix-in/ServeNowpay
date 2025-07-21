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
  AlertTriangle,
  Loader2,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getCurrentUserWithRole, signOut, type User } from '@/lib/auth'

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

  const alerts = [
    {
      type: 'warning',
      message: 'Server maintenance scheduled for tonight at 2 AM EST',
      time: '2 hours ago'
    },
    {
      type: 'info',
      message: 'New feature deployment completed successfully',
      time: '4 hours ago'
    },
    {
      type: 'error',
      message: 'Failed login attempts detected from IP 192.168.1.100',
      time: '6 hours ago'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
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
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <motion.a
                  key={action.title}
                  href={action.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow block"
                >
                  <action.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-muted-foreground text-sm">{action.description}</p>
                </motion.a>
              ))}
            </div>
          </div>

          {/* System Alerts */}
          <div>
            <h2 className="text-xl font-semibold mb-6">System Alerts</h2>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-card p-4 rounded-lg border"
                >
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alert.type === 'error' ? 'text-red-500' :
                      alert.type === 'warning' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}