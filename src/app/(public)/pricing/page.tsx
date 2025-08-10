'use client'

import { motion } from 'framer-motion'
import { Check, Phone, Mail, Users, Calendar, Shield, Zap, BarChart3, Menu, QrCode, Clock, Star, ArrowRight, MessageCircle } from 'lucide-react'
import { Comfortaa } from 'next/font/google'

const comfortaa = Comfortaa({ subsets: ['latin'] })

export default function PricingPage() {
  return (
    <div className={`min-h-screen bg-black ${comfortaa.className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 pt-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-6 border border-white/20">
              <Star className="w-4 h-4 mr-2" />
              Affordable & Transparent
            </div>

            <h1 className="text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Simple, Affordable Pricing
            </h1>
            
            <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Just ₹50/day - less than 2 cups of chai! Complete restaurant management system with everything you need to get started.
            </p>
          </motion.div>
        </section>

        {/* Single Pricing Plan Section - Bento Grid */}
        <section className="bg-black/20 backdrop-blur-md py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Complete ServeNow Package</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                One simple pricing structure - pay setup fee once, then monthly subscription. No hidden costs.
              </p>
            </motion.div>

            {/* Main Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-4xl mx-auto bg-black/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 mb-8"
            >
              {/* Payment Flow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Step 1: One-Time Setup */}
                <div className="relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-blue-500/30">
                      <Zap className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">First: One-Time Setup</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-white">₹2,999</span>
                      <span className="text-gray-400 text-sm ml-2">one-time only</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">Everything to get you started:</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-300">
                        <Check className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                        10 QR Code Stands (₹1,500 value)
                      </div>
                      <div className="flex items-center text-xs text-gray-300">
                        <Check className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                        Menu Digitization (₹1,000 value)
                      </div>
                      <div className="flex items-center text-xs text-gray-300">
                        <Check className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                        Dashboard Setup (₹1,000 value)
                      </div>
                      <div className="flex items-center text-xs text-gray-300">
                        <Check className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                        Staff Training (₹500 value)
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <p className="text-xs text-blue-300 font-medium mb-2">Pricing may vary based on:</p>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-blue-200">
                          <span className="w-1 h-1 bg-blue-400 rounded-full mr-2 flex-shrink-0"></span>
                          Number of tables (additional QR stands if needed)
                        </div>
                        <div className="flex items-center text-xs text-blue-200">
                          <span className="w-1 h-1 bg-blue-400 rounded-full mr-2 flex-shrink-0"></span>
                          Multiple dashboard screens setup
                        </div>
                        <div className="flex items-center text-xs text-blue-200">
                          <span className="w-1 h-1 bg-blue-400 rounded-full mr-2 flex-shrink-0"></span>
                          Custom hardware requirements
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Monthly Subscription */}
                <div className="relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-green-500/30">
                      <Star className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Then: Monthly Subscription</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-white">₹1,499</span>
                      <span className="text-gray-400 text-sm ml-2">/month</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">Just ₹50/day for full access:</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-300">
                        <Check className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                        Unlimited order management
                      </div>
                      <div className="flex items-center text-xs text-gray-300">
                        <Check className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                        Live order tracking
                      </div>
                      <div className="flex items-center text-xs text-gray-300">
                        <Check className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                        Role-based access control
                      </div>
                      <div className="flex items-center text-xs text-gray-300">
                        <Check className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                        Analytics & 24/7 support
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Flow Arrow */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-500/20 px-4 py-2 rounded-full border border-blue-500/30">
                    <span className="text-blue-400 font-semibold">Pay ₹2,999 Once</span>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                  <div className="bg-green-500/20 px-4 py-2 rounded-full border border-green-500/30">
                    <span className="text-green-400 font-semibold">Then ₹1,499/month</span>
                  </div>
                </div>
              </div>

              {/* Total Cost Breakdown */}
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
                <h3 className="text-lg font-bold text-white mb-4">Your Investment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-white">₹2,999*</div>
                    <div className="text-sm text-gray-400">First Month Total</div>
                    <div className="text-xs text-gray-500">(Setup + Month 1)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">₹1,499</div>
                    <div className="text-sm text-gray-400">Every Month After</div>
                    <div className="text-xs text-gray-500">(Cancel anytime)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">₹50</div>
                    <div className="text-sm text-gray-400">Per Day</div>
                    <div className="text-xs text-gray-500">(Less than 2 chai!)</div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center mt-8">
                <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 flex items-center justify-center mx-auto">
                  Start My Restaurant Setup
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ROI Example Section - Bento Grid */}
        <section className="bg-black/20 backdrop-blur-md py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Return on Investment (ROI)</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                See how ServeNow pays for itself in just 2-3 days with increased efficiency and revenue.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
              {/* ROI Calculation - Wide Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="md:col-span-3 lg:col-span-3 bg-black/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group"
              >
                <h3 className="text-2xl font-bold text-white mb-6">ROI Example</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Daily Revenue (10 tables × 4 turns × ₹300)</div>
                      <div className="text-2xl font-bold text-white">₹12,000</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div className="text-sm text-gray-400 mb-1">10% Efficiency Increase</div>
                      <div className="text-2xl font-bold text-green-400">+₹1,200/day</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Monthly Additional Revenue</div>
                      <div className="text-2xl font-bold text-white">₹36,000</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Setup Fee Recovery</div>
                      <div className="text-2xl font-bold text-blue-400">2-3 days</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Savings - Medium Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="md:col-span-2 lg:col-span-2 bg-black/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group"
              >
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-purple-500/30 group-hover:bg-purple-500/30 transition-all duration-300">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Why It's Affordable</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                    Saves 2-3 staff hours daily (₹3,000-₹5,000/month)
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                    Reduces errors from handwritten orders
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                    Faster table turnover = more customers
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                    Works even if staff changes (easy training)
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* What's Included Section - Bento Grid */}
        <section className="bg-black/20 backdrop-blur-md py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Everything You Need Included</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Our comprehensive solution includes all essential features to run your restaurant efficiently.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
              {/* Menu Management - Large Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="md:col-span-2 lg:col-span-2 md:row-span-2 bg-black/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group"
              >
                <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30 group-hover:bg-blue-500/30 transition-all duration-300">
                  <Menu className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Digital Menu System</h3>
                <p className="text-sm text-gray-400 mb-4">Complete menu management</p>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Create, update, and manage your digital menu with real-time synchronization across all platforms.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                    <div className="text-sm font-medium text-white">Real-time</div>
                    <div className="text-xs text-gray-400">Updates</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                    <div className="text-sm font-medium text-white">Multi-language</div>
                    <div className="text-xs text-gray-400">Support</div>
                  </div>
                </div>
              </motion.div>

              {/* QR Ordering - Medium Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="md:col-span-1 lg:col-span-1 bg-black/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group"
              >
                <div className="w-12 h-12 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-green-500/30 group-hover:bg-green-500/30 transition-all duration-300">
                  <QrCode className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">QR Ordering</h3>
                <p className="text-xs text-gray-400 mb-3">Contactless system</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Customers scan and order directly from their phones.
                </p>
              </motion.div>

              {/* Analytics - Tall Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="md:col-span-2 lg:col-span-2 md:row-span-3 bg-black/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group"
              >
                <div className="w-14 h-14 bg-purple-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-purple-500/30 group-hover:bg-purple-500/30 transition-all duration-300">
                  <BarChart3 className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-6">Analytics & Insights</h3>
                <p className="text-sm text-gray-400 mb-6">Real-time reporting</p>
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium">Sales Tracking</span>
                      <span className="text-green-400 text-xs">Live</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium">Popular Items</span>
                      <span className="text-blue-400 text-xs">Daily</span>
                    </div>
                    <div className="text-xs text-gray-400">Customer preferences</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium">Revenue Reports</span>
                      <span className="text-purple-400 text-xs">Monthly</span>
                    </div>
                    <div className="text-xs text-gray-400">Detailed insights</div>
                  </div>
                </div>
              </motion.div>

              {/* User Management - Wide Card */}
              <div className="md:col-span-3 lg:col-span-3 bg-black/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="w-12 h-12 bg-orange-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-orange-500/30 group-hover:bg-orange-500/30 transition-all duration-300">
                      <Users className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
                    <p className="text-sm text-gray-400">Role-based access control</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                      <div className="text-sm font-medium text-white">Admin</div>
                      <div className="text-xs text-gray-400">Full access</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                      <div className="text-sm font-medium text-white">Manager</div>
                      <div className="text-xs text-gray-400">Operations</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                      <div className="text-sm font-medium text-white">Staff</div>
                      <div className="text-xs text-gray-400">Limited</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security - Small Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="md:col-span-1 lg:col-span-1 bg-black/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group"
              >
                <div className="w-10 h-10 bg-red-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 border border-red-500/30 group-hover:bg-red-500/30 transition-all duration-300">
                  <Shield className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Security</h3>
                <p className="text-xs text-gray-400 mb-3">Enterprise-grade</p>
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">256-bit encryption</div>
                  <div className="text-xs text-gray-400">Secure access</div>
                </div>
              </motion.div>

              {/* Support - Small Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="md:col-span-1 lg:col-span-1 bg-black/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group"
              >
                <div className="w-10 h-10 bg-yellow-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 border border-yellow-500/30 group-hover:bg-yellow-500/30 transition-all duration-300">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">24/7 Support</h3>
                <p className="text-xs text-gray-400 mb-3">Always available</p>
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">Phone support</div>
                  <div className="text-xs text-gray-400">Email support</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing Summary Section */}
        <section className="bg-black/20 backdrop-blur-md py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Pricing Summary</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Transparent pricing with no hidden charges. Cancel anytime.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-black/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center"
              >
                <h3 className="text-xl font-bold text-white mb-4">First Month</h3>
                <div className="text-3xl font-bold text-white mb-2">₹2,999*</div>
                <p className="text-gray-400 text-sm mb-4">Setup + First Month</p>
                <div className="text-xs text-gray-400">Everything set up and live in 1-2 days</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="bg-black/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center"
              >
                <h3 className="text-xl font-bold text-white mb-4">Ongoing Monthly</h3>
                <div className="text-3xl font-bold text-green-400 mb-2">₹1,499</div>
                <p className="text-gray-400 text-sm mb-4">No hidden charges</p>
                <div className="text-xs text-gray-400">Cancel anytime</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="bg-black/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center"
              >
                <h3 className="text-xl font-bold text-white mb-4">Daily Cost</h3>
                <div className="text-3xl font-bold text-blue-400 mb-2">₹50</div>
                <p className="text-gray-400 text-sm mb-4">Per day</p>
                <div className="text-xs text-gray-400">Less than 2 cups of chai!</div>
              </motion.div>
            </div>

            {/* Bonus Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="bg-black/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center max-w-4xl mx-auto"
            >
              <div className="w-16 h-16 bg-yellow-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/30">
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-6">Bonus Benefits</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Check className="w-6 h-6 text-green-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Scalable Solution</h3>
                  <p className="text-gray-400 text-sm">Affordable for small cafes to full restaurants</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Users className="w-6 h-6 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Easy Training</h3>
                  <p className="text-gray-400 text-sm">Staff training takes less than 15 minutes</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Zap className="w-6 h-6 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Professional System</h3>
                  <p className="text-gray-400 text-sm">Better customer experience</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Shield className="w-6 h-6 text-red-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">No Hardware Upgrade</h3>
                  <p className="text-gray-400 text-sm">Scales as you grow</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="tel:+918260542544"
                  className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 flex items-center justify-center"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now: +91 82605 42544
                </a>
                <a 
                  href="mailto:bytixcompany@gmail.com"
                  className="bg-transparent text-white px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-white/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 flex items-center justify-center"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Get Started Today
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}