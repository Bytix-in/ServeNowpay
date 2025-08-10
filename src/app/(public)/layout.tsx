'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Comfortaa } from 'next/font/google'
import Footer from '@/components/Footer'

const comfortaa = Comfortaa({ subsets: ['latin'] })

export default function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50)
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (mobileMenuOpen && !target.closest('header')) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [mobileMenuOpen])

  // Helper function to check if path is active (only after mounting)
  const isActivePath = (path: string) => {
    return mounted && pathname === path
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${comfortaa.className}`}>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div 
          className={`mx-auto transition-all duration-300 ease-out ${
            scrolled 
              ? 'mt-4 max-w-5xl bg-black/90 backdrop-blur-xl rounded-full shadow-2xl border border-white/20' 
              : 'max-w-full bg-black/85 backdrop-blur-md border-b border-white/10'
          }`}
        >
          <div className={`px-4 sm:px-6 transition-all duration-300 ease-out ${scrolled ? 'py-3' : 'py-4'}`}>
            <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {/* Logo */}
              <div className="flex items-center space-x-2.5 order-1">
                <img 
                  src="/servenow-white.svg" 
                  alt="ServeNow Logo" 
                  className={`transition-all duration-300 ease-out ${
                    scrolled ? 'w-8 h-8' : 'w-9 h-9'
                  }`}
                />
                <span className={`font-black text-white tracking-tight transition-all duration-300 ease-out ${
                  scrolled ? 'text-2xl' : 'text-3xl'
                }`}>ServeNow</span>
              </div>

              {/* Access Portal Button - Positioned early for mobile */}
              <div className="order-2 sm:order-4">
                <Link 
                  href="/access" 
                  className={`bg-white text-black font-medium hover:bg-gray-100 transition-all duration-200 ease-out whitespace-nowrap ${
                    scrolled ? 'px-3 py-1.5 rounded-full text-xs sm:px-4 sm:py-2 sm:text-sm' : 'px-4 py-2 rounded-lg text-xs sm:px-5 sm:py-2.5 sm:text-sm'
                  }`}
                >
                  Access Portal
                </Link>
              </div>

              {/* Navigation Links - Always visible, wrapping on small screens */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 order-3 w-full sm:w-auto">
                <Link 
                  href="/" 
                  className={`font-semibold transition-all duration-200 ease-out tracking-tight whitespace-nowrap ${
                    scrolled ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                  } ${
                    pathname === '/' 
                      ? 'text-white font-bold border-b-2 border-white pb-1' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  href="/features" 
                  className={`font-semibold transition-all duration-200 ease-out tracking-tight whitespace-nowrap ${
                    scrolled ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                  } ${
                    pathname === '/features' 
                      ? 'text-white font-bold border-b-2 border-white pb-1' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Features
                </Link>
                <Link 
                  href="/pricing" 
                  className={`font-semibold transition-all duration-200 ease-out tracking-tight whitespace-nowrap ${
                    scrolled ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                  } ${
                    pathname === '/pricing' 
                      ? 'text-white font-bold border-b-2 border-white pb-1' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Pricing
                </Link>
                <Link 
                  href="/docs" 
                  className={`font-semibold transition-all duration-200 ease-out tracking-tight whitespace-nowrap ${
                    scrolled ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                  } ${
                    pathname === '/docs' 
                      ? 'text-white font-bold border-b-2 border-white pb-1' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Docs
                </Link>
                <Link 
                  href="/contact" 
                  className={`font-semibold transition-all duration-200 ease-out tracking-tight whitespace-nowrap ${
                    scrolled ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                  } ${
                    pathname === '/contact' 
                      ? 'text-white font-bold border-b-2 border-white pb-1' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Contact
                </Link>
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 z-50 transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}>
          <div className="pt-16 pb-6 px-6">
            {/* Close button in dropdown */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-gray-300 transition-colors duration-200 p-2"
                aria-label="Close mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className={`font-semibold text-base transition-colors duration-200 py-2 ${
                  isActivePath('/') 
                    ? 'text-white font-bold border-l-4 border-white pl-4' 
                    : 'text-gray-300 hover:text-white pl-4'
                }`}
              >
                Home
              </Link>
              <Link 
                href="/features" 
                onClick={() => setMobileMenuOpen(false)}
                className={`font-semibold text-base transition-colors duration-200 py-2 ${
                  isActivePath('/features') 
                    ? 'text-white font-bold border-l-4 border-white pl-4' 
                    : 'text-gray-300 hover:text-white pl-4'
                }`}
              >
                Features
              </Link>
              <Link 
                href="/pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className={`font-semibold text-base transition-colors duration-200 py-2 ${
                  isActivePath('/pricing') 
                    ? 'text-white font-bold border-l-4 border-white pl-4' 
                    : 'text-gray-300 hover:text-white pl-4'
                }`}
              >
                Pricing
              </Link>
              <Link 
                href="/docs" 
                onClick={() => setMobileMenuOpen(false)}
                className={`font-semibold text-base transition-colors duration-200 py-2 ${
                  isActivePath('/docs') 
                    ? 'text-white font-bold border-l-4 border-white pl-4' 
                    : 'text-gray-300 hover:text-white pl-4'
                }`}
              >
                Docs
              </Link>
              <Link 
                href="/contact" 
                onClick={() => setMobileMenuOpen(false)}
                className={`font-semibold text-base transition-colors duration-200 py-2 ${
                  isActivePath('/contact') 
                    ? 'text-white font-bold border-l-4 border-white pl-4' 
                    : 'text-gray-300 hover:text-white pl-4'
                }`}
              >
                Contact
              </Link>
              <div className="pt-4 border-t border-white/20">
                <Link 
                  href="/access" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-white text-black font-medium hover:bg-gray-100 transition-all duration-200 px-6 py-3 rounded-lg text-sm inline-block"
                >
                  Access Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main>{children}</main>
      
      <Footer />
    </div>
  )
}