'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Settings,
  BarChart3,
  LogOut,
  LayoutGrid,
  PlusCircle,
  Menu,
  X
} from 'lucide-react'
import { getCurrentUserWithRole, signOut, type User } from '@/lib/auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-white border-r flex flex-col h-screen fixed z-50 transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Logo and title */}
        <div className="p-3 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-black rounded-md p-1.5 sm:p-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-sm"></div>
              </div>
              <div>
                <h1 className="font-bold text-base sm:text-lg">ServeNow Admin</h1>
                <p className="text-gray-500 text-xs sm:text-sm">Management Portal</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4">
          <ul className="space-y-1 sm:space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-md transition-colors text-sm sm:text-base ${
                      isActive 
                        ? 'bg-black text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Quick Actions */}
        <div className="p-3 sm:p-4 border-t">
          <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
          <ul className="space-y-1">
            {sidebarQuickActions.map((action) => (
              <li key={action.name}>
                <Link
                  href={action.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 sm:gap-3 p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <action.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">{action.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout */}
        <div className="p-3 sm:p-4 border-t">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 sm:gap-3 p-2 w-full text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b p-3 sm:p-4 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-black rounded-md p-1.5">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="font-bold text-base">ServeNow Admin</span>
          </div>
          <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}