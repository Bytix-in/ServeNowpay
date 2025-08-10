'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Settings,
  BarChart3,
  LogOut,
  LayoutGrid,
  PlusCircle
} from 'lucide-react'
import { getCurrentUserWithRole, signOut, type User } from '@/lib/auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

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

  // Navigation items for the sidebar
  const navItems = [
    { name: 'Dashboard', icon: LayoutGrid, href: '/admin' },
    { name: 'Add Restaurant', icon: PlusCircle, href: '/admin/add-restaurant' },
    { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { name: 'Settings', icon: Settings, href: '/admin/settings' },
  ]

  // Quick actions for the sidebar
  const sidebarQuickActions = [
    { name: 'New Restaurant', icon: PlusCircle, href: '/admin/add-restaurant' },
  ]

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render the dashboard if user is not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col h-screen fixed">
        {/* Logo and title */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-5">
            <img 
              src="/servenow-white.svg" 
              alt="ServeNow Logo" 
              className="w-14 h-14"
            />
            <div>
              <h1 className="font-bold text-2xl text-gray-900">ServeNow Admin</h1>
              <p className="text-gray-600 text-base">Management Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-black text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
          <ul className="space-y-1">
            {sidebarQuickActions.map((action) => (
              <li key={action.name}>
                <Link
                  href={action.href}
                  className="flex items-center gap-3 p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <action.icon className="h-4 w-4" />
                  <span className="text-sm">{action.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 p-2 w-full text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  )
}