'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home,
  ShoppingBag,
  Utensils,
  MessageSquare,
  HelpCircle,
  CreditCard,
  Menu
} from 'lucide-react'
import { RestaurantProtectedRoute } from '@/components/auth/RestaurantProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RestaurantProtectedRoute>
      <RestaurantLayoutContent>
        {children}
      </RestaurantLayoutContent>
    </RestaurantProtectedRoute>
  )
}

function RestaurantLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full transition-all duration-300 bg-white shadow-lg border-r flex flex-col ${collapsed ? 'w-16' : 'w-56'} rounded-r-3xl ml-0 z-40`}>
        <div className="p-4 border-b flex items-center gap-2">
          <button
            className="p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
            type="button"
          >
            <Menu className="w-6 h-6 text-gray-500" />
          </button>
          {!collapsed && (
            <>
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center ml-2">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="font-bold text-green-600 text-lg">ServeNow</span>
            </>
          )}
        </div>
        {/* User Profile */}
        <div className={`p-4 border-b flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            <span className="text-xs text-gray-600">RM</span>
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium">{user?.name || 'Restaurant Owner'}</p>
              <p className="text-xs text-gray-500">Restaurant</p>
            </div>
          )}

        </div>
        {/* Navigation */}
        <nav className="flex-1 py-4">
          <div className="space-y-1 px-2">
            <Link 
              href="/restaurant" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/restaurant' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Home className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Dashboard</span>}
            </Link>

            <Link 
              href="/restaurant/orders" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/restaurant/orders' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ShoppingBag className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Orders</span>}
            </Link>
            <Link 
              href="/restaurant/menu" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/restaurant/menu' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Utensils className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Food Menu</span>}
            </Link>
            <Link 
              href="/restaurant/payments" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/restaurant/payments' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <CreditCard className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Payments</span>}
            </Link>

            <Link 
              href="/restaurant/dish" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/restaurant/dish' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Utensils className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Dish</span>}
            </Link>
            <Link 
              href="/restaurant/feedback" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/restaurant/feedback' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <MessageSquare className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Feedback</span>}
            </Link>

          </div>
          <div className={`mt-6 px-4 ${collapsed ? 'hidden' : ''}`}>
            <p className="text-xs font-medium text-gray-500 mb-2">Others</p>
            <div className="space-y-1">
              <Link 
                href="/restaurant/support" 
                className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/restaurant/support' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <HelpCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Support</span>
              </Link>

              <button 
                onClick={signOut}
                className="flex items-center gap-3 px-2 py-2 rounded-xl text-red-600 hover:bg-red-50 transition cursor-pointer w-full text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </aside>
      {/* Main Content */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-56'}`}>
        {/* Page Content */}
        <section className="flex-1 p-4">
          {children}
        </section>
      </main>
    </div>
  )
}