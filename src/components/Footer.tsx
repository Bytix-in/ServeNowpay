'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Twitter, Facebook, Instagram, Linkedin, Youtube, ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold">ServeNow</span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Transforming restaurants worldwide with cutting-edge technology. Streamline operations, boost efficiency, and delight customers.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">bytixcompany@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="w-4 h-4 text-green-400" />
                  <span className="text-sm">+91 82605 42544</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <span className="text-sm">Sijua, Bhubaneswar, Odisha 751019, India</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Quick Links</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/features" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <span>Features</span>
                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <span>Pricing</span>
                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <span>Contact</span>
                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </li>
                <li>
                  <Link href="/access" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <span>Access Portal</span>
                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Follow Us - Social Media Section */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Follow Us</h3>
              <p className="text-gray-300 mb-6">
                Stay connected and get the latest updates from ServeNow
              </p>
              
              {/* Social Media Links */}
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href="https://instagram.com/servenow" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200 group"
                >
                  <Instagram className="w-5 h-5 text-pink-400" />
                  <span className="text-sm text-gray-300 group-hover:text-white">Instagram</span>
                </a>
                
                <a 
                  href="https://x.com/servenow" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200 group"
                >
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-300 group-hover:text-white">X (Twitter)</span>
                </a>
                
                <a 
                  href="https://linkedin.com/company/servenow" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200 group"
                >
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-300 group-hover:text-white">LinkedIn</span>
                </a>
                
                <a 
                  href="https://youtube.com/@servenow" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200 group"
                >
                  <Youtube className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-300 group-hover:text-white">YouTube</span>
                </a>
                
                <a 
                  href="https://facebook.com/servenow" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200 group col-span-2"
                >
                  <Facebook className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-300 group-hover:text-white">Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              
              {/* Copyright */}
              <div className="text-gray-400 text-sm">
                © 2025 ServeNow SaaS. All rights reserved. Transforming restaurants worldwide.
              </div>

              {/* Legal Links */}
              <div className="flex items-center space-x-6 text-sm">
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link href="/refunds" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Refund Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}