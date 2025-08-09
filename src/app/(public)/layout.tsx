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
                <div className={`bg-white rounded-lg flex items-center justify-center transition-all duration-300 ease-out ${
                  scrolled ? 'w-8 h-8' : 'w-9 h-9'
                }`}>
                  <svg className={`text-black transition-all duration-300 ease-out ${
                    scrolled ? 'w-4 h-4' : 'w-5 h-5'
                  }`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                </div>
                <span className={`font-black text-white tracking-tight transition-all duration-300 ease-out ${
                  scrolled ? 'text-lg' : 'text-xl'
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
      </header>
      
      <main>{children}</main>
      
      <Footer />
    </div>
  )
}