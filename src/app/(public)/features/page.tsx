'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Check, Menu, QrCode, BarChart3, Users, Shield, Clock } from 'lucide-react'

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-6xl font-bold text-black mb-6 leading-tight" style={{ fontSize: '3.75rem' }}>
            Powerful Features for Modern Restaurants
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Everything you need to run a successful restaurant, all in one comprehensive platform. Designed by restaurant experts, built for the future.
          </p>

          {/* Feature Count Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-8">
            <Check className="w-4 h-4 mr-2" />
            50+ Features Included
          </div>
        </motion.div>
      </section>

      {/* Core Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black mb-6">Core Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed to streamline every aspect of your restaurant operations.
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          >
            {/* Advanced Menu Management */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                <Menu className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Advanced Menu Management</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Create, edit, and organize your restaurant menu with our intuitive drag-and-drop interface. Add photos, descriptions, pricing, and manage availability in real-time.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Drag & drop menu builder
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Real-time updates across all platforms
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Multi-language support
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Nutritional information tracking
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Seasonal menu scheduling
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Bulk import/export capabilities
                </li>
              </ul>
            </div>

            {/* Smart QR Code Ordering */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Smart QR Code Ordering</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Generate custom QR codes for contactless ordering. Customers can scan and order directly from their phones with a seamless, branded experience.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Contactless ordering experience
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Instant QR generation
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Table-specific codes
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Custom branding options
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Order customization
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Payment integration
                </li>
              </ul>
            </div>

            {/* Comprehensive Analytics */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Comprehensive Analytics</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Get detailed insights into your restaurant's performance with real-time analytics, sales tracking, and predictive reporting.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Real-time sales tracking
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Popular items analysis
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Customer behavior insights
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Revenue forecasting
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Peak hours analysis
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Inventory optimization
                </li>
              </ul>
            </div>

            {/* User Management System */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-4">User Management System</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Manage your restaurant users efficiently with role-based access and user tracking.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Role-based access control
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  User scheduling tools
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Performance tracking
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Communication hub
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Training modules
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Payroll integration
                </li>
              </ul>
            </div>

            {/* Enterprise Security */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Enterprise Security</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Bank-level security with data encryption, compliance standards, and regular security audits to protect your business.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  256-bit data encryption
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  GDPR & PCI compliant
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Regular security audits
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Secure payment processing
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Data backup & recovery
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Access logging
                </li>
              </ul>
            </div>

            {/* Real-time Order Management */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Real-time Order Management</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Receive and manage orders in real-time with instant notifications, order tracking, and kitchen display integration.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Live order tracking
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Push notifications
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Kitchen display system
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Order history
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Status updates
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Customer communication
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="bg-black py-20">
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

          {/* Additional Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {/* Mobile Optimized */}
            <div className="bg-black border border-gray-800 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Mobile Optimized</h3>
              <p className="text-gray-300">Perfect experience on all devices and screen sizes</p>
            </div>

            {/* Cloud-Based Platform */}
            <div className="bg-black border border-gray-800 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Cloud-Based Platform</h3>
              <p className="text-gray-300">Access from anywhere with automatic updates</p>
            </div>

            {/* Lightning Fast Performance */}
            <div className="bg-black border border-gray-800 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Lightning Fast Performance</h3>
              <p className="text-gray-300">Optimized for speed with sub-second load times</p>
            </div>

            {/* Customer Review System */}
            <div className="bg-black border border-gray-800 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Customer Review System</h3>
              <p className="text-gray-300">Collect and manage customer feedback seamlessly</p>
            </div>

            {/* Growth & Marketing Tools */}
            <div className="bg-black border border-gray-800 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Growth & Marketing Tools</h3>
              <p className="text-gray-300">Built-in promotion and loyalty features</p>
            </div>

            {/* Easy Setup & Migration */}
            <div className="bg-black border border-gray-800 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Easy Setup & Migration</h3>
              <p className="text-gray-300">Get started in minutes with guided setup</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Seamless Integrations Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black mb-6">Seamless Integrations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with your existing tools and services. ServeNow integrates with all major restaurant technology platforms.
            </p>
          </motion.div>

          {/* Integration Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {/* Point of Sale (POS) Systems */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Point of Sale (POS) Systems</h3>
              <p className="text-gray-600">Seamless Integration available</p>
            </div>

            {/* Payment Processors */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Payment Processors</h3>
              <p className="text-gray-600">Seamless Integration available</p>
            </div>

            {/* Delivery Platforms */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Delivery Platforms</h3>
              <p className="text-gray-600">Seamless Integration available</p>
            </div>

            {/* Accounting Software */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Accounting Software</h3>
              <p className="text-gray-600">Seamless Integration available</p>
            </div>

            {/* Inventory Management */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Inventory Management</h3>
              <p className="text-gray-600">Seamless Integration available</p>
            </div>

            {/* Marketing Tools */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Marketing Tools</h3>
              <p className="text-gray-600">Seamless Integration available</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platform Overview Section */}
      <section className="bg-black py-20">
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

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-gray-300">Features Included</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-300">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-300">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-300">Happy Restaurants</div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Link href="/contact" className="inline-flex items-center bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              See All Features in Action
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-12 border border-gray-200"
            >
              <h2 className="text-3xl font-bold text-black mb-6">Ready to Transform Your Restaurant?</h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of restaurants already using ServeNow to streamline their operations and delight customers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="inline-flex items-center bg-black text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors">
                  Start Free Trial
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
                <Link href="/contact" className="inline-flex items-center bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors">
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