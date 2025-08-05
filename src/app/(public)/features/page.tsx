'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Check, Menu, QrCode, BarChart3, Users, Shield, Clock, Smartphone, Cloud, Zap, Star, TrendingUp, RotateCcw } from 'lucide-react'
import HyperspeedEffect from '@/components/HyperspeedEffect'
import { hyperspeedPresets } from '@/components/hyperspeedPresets'

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Fixed Hyperspeed Background */}
      <div className="fixed inset-0 -top-20 z-0 h-screen w-screen">
        <HyperspeedEffect
          effectOptions={hyperspeedPresets.one}
          className="opacity-30"
        />
      </div>
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 pt-32 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg" style={{ fontSize: '3.75rem' }}>
            Powerful Features for Modern Restaurants
          </h1>
          
          <p className="text-xl text-gray-200 mb-8 leading-relaxed drop-shadow-md">
            Everything you need to run a successful restaurant, all in one comprehensive platform. Designed by restaurant experts, built for the future.
          </p>

          {/* Feature Count Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-8 border border-white/20">
            <Check className="w-4 h-4 mr-2" />
            50+ Features Included
          </div>
        </motion.div>
      </section>

      {/* Core Features Section - Bento Grid */}
      <section className="relative bg-black/20 backdrop-blur-md py-20 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Core Features</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive tools designed to streamline every aspect of your restaurant operations.
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-7xl mx-auto"
          >
            {/* Advanced Menu Management - Large Card */}
            <div className="md:col-span-2 lg:col-span-2 md:row-span-2 bg-black/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
              <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30 group-hover:bg-blue-500/30 transition-all duration-300">
                <Menu className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Advanced Menu Management</h3>
              <p className="text-sm text-gray-400 mb-4">Drag & drop interface</p>
              <p className="text-gray-300 leading-relaxed mb-6">
                Create, edit, and organize your restaurant menu with our intuitive interface. Real-time updates across all platforms.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-xs text-gray-400">
                  <Check className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                  Multi-language support
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <Check className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                  Seasonal scheduling
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <Check className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                  Bulk import/export
                </div>
              </div>
            </div>

            {/* Smart QR Code Ordering - Medium Card */}
            <div className="md:col-span-2 lg:col-span-2 bg-black/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
              <div className="w-12 h-12 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-green-500/30 group-hover:bg-green-500/30 transition-all duration-300">
                <QrCode className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Smart QR Ordering</h3>
              <p className="text-sm text-gray-400 mb-3">Contactless experience</p>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Generate custom QR codes for seamless contactless ordering with branded experience.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-2 rounded-lg border border-white/10 text-center">
                  <div className="text-xs text-gray-400">Instant QR</div>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/10 text-center">
                  <div className="text-xs text-gray-400">Table-specific</div>
                </div>
              </div>
            </div>

            {/* Comprehensive Analytics - Tall Card */}
            <div className="md:col-span-2 lg:col-span-2 md:row-span-3 bg-black/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
              <div className="w-14 h-14 bg-purple-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-purple-500/30 group-hover:bg-purple-500/30 transition-all duration-300">
                <BarChart3 className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">Analytics Dashboard</h3>
              <p className="text-sm text-gray-400 mb-6">Real-time insights</p>
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">Sales Tracking</span>
                    <span className="text-green-400 text-xs">+25%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">Popular Items</span>
                    <span className="text-blue-400 text-xs">Live</span>
                  </div>
                  <div className="text-xs text-gray-400">Customer behavior insights</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">Revenue Forecast</span>
                    <span className="text-purple-400 text-xs">AI</span>
                  </div>
                  <div className="text-xs text-gray-400">Predictive reporting</div>
                </div>
              </div>
            </div>

            {/* Enterprise Security - Small Card */}
            <div className="md:col-span-2 lg:col-span-1 bg-black/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
              <div className="w-10 h-10 bg-red-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 border border-red-500/30 group-hover:bg-red-500/30 transition-all duration-300">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Security</h3>
              <p className="text-xs text-gray-400 mb-3">Bank-level protection</p>
              <div className="space-y-2">
                <div className="text-xs text-gray-400">256-bit encryption</div>
                <div className="text-xs text-gray-400">GDPR compliant</div>
              </div>
            </div>

            {/* Real-time Order Management - Small Card */}
            <div className="md:col-span-2 lg:col-span-1 bg-black/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
              <div className="w-10 h-10 bg-yellow-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 border border-yellow-500/30 group-hover:bg-yellow-500/30 transition-all duration-300">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Real-time Orders</h3>
              <p className="text-xs text-gray-400 mb-3">Live tracking</p>
              <div className="space-y-2">
                <div className="text-xs text-gray-400">Push notifications</div>
                <div className="text-xs text-gray-400">Kitchen display</div>
              </div>
            </div>

            {/* User Management - Wide Card */}
            <div className="md:col-span-4 lg:col-span-4 bg-black/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="w-12 h-12 bg-orange-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-orange-500/30 group-hover:bg-orange-500/30 transition-all duration-300">
                    <Users className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">User Management System</h3>
                  <p className="text-sm text-gray-400">Role-based access control</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                    <div className="text-lg font-bold text-white">👨‍💼</div>
                    <p className="text-xs text-gray-400 mt-1">Manager</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                    <div className="text-lg font-bold text-white">👨‍🍳</div>
                    <p className="text-xs text-gray-400 mt-1">Chef</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                    <div className="text-lg font-bold text-white">🧑‍💼</div>
                    <p className="text-xs text-gray-400 mt-1">Staff</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-400">
                <div className="flex items-center">
                  <Check className="w-3 h-3 text-green-400 mr-2" />
                  Scheduling tools
                </div>
                <div className="flex items-center">
                  <Check className="w-3 h-3 text-green-400 mr-2" />
                  Performance tracking
                </div>
                <div className="flex items-center">
                  <Check className="w-3 h-3 text-green-400 mr-2" />
                  Training modules
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Additional Features Section - Bento Grid */}
      <section className="relative bg-black/20 backdrop-blur-md py-20 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Even more features to supercharge your restaurant operations and customer experience.
            </h2>
          </motion.div>

          {/* Bento Additional Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto"
          >
            {/* Mobile Optimized - Large Card */}
            <div className="md:col-span-2 lg:col-span-2 md:row-span-2 bg-black/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
              <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30 group-hover:bg-blue-500/30 transition-all duration-300">
                <Smartphone className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Mobile Optimized</h3>
              <p className="text-sm text-gray-400 mb-4">Perfect on all devices</p>
              <p className="text-gray-300 leading-relaxed mb-6">
                Responsive design that works flawlessly on smartphones, tablets, and desktops with touch-optimized interfaces.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <div className="text-lg">📱</div>
                  <p className="text-xs text-gray-400 mt-1">Phone</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <div className="text-lg">💻</div>
                  <p className="text-xs text-gray-400 mt-1">Desktop</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <div className="text-lg">📟</div>
                  <p className="text-xs text-gray-400 mt-1">Tablet</p>
                </div>
              </div>
            </div>

            {/* Cloud-Based Platform - Medium Card */}
            <div className="md:col-span-1 lg:col-span-1 bg-black/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
              <div className="w-12 h-12 bg-cyan-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-cyan-500/30 group-hover:bg-cyan-500/30 transition-all duration-300">
                <Cloud className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cloud Platform</h3>
              <p className="text-xs text-gray-400 mb-3">Access anywhere</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Automatic updates and backups with 99.9% uptime guarantee.
              </p>
            </div>

            {/* Lightning Fast Performance - Medium Card */}
            <div className="md:col-span-2 lg:col-span-2 bg-black/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
              <div className="w-12 h-12 bg-yellow-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-yellow-500/30 group-hover:bg-yellow-500/30 transition-all duration-300">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-400 mb-3">Sub-second load times</p>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Optimized performance with instant page loads and real-time data synchronization.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 p-2 rounded-lg border border-white/10 text-center">
                  <div className="text-xs text-green-400 font-medium">0.3s</div>
                  <div className="text-xs text-gray-400">Page Load</div>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/10 text-center">
                  <div className="text-xs text-blue-400 font-medium">0.1s</div>
                  <div className="text-xs text-gray-400">Processing</div>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/10 text-center">
                  <div className="text-xs text-purple-400 font-medium">Real-time</div>
                  <div className="text-xs text-gray-400">Data Sync</div>
                </div>
              </div>
            </div>

            {/* Growth & Marketing Tools - Small Card */}
            <div className="md:col-span-1 lg:col-span-1 bg-black/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
              <div className="w-10 h-10 bg-green-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 border border-green-500/30 group-hover:bg-green-500/30 transition-all duration-300">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Marketing</h3>
              <p className="text-xs text-gray-400 mb-3">Growth tools</p>
              <div className="space-y-2">
                <div className="text-xs text-gray-400">Promotions</div>
                <div className="text-xs text-gray-400">Loyalty program</div>
              </div>
            </div>

            {/* Easy Setup & Migration - Small Card */}
            <div className="md:col-span-1 lg:col-span-1 bg-black/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
              <div className="w-10 h-10 bg-indigo-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 border border-indigo-500/30 group-hover:bg-indigo-500/30 transition-all duration-300">
                <RotateCcw className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Easy Setup</h3>
              <p className="text-xs text-gray-400 mb-3">Quick migration</p>
              <div className="space-y-2">
                <div className="text-xs text-gray-400">5-min setup</div>
                <div className="text-xs text-gray-400">Guided process</div>
              </div>
            </div>

            {/* Customer Review System - Medium Card */}
            <div className="md:col-span-2 lg:col-span-1 bg-black/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
              <div className="w-10 h-10 bg-pink-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 border border-pink-500/30 group-hover:bg-pink-500/30 transition-all duration-300">
                <Star className="w-5 h-5 text-pink-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Customer Review System</h3>
              <p className="text-xs text-gray-400 mb-3">Seamless feedback collection</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Average rating</span>
                  <span className="text-yellow-400 text-sm font-bold">4.8 ★★★★★</span>
                </div>
                <div className="text-xs text-gray-400">Real-time feedback</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Seamless Integrations Section - Bento Grid */}
      <section className="relative bg-black/20 backdrop-blur-md py-20 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Seamless Integrations</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect with your existing tools and services. ServeNow integrates with all major restaurant technology platforms.
            </p>
          </motion.div>

          {/* Bento Integration Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            {/* Point of Sale Systems - Large Card */}
            <div className="md:col-span-2 lg:col-span-2 bg-black/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
              <div className="w-16 h-16 bg-emerald-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30 group-hover:bg-emerald-500/30 transition-all duration-300">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">POS Systems</h3>
              <p className="text-sm text-gray-400 mb-4">Point of Sale integration</p>
              <p className="text-gray-300 leading-relaxed mb-6">
                Connect with major POS systems for seamless order processing and inventory sync.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <div className="text-sm font-medium text-white">Square</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <div className="text-sm font-medium text-white">Toast</div>
                </div>
              </div>
            </div>

            {/* Payment Processors - Large Card */}
            <div className="md:col-span-2 lg:col-span-2 bg-black/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
              <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30 group-hover:bg-blue-500/30 transition-all duration-300">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Payment Processors</h3>
              <p className="text-sm text-gray-400 mb-4">Secure transactions</p>
              <p className="text-gray-300 leading-relaxed mb-6">
                Support for all major payment methods and processors with enterprise-grade security.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                  <div className="text-lg font-bold text-white mb-2">Cashfree</div>
                  <div className="text-xs text-gray-400">Secure Indian Payment Gateway</div>
                  <div className="flex justify-center space-x-2 mt-2">
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">UPI</span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Cards</span>
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Net Banking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Management - Medium Card */}
            <div className="md:col-span-1 lg:col-span-2 bg-black/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
              <div className="w-12 h-12 bg-teal-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-teal-500/30 group-hover:bg-teal-500/30 transition-all duration-300">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Inventory</h3>
              <p className="text-sm text-gray-400 mb-3">Stock management</p>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Real-time inventory tracking with automated alerts and supplier integration.
              </p>
              <div className="space-y-2">
                <div className="text-xs text-gray-400">• Auto tracking</div>
                <div className="text-xs text-gray-400">• Low stock alerts</div>
                <div className="text-xs text-gray-400">• Supplier sync</div>
              </div>
            </div>

            {/* Marketing Tools - Medium Card */}
            <div className="md:col-span-1 lg:col-span-2 bg-black/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
              <div className="w-12 h-12 bg-pink-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-pink-500/30 group-hover:bg-pink-500/30 transition-all duration-300">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Marketing</h3>
              <p className="text-sm text-gray-400 mb-3">Campaign tools</p>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Comprehensive marketing suite with email campaigns and social media integration.
              </p>
              <div className="space-y-2">
                <div className="text-xs text-gray-400">• Email campaigns</div>
                <div className="text-xs text-gray-400">• Social media</div>
                <div className="text-xs text-gray-400">• Customer analytics</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platform Overview Section - Bento Grid */}
      <section className="relative bg-black/20 backdrop-blur-md py-20 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              While others offer basic features, we provide a complete restaurant transformation platform.
            </h2>
          </motion.div>

          {/* Bento Statistics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto mb-12"
          >
            <div className="bg-black/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center group">
              <div className="text-4xl font-bold text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">50+</div>
              <div className="text-gray-300 text-sm">Features Included</div>
            </div>
            <div className="bg-black/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center group">
              <div className="text-4xl font-bold text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">99.9%</div>
              <div className="text-gray-300 text-sm">Uptime Guarantee</div>
            </div>
            <div className="bg-black/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center group">
              <div className="text-4xl font-bold text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
              <div className="text-gray-300 text-sm">Support Available</div>
            </div>
            <div className="bg-black/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center group">
              <div className="text-4xl font-bold text-orange-400 mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
              <div className="text-gray-300 text-sm">Happy Restaurants</div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Link href="/contact" className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300">
              See All Features in Action
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative bg-black/20 backdrop-blur-md py-20 z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-black/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Restaurant?</h2>
              <p className="text-lg text-gray-300 mb-8">
                Join thousands of restaurants already using ServeNow to streamline their operations and delight customers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300">
                  Start Free Trial
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
                <Link href="/contact" className="inline-flex items-center bg-transparent text-white px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-white/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300">
                  Schedule Demo
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}