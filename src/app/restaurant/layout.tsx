'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { 
  ChevronDown,
  Search,
  Bell,
  Settings,
  Home,
  ShoppingBag,
  Utensils,
  Bike,
  FileText,
  Megaphone,
  HelpCircle,
  CreditCard,
  Menu,
  Users // Add Users icon
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
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false)
    await signOut()
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showLogoutModal) {
        handleLogoutCancel()
      }
    }

    if (showLogoutModal) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [showLogoutModal])
  
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full transition-all duration-300 bg-white shadow-lg border-r flex flex-col z-50 
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 
        ${collapsed ? 'lg:w-16' : 'lg:w-56'} 
        w-64 rounded-r-3xl ml-0`}>
        <div className="p-4 border-b flex items-center gap-2">
          <button
            className="p-1 rounded-full hover:bg-gray-100 transition cursor-pointer hidden lg:block"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
            type="button"
          >
            <Menu className="w-6 h-6 text-gray-500" />
          </button>
          <button
            className="p-1 rounded-full hover:bg-gray-100 transition cursor-pointer lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close mobile menu"
            type="button"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {(!collapsed || mobileMenuOpen) && (
            <>
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center ml-2">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="font-bold text-green-600 text-lg">ServeNow</span>
            </>
          )}
        </div>
        {/* User Profile */}
        <div className={`p-4 border-b flex items-center gap-2 ${collapsed && !mobileMenuOpen ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            <span className="text-xs text-gray-600">RM</span>
          </div>
          {(!collapsed || mobileMenuOpen) && (
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
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="w-5 h-5" />
              {(!collapsed || mobileMenuOpen) && <span className="text-sm font-medium">Dashboard</span>}
            </Link>

            <Link 
              href="/restaurant/orders" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/restaurant/orders' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingBag className="w-5 h-5" />
              {(!collapsed || mobileMenuOpen) && <span className="text-sm font-medium">Orders</span>}
            </Link>
            <Link 
              href="/restaurant/menu" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/restaurant/menu' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Utensils className="w-5 h-5" />
              {(!collapsed || mobileMenuOpen) && <span className="text-sm font-medium">Food Menu</span>}
            </Link>
            <Link 
              href="/restaurant/payments" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/restaurant/payments' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <CreditCard className="w-5 h-5" />
              {(!collapsed || mobileMenuOpen) && <span className="text-sm font-medium">Payments</span>}
            </Link>

            <Link 
              href="/restaurant/dish" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/restaurant/dish' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Utensils className="w-5 h-5" />
              {(!collapsed || mobileMenuOpen) && <span className="text-sm font-medium">Dish</span>}
            </Link>


          </div>
          <div className={`mt-6 px-4 ${collapsed && !mobileMenuOpen ? 'hidden' : ''}`}>
            <p className="text-xs font-medium text-gray-500 mb-2">Others</p>
            <div className="space-y-1">
              <Link href="#" className="flex items-center gap-3 px-2 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition cursor-pointer">
                <HelpCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Support</span>
              </Link>

              <button 
                onClick={handleLogoutClick}
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
      <main className={`flex-1 flex flex-col transition-all duration-300 lg:ml-0 ${collapsed ? 'lg:ml-16' : 'lg:ml-56'}`}>
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b p-4 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-green-600">ServeNow</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            <span className="text-xs text-gray-600">RM</span>
          </div>
        </div>

        {/* Page Content */}
        <section className="flex-1 p-2 sm:p-4">
          {children}
        </section>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleLogoutCancel}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
                  <p className="text-sm text-gray-500">You are about to sign out</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to logout? You will need to sign in again to access your restaurant dashboard.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={handleLogoutCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}