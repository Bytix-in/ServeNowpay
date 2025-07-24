'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChevronDown,
  Search,
  Bell,
  Settings,
  Home,
  ShoppingBag,
  Utensils,
  Bike,
  Store,
  FileText,
  MessageSquare,
  Megaphone,
  HelpCircle,
  CreditCard,
  Menu,
  Users // Add Users icon
} from 'lucide-react'

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className={`transition-all duration-300 bg-white shadow-lg border-r flex flex-col ${collapsed ? 'w-16' : 'w-56'} rounded-r-3xl m-4 ml-0`}>
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
              <p className="text-sm font-medium">Restaurant Manager</p>
              <p className="text-xs text-gray-500">Manager</p>
            </div>
          )}
          {!collapsed && <Settings className="w-4 h-4 text-gray-400" />}
        </div>
        {/* Navigation */}
        <nav className="flex-1 py-4">
          <div className="space-y-1 px-2">
            <Link 
              href="/manager" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/manager' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Home className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Dashboard</span>}
            </Link>
            <Link 
              href="/manager/table" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/manager/table' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Store className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Table Management</span>}
            </Link>
            <Link 
              href="/manager/orders" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/manager/orders' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ShoppingBag className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Orders</span>}
            </Link>
            <Link 
              href="/manager/menu" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/manager/menu' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Utensils className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Food Menu</span>}
            </Link>
            <Link 
              href="/manager/payments" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/manager/payments' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <CreditCard className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Payments</span>}
            </Link>
            <Link href="/manager/staff" className="flex items-center gap-3 px-2 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition cursor-pointer">
              <Users className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Staff</span>}
            </Link>
            <Link 
              href="/manager/dish" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/manager/dish' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Utensils className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Dish</span>}
            </Link>
            <Link 
              href="/manager/feedback" 
              className={`flex items-center gap-3 px-2 py-2 rounded-xl transition cursor-pointer ${pathname === '/manager/feedback' ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <MessageSquare className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Feedback</span>}
            </Link>
            <Link href="#" className="flex items-center gap-3 px-2 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition cursor-pointer">
              <MessageSquare className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Message</span>}
            </Link>
          </div>
          <div className={`mt-6 px-4 ${collapsed ? 'hidden' : ''}`}>
            <p className="text-xs font-medium text-gray-500 mb-2">Others</p>
            <div className="space-y-1">
              <Link href="#" className="flex items-center gap-3 px-2 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition cursor-pointer">
                <HelpCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Support</span>
              </Link>
              <Link href="#" className="flex items-center gap-3 px-2 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition cursor-pointer">
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">Settings</span>
              </Link>
            </div>
          </div>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col m-4 ml-0">
        {/* Header removed as requested */}
        {/* Page Content */}
        <section className="flex-1">
          {children}
        </section>
      </main>
    </div>
  )
}