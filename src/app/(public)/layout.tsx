import { ReactNode } from 'react'
import Link from 'next/link'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect grid-pattern-subtle border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                </svg>
              </div>
              <span className="text-xl font-black text-black tracking-tight">ServeNow</span>
            </div>

            {/* Navigation Links - Centered */}
            <div className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-12">
                <Link href="/" className="text-black font-black hover:text-gray-600 transition-colors tracking-tight">
                  Home
                </Link>
                <Link href="/features" className="text-gray-600 font-bold hover:text-black transition-colors">
                  Features
                </Link>
                <Link href="/pricing" className="text-gray-600 font-bold hover:text-black transition-colors">
                  Pricing
                </Link>
                <Link href="/contact" className="text-gray-600 font-bold hover:text-black transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            {/* Access Portal Button */}
            <div>
              <Link 
                href="/access" 
                className="bg-black text-white px-5 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                Access Portal
              </Link>
            </div>
          </nav>
        </div>
      </header>
      
      <main className="pt-20">{children}</main>
      
      <footer className="bg-white grid-pattern-subtle py-12">
        <div className="container mx-auto px-4">
          {/* Footer Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">S</span>
              </div>
              <span className="text-xl font-bold text-black">ServeNow</span>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="text-center text-gray-600">
            © 2025 ServeNow SaaS. All rights reserved. Transforming restaurants worldwide.
          </div>
        </div>
      </footer>
    </div>
  )
}