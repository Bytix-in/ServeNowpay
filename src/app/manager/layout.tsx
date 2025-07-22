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
  CreditCard
} from 'lucide-react'

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-[175px] bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-green-600">ServeNow</span>
          </div>
        </div>
        
        {/* User Profile */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="text-xs text-gray-600">RM</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Restaurant Manager</p>
              <p className="text-xs text-gray-500">Manager</p>
            </div>
            <Settings className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-4">
          <div className="space-y-1 px-2">
            <Link 
              href="/manager" 
              className={`flex items-center gap-3 px-2 py-2 rounded-md ${
                pathname === '/manager' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            
            <div className="flex items-center justify-between gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" />
                <span className="text-sm font-medium">Orders</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </div>
            
            <Link 
              href="/manager/menu" 
              className={`flex items-center gap-3 px-2 py-2 rounded-md ${
                pathname === '/manager/menu' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Utensils className="w-5 h-5" />
              <span className="text-sm font-medium">Food Menu</span>
            </Link>
            
            <Link 
              href="/manager/payments" 
              className={`flex items-center gap-3 px-2 py-2 rounded-md ${
                pathname === '/manager/payments' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-sm font-medium">Payments</span>
            </Link>
            
            <Link href="#" className="flex items-center gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
              <Bike className="w-5 h-5" />
              <span className="text-sm font-medium">Riders</span>
            </Link>
            
            <div className="flex items-center justify-between gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5" />
                <span className="text-sm font-medium">Restaurant</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </div>
            
            <Link href="#" className="flex items-center gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">Report</span>
            </Link>
            
            <Link href="#" className="flex items-center gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">Message</span>
            </Link>
          </div>
          
          <div className="mt-6 px-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Others</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
                <div className="flex items-center gap-3">
                  <Megaphone className="w-5 h-5" />
                  <span className="text-sm font-medium">Marketing</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
              
              <Link href="#" className="flex items-center gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
                <HelpCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Support</span>
              </Link>
              
              <Link href="#" className="flex items-center gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">Settings</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white p-4 border-b flex items-center justify-between">
          <h1 className="text-xl font-medium">
            {pathname === '/manager' && 'Dashboard'}
            {pathname === '/manager/menu' && 'Menu Management'}
            {pathname === '/manager/payments' && 'Payment Settings'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search in here" 
                className="pl-9 pr-4 py-1.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 w-64"
              />
            </div>
            <button className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}