'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Rocket,
  CreditCard,
  Menu,
  QrCode,
  Shield,
  Zap,
  Search,
  Check,
  Star,
  Clock,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Users,
  BarChart3,
  Workflow,
  GitBranch,
  Database,
  Server,
  Smartphone,
  Wifi,
  CheckCircle,
  XCircle,
  RefreshCw,
  Bell,
  Eye,
  Settings,
  UserCheck,
  ShoppingCart,
  Receipt,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface DocSection {
  id: string
  title: string
  icon: React.ReactNode
  subsections?: { id: string; title: string }[]
}

const docSections: DocSection[] = [
  {
    id: 'overview',
    title: 'Platform Overview',
    icon: <Rocket className="w-4 h-4" />,
    subsections: [
      { id: 'introduction', title: 'What is ServeNow?' },
      { id: 'how-it-works', title: 'How It Works' },
      { id: 'system-requirements', title: 'System Requirements' },
      { id: 'architecture', title: 'System Architecture' }
    ]
  },
  {
    id: 'workflows',
    title: 'Complete Workflows',
    icon: <Workflow className="w-4 h-4" />,
    subsections: [
      { id: 'customer-journey', title: 'Complete Customer Journey' },
      { id: 'order-lifecycle', title: 'Order Lifecycle Flow' },
      { id: 'restaurant-workflow', title: 'Restaurant Operations Flow' },
      { id: 'payment-flow', title: 'Payment Processing Flow' }
    ]
  },
  {
    id: 'features',
    title: 'Core Features',
    icon: <Star className="w-4 h-4" />,
    subsections: [
      { id: 'qr-ordering', title: 'QR Code Ordering System' },
      { id: 'menu-management', title: 'Digital Menu Management' },
      { id: 'order-tracking', title: 'Real-time Order Tracking' },
      { id: 'user-roles', title: 'Multi-user Access Control' }
    ]
  },
  {
    id: 'payments',
    title: 'Payment System',
    icon: <CreditCard className="w-4 h-4" />,
    subsections: [
      { id: 'cashfree-integration', title: 'Cashfree Payment Gateway' },
      { id: 'payment-fees', title: 'Transaction Fees' },
      { id: 'payment-setup', title: 'Payment Configuration' },
      { id: 'manual-payments', title: 'Manual Payment Option' }
    ]
  },
  {
    id: 'pricing',
    title: 'Pricing & Plans',
    icon: <DollarSign className="w-4 h-4" />,
    subsections: [
      { id: 'pricing-structure', title: 'Pricing Structure' },
      { id: 'setup-costs', title: 'One-time Setup Costs' },
      { id: 'monthly-subscription', title: 'Monthly Subscription' },
      { id: 'whats-included', title: "What's Included" }
    ]
  }
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderContent = () => {
    switch (activeSection) {
      case 'how-it-works':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">How ServeNow Works</h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed">
                ServeNow transforms traditional restaurant operations into a seamless digital experience.
                Here's a comprehensive overview of how the entire system works from customer interaction to order fulfillment.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Workflow className="w-6 h-6 mr-3 text-blue-400" />
                Complete System Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-black/60 p-4 sm:p-6 rounded-xl border border-white/10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                    <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">Customer Side</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">Customers scan QR codes, browse digital menus, place orders, and make payments through their mobile devices.</p>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Server className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">ServeNow Platform</h3>
                  <p className="text-gray-400 text-sm">Central system processes orders, manages menus, handles payments, and provides real-time updates to all stakeholders.</p>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Restaurant Staff</h3>
                  <p className="text-gray-400 text-sm">Kitchen and service staff receive orders instantly, update order status, and manage the entire fulfillment process.</p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Key System Components</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2 flex items-center">
                        <Database className="w-4 h-4 mr-2 text-blue-400" />
                        Supabase Database
                      </h4>
                      <p className="text-gray-400 text-sm">PostgreSQL database storing restaurants, menus, orders, users, and all system data with real-time subscriptions.</p>
                    </div>

                    <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2 flex items-center">
                        <QrCode className="w-4 h-4 mr-2 text-green-400" />
                        QR Code System
                      </h4>
                      <p className="text-gray-400 text-sm">Unique QR codes for each table linking directly to the restaurant's digital menu with table identification.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2 flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-orange-400" />
                        Payment Gateway
                      </h4>
                      <p className="text-gray-400 text-sm">Cashfree integration handling secure payments with support for cards, UPI, net banking, and wallets.</p>
                    </div>

                    <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2 flex items-center">
                        <Wifi className="w-4 h-4 mr-2 text-purple-400" />
                        Real-time Updates
                      </h4>
                      <p className="text-gray-400 text-sm">WebSocket connections providing instant order updates, status changes, and notifications across all devices.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Settings className="w-6 h-6 mr-3 text-purple-400" />
                Complete System Setup Workflow
              </h2>

              <p className="text-gray-300 mb-8">
                This comprehensive flow diagram shows how restaurants get onboarded to ServeNow,
                from initial admin registration to generating QR codes for customer use.
              </p>

              <div className="space-y-8">
                {/* Flow Diagram */}
                <div className="relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Step 1: Restaurant Registration */}
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 sm:p-6 rounded-2xl border border-blue-500/30 relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mb-2">Restaurant Registration</h3>
                      <p className="text-blue-200 text-xs sm:text-sm mb-3">Restaurant signs up for ServeNow</p>
                      <div className="space-y-1 sm:space-y-2 text-xs text-blue-100">
                        <div>• Restaurant details entry</div>
                        <div>• Contact information setup</div>
                        <div>• Business verification</div>
                        <div>• Restaurant profile creation</div>
                      </div>
                      <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 hidden lg:block">
                        <ArrowRight className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>

                    {/* Step 2: Credentials Generation */}
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-6 rounded-2xl border border-green-500/30 relative">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Account Setup</h3>
                      <p className="text-green-200 text-sm mb-3">System creates restaurant access</p>
                      <div className="space-y-2 text-xs text-green-100">
                        <div>• Unique restaurant ID created</div>
                        <div>• Login credentials generated</div>
                        <div>• Dashboard access granted</div>
                        <div>• Security tokens assigned</div>
                      </div>
                      <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 hidden lg:block">
                        <ArrowRight className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>

                    {/* Step 3: Restaurant Setup */}
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-2xl border border-purple-500/30 relative">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                        <Settings className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Restaurant Setup</h3>
                      <p className="text-purple-200 text-sm mb-3">Restaurant configures their system</p>
                      <div className="space-y-2 text-xs text-purple-100">
                        <div>• Dashboard customization</div>
                        <div>• Payment gateway setup</div>
                        <div>• Staff account creation</div>
                        <div>• Table configuration</div>
                      </div>
                      <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 hidden lg:block">
                        <ArrowRight className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>

                    {/* Step 4: QR Code Generation */}
                    <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-6 rounded-2xl border border-orange-500/30">
                      <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                        <QrCode className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">QR Code Generation</h3>
                      <p className="text-orange-200 text-sm mb-3">System generates table QR codes</p>
                      <div className="space-y-2 text-xs text-orange-100">
                        <div>• Unique QR codes per table</div>
                        <div>• Menu links embedded</div>
                        <div>• Printable formats created</div>
                        <div>• Table stands prepared</div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Flow Arrows */}
                  <div className="lg:hidden flex justify-center space-x-4 my-4">
                    <ArrowRight className="w-6 h-6 text-gray-400 transform rotate-90" />
                  </div>
                </div>

                {/* Detailed Process Breakdown */}
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-white">Detailed Process Breakdown</h3>

                  {[
                    {
                      phase: "Phase 1: Restaurant Onboarding",
                      title: "Restaurant Registration & Profile Setup",
                      description: "Restaurant signs up for ServeNow and creates their business profile",
                      steps: [
                        {
                          title: "Business Information Collection",
                          details: [
                            "Restaurant name, address, and contact details entered",
                            "Business registration number and tax information recorded",
                            "Operating hours, cuisine type, and seating capacity documented",
                            "Owner/manager contact information and emergency contacts saved"
                          ]
                        },
                        {
                          title: "Restaurant Profile Creation",
                          details: [
                            "Unique restaurant ID generated in database",
                            "Restaurant profile page created with branding elements",
                            "Logo upload and brand color scheme configuration",
                            "Restaurant description and special features documented"
                          ]
                        },
                        {
                          title: "Verification Process",
                          details: [
                            "Business documents reviewed and verified",
                            "Restaurant location confirmed through address verification",
                            "Contact information validated via phone and email",
                            "Legal compliance and licensing requirements checked"
                          ]
                        }
                      ],
                      color: "blue",
                      icon: <Users className="w-6 h-6 text-blue-400" />
                    },
                    {
                      phase: "Phase 2: Access & Security",
                      title: "Account Setup & Security Configuration",
                      description: "Secure access credentials and authentication systems are established for the restaurant",
                      steps: [
                        {
                          title: "Restaurant Account Creation",
                          details: [
                            "Primary restaurant account created for owner/manager",
                            "Secure password requirements enforced with complexity rules",
                            "Email verification completed to activate account",
                            "Dashboard access granted with restaurant-specific permissions"
                          ]
                        },
                        {
                          title: "System Integration",
                          details: [
                            "Restaurant-specific API keys generated for system integration",
                            "Webhook URLs configured for real-time order notifications",
                            "Payment gateway merchant ID linked to restaurant account",
                            "Security tokens and authentication systems activated"
                          ]
                        },
                        {
                          title: "Role-Based Access Control",
                          details: [
                            "User roles defined: Owner, Manager, Kitchen Staff, Service Staff",
                            "Permission levels assigned for each role type",
                            "Access restrictions implemented for sensitive operations",
                            "Audit logging enabled for all user actions and changes"
                          ]
                        }
                      ],
                      color: "green",
                      icon: <Shield className="w-6 h-6 text-green-400" />
                    },
                    {
                      phase: "Phase 3: Restaurant Configuration",
                      title: "System Setup & Customization",
                      description: "Restaurant staff configure their specific operational requirements and preferences",
                      steps: [
                        {
                          title: "Dashboard Customization",
                          details: [
                            "Restaurant dashboard layout configured to match workflow",
                            "Key performance indicators and metrics widgets selected",
                            "Notification preferences set for different types of alerts",
                            "User interface themes and branding elements applied"
                          ]
                        },
                        {
                          title: "Payment Configuration",
                          details: [
                            "Cashfree merchant account linked and verified",
                            "Payment methods enabled (cards, UPI, net banking, wallets)",
                            "Transaction fee structures reviewed and accepted",
                            "Settlement account details configured for fund transfers"
                          ]
                        },
                        {
                          title: "Operational Setup",
                          details: [
                            "Table numbers and seating arrangements mapped in system",
                            "Kitchen workflow preferences and order routing configured",
                            "Service staff assignments and notification preferences set",
                            "Operating hours and special schedules programmed"
                          ]
                        }
                      ],
                      color: "purple",
                      icon: <Settings className="w-6 h-6 text-purple-400" />
                    },
                    {
                      phase: "Phase 4: Menu & QR Setup",
                      title: "Menu Creation & QR Code Generation",
                      description: "Digital menu is created and QR codes are generated for customer access",
                      steps: [
                        {
                          title: "Digital Menu Creation",
                          details: [
                            "Menu categories created (appetizers, mains, desserts, beverages)",
                            "Individual menu items added with descriptions and prices",
                            "High-quality food images uploaded and optimized",
                            "Dietary information and allergen warnings specified"
                          ]
                        },
                        {
                          title: "Menu Optimization",
                          details: [
                            "Item availability and inventory tracking configured",
                            "Pricing strategies and promotional offers set up",
                            "Menu item popularity tracking and analytics enabled",
                            "Seasonal menu variations and special items programmed"
                          ]
                        },
                        {
                          title: "QR Code Generation",
                          details: [
                            "Unique QR codes generated for each table with embedded restaurant and table IDs",
                            "QR codes formatted for professional printing on table stands",
                            "Backup QR codes created for replacement and maintenance",
                            "QR code tracking and analytics system activated for usage monitoring"
                          ]
                        }
                      ],
                      color: "orange",
                      icon: <QrCode className="w-6 h-6 text-orange-400" />
                    }
                  ].map((phase, index) => (
                    <div key={index} className="bg-black/60 p-8 rounded-2xl border border-white/10">
                      <div className="flex items-start space-x-4 mb-6">
                        <div className={`w-16 h-16 bg-${phase.color}-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-${phase.color}-500/30`}>
                          {phase.icon}
                        </div>
                        <div>
                          <div className={`text-${phase.color}-400 font-semibold text-sm mb-1`}>{phase.phase}</div>
                          <h4 className="text-2xl font-bold text-white mb-2">{phase.title}</h4>
                          <p className="text-gray-300 text-lg">{phase.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {phase.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="bg-black/40 p-6 rounded-xl border border-white/10">
                            <h5 className="text-white font-bold mb-3 flex items-center">
                              <span className={`bg-${phase.color}-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2`}>
                                {stepIndex + 1}
                              </span>
                              {step.title}
                            </h5>
                            <ul className="space-y-2 text-sm text-gray-400">
                              {step.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className="flex items-start">
                                  <span className={`text-${phase.color}-400 mr-2 mt-1 text-xs`}>•</span>
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* System Integration Overview */}
                <div className="bg-black/60 p-8 rounded-2xl border border-white/10">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Database className="w-6 h-6 mr-3 text-green-400" />
                    System Integration & Data Flow
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="text-lg font-bold text-white">Database Operations</h4>
                      <div className="space-y-4">
                        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                          <h5 className="font-semibold text-white mb-2">Restaurant Registration</h5>
                          <p className="text-gray-400 text-sm">New restaurant record created in 'restaurants' table with unique ID, business details, and configuration settings.</p>
                        </div>
                        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                          <h5 className="font-semibold text-white mb-2">User Account Creation</h5>
                          <p className="text-gray-400 text-sm">Restaurant staff accounts created in 'users' table with role-based permissions and restaurant associations.</p>
                        </div>
                        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                          <h5 className="font-semibold text-white mb-2">Menu Data Structure</h5>
                          <p className="text-gray-400 text-sm">Menu items stored in 'menu_items' table with categories, pricing, descriptions, and availability status.</p>
                        </div>
                        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                          <h5 className="font-semibold text-white mb-2">QR Code Mapping</h5>
                          <p className="text-gray-400 text-sm">Table QR codes stored in 'tables' table with unique identifiers linking to restaurant and table numbers.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-lg font-bold text-white">System Integrations</h4>
                      <div className="space-y-4">
                        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                          <h5 className="font-semibold text-white mb-2">Payment Gateway Setup</h5>
                          <p className="text-gray-400 text-sm">Cashfree merchant account linked with webhook URLs configured for payment notifications and settlements.</p>
                        </div>
                        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                          <h5 className="font-semibold text-white mb-2">Real-time Notifications</h5>
                          <p className="text-gray-400 text-sm">WebSocket connections established for live order updates, status changes, and system notifications.</p>
                        </div>
                        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                          <h5 className="font-semibold text-white mb-2">Image Storage</h5>
                          <p className="text-gray-400 text-sm">Restaurant logos and menu item images uploaded to secure cloud storage with CDN optimization.</p>
                        </div>
                        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
                          <h5 className="font-semibold text-white mb-2">Analytics Tracking</h5>
                          <p className="text-gray-400 text-sm">Performance metrics and business intelligence systems activated for order tracking and reporting.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Technology Stack Deep Dive</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-white flex items-center">
                    <GitBranch className="w-4 h-4 mr-2 text-blue-400" />
                    Frontend Architecture
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="bg-black/60 p-3 rounded-lg border border-white/10">
                      <div className="font-medium text-white">Next.js 14 App Router</div>
                      <div className="text-gray-400">Server-side rendering, API routes, and optimized performance</div>
                    </div>
                    <div className="bg-black/60 p-3 rounded-lg border border-white/10">
                      <div className="font-medium text-white">TypeScript</div>
                      <div className="text-gray-400">Type safety, better development experience, and reduced bugs</div>
                    </div>
                    <div className="bg-black/60 p-3 rounded-lg border border-white/10">
                      <div className="font-medium text-white">Tailwind CSS</div>
                      <div className="text-gray-400">Utility-first styling with responsive design and dark theme</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-white flex items-center">
                    <Database className="w-4 h-4 mr-2 text-green-400" />
                    Backend & Database
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="bg-black/60 p-3 rounded-lg border border-white/10">
                      <div className="font-medium text-white">Supabase PostgreSQL</div>
                      <div className="text-gray-400">Scalable database with real-time subscriptions and row-level security</div>
                    </div>
                    <div className="bg-black/60 p-3 rounded-lg border border-white/10">
                      <div className="font-medium text-white">RESTful APIs</div>
                      <div className="text-gray-400">Clean API endpoints for all CRUD operations and business logic</div>
                    </div>
                    <div className="bg-black/60 p-3 rounded-lg border border-white/10">
                      <div className="font-medium text-white">Real-time Subscriptions</div>
                      <div className="text-gray-400">Live updates for orders, menu changes, and system notifications</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-white flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-purple-400" />
                    Security & Integrations
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="bg-black/60 p-3 rounded-lg border border-white/10">
                      <div className="font-medium text-white">Authentication</div>
                      <div className="text-gray-400">Secure user authentication with role-based access control</div>
                    </div>
                    <div className="bg-black/60 p-3 rounded-lg border border-white/10">
                      <div className="font-medium text-white">Cashfree Gateway</div>
                      <div className="text-gray-400">PCI DSS compliant payment processing with webhook verification</div>
                    </div>
                    <div className="bg-black/60 p-3 rounded-lg border border-white/10">
                      <div className="font-medium text-white">Image Storage</div>
                      <div className="text-gray-400">Optimized image upload and storage for menu items and branding</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'architecture':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">System Architecture</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Understanding ServeNow's technical architecture, data flow, and system design principles
                that ensure scalability, reliability, and optimal performance.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">High-Level Architecture</h2>

              <div className="space-y-6">
                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Server className="w-5 h-5 mr-2 text-blue-400" />
                    Three-Tier Architecture
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/40 p-4 rounded-lg border border-blue-500/20">
                      <h4 className="font-semibold text-blue-400 mb-2">Presentation Layer</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Customer mobile interface</li>
                        <li>• Restaurant dashboard</li>
                        <li>• Admin panel</li>
                        <li>• Responsive web design</li>
                      </ul>
                    </div>

                    <div className="bg-black/40 p-4 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-2">Application Layer</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Next.js API routes</li>
                        <li>• Business logic processing</li>
                        <li>• Authentication & authorization</li>
                        <li>• Payment processing</li>
                      </ul>
                    </div>

                    <div className="bg-black/40 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="font-semibold text-purple-400 mb-2">Data Layer</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Supabase PostgreSQL</li>
                        <li>• Real-time subscriptions</li>
                        <li>• File storage</li>
                        <li>• Data validation & security</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-green-400" />
                    Database Schema Overview
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Core Tables</h4>
                      <div className="space-y-2 text-sm">
                        <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                          <div className="font-medium text-white">restaurants</div>
                          <div className="text-gray-400">Restaurant profiles, settings, and configuration</div>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                          <div className="font-medium text-white">menu_items</div>
                          <div className="text-gray-400">Menu items with categories, prices, and descriptions</div>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                          <div className="font-medium text-white">orders</div>
                          <div className="text-gray-400">Order records with status tracking and timestamps</div>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                          <div className="font-medium text-white">order_items</div>
                          <div className="text-gray-400">Individual items within each order with quantities</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Supporting Tables</h4>
                      <div className="space-y-2 text-sm">
                        <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                          <div className="font-medium text-white">users</div>
                          <div className="text-gray-400">User accounts with role-based permissions</div>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                          <div className="font-medium text-white">payments</div>
                          <div className="text-gray-400">Payment records and transaction tracking</div>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                          <div className="font-medium text-white">tables</div>
                          <div className="text-gray-400">Table management with QR code associations</div>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                          <div className="font-medium text-white">analytics</div>
                          <div className="text-gray-400">Performance metrics and business intelligence</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Wifi className="w-5 h-5 mr-2 text-purple-400" />
                    Real-time Communication
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-white mb-3">WebSocket Connections</h4>
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                          Order status updates in real-time
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                          Menu changes propagated instantly
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                          Kitchen notifications for new orders
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                          Customer notifications for order updates
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-3">Event-Driven Updates</h4>
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Bell className="w-3 h-3 text-blue-400 mr-2" />
                          Database triggers for automatic notifications
                        </div>
                        <div className="flex items-center">
                          <RefreshCw className="w-3 h-3 text-blue-400 mr-2" />
                          Automatic UI updates without page refresh
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 text-blue-400 mr-2" />
                          Live order tracking for customers
                        </div>
                        <div className="flex items-center">
                          <BarChart3 className="w-3 h-3 text-blue-400 mr-2" />
                          Real-time analytics and reporting
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Security Architecture</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-400" />
                    Data Security
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="font-medium text-white mb-1">Row Level Security (RLS)</div>
                      <div className="text-gray-400">Database-level security ensuring users can only access their own data</div>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="font-medium text-white mb-1">JWT Authentication</div>
                      <div className="text-gray-400">Secure token-based authentication with automatic expiration</div>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="font-medium text-white mb-1">API Rate Limiting</div>
                      <div className="text-gray-400">Protection against abuse with configurable rate limits</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-orange-400" />
                    Payment Security
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="font-medium text-white mb-1">PCI DSS Compliance</div>
                      <div className="text-gray-400">Cashfree handles all sensitive payment data securely</div>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="font-medium text-white mb-1">Webhook Verification</div>
                      <div className="text-gray-400">Cryptographic signature verification for payment callbacks</div>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="font-medium text-white mb-1">SSL/TLS Encryption</div>
                      <div className="text-gray-400">End-to-end encryption for all data transmission</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'customer-journey':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Complete Customer Journey</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Follow the complete customer experience from entering the restaurant to receiving their order.
                This comprehensive flow shows every step, interaction, and system process involved.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-400" />
                Step-by-Step Customer Experience
              </h2>

              <div className="space-y-6">
                {[
                  {
                    step: 1,
                    title: "Customer Arrives at Restaurant",
                    description: "Customer is seated at a table with a QR code stand",
                    details: [
                      "Host/hostess seats customer at available table",
                      "Each table has a unique QR code stand with table number",
                      "QR code contains restaurant ID and table number",
                      "Customer notices the QR code and instructions to scan"
                    ],
                    icon: <Users className="w-5 h-5 text-blue-400" />,
                    color: "blue"
                  },
                  {
                    step: 2,
                    title: "QR Code Scanning",
                    description: "Customer scans QR code with their smartphone camera",
                    details: [
                      "Customer opens camera app or QR scanner",
                      "Points camera at QR code on table stand",
                      "QR code automatically opens ServeNow menu link",
                      "Link includes restaurant ID and table number parameters"
                    ],
                    icon: <QrCode className="w-5 h-5 text-green-400" />,
                    color: "green"
                  },
                  {
                    step: 3,
                    title: "Digital Menu Loading",
                    description: "ServeNow loads the restaurant's digital menu",
                    details: [
                      "System identifies restaurant from QR code parameters",
                      "Loads restaurant branding, logo, and theme",
                      "Displays complete menu with categories and items",
                      "Shows real-time prices and item availability",
                      "Menu is optimized for mobile viewing"
                    ],
                    icon: <Menu className="w-5 h-5 text-purple-400" />,
                    color: "purple"
                  },
                  {
                    step: 4,
                    title: "Menu Browsing & Selection",
                    description: "Customer browses menu and adds items to cart",
                    details: [
                      "Customer scrolls through menu categories",
                      "Views item descriptions, prices, and images",
                      "Clicks on items to view detailed information",
                      "Adds desired items to cart with quantities",
                      "Cart total updates automatically with each addition"
                    ],
                    icon: <ShoppingCart className="w-5 h-5 text-orange-400" />,
                    color: "orange"
                  },
                  {
                    step: 5,
                    title: "Order Review & Customer Details",
                    description: "Customer reviews order and provides contact information",
                    details: [
                      "Customer reviews all selected items and quantities",
                      "Modifies order if needed (add/remove items)",
                      "Enters customer name and phone number",
                      "Reviews total amount including any taxes",
                      "Confirms table number is correct"
                    ],
                    icon: <UserCheck className="w-5 h-5 text-cyan-400" />,
                    color: "cyan"
                  },
                  {
                    step: 6,
                    title: "Payment Processing",
                    description: "Customer completes payment through Cashfree gateway",
                    details: [
                      "Customer clicks 'Proceed to Payment' button",
                      "Redirected to secure Cashfree payment interface",
                      "Chooses payment method (card, UPI, net banking)",
                      "Enters payment details and completes transaction",
                      "Receives payment confirmation from Cashfree"
                    ],
                    icon: <CreditCard className="w-5 h-5 text-red-400" />,
                    color: "red"
                  },
                  {
                    step: 7,
                    title: "Order Confirmation",
                    description: "System confirms order and provides tracking information",
                    details: [
                      "Payment success triggers order creation in database",
                      "Customer receives order confirmation screen",
                      "Unique order ID generated for tracking",
                      "Estimated preparation time displayed",
                      "Customer can bookmark page for order tracking"
                    ],
                    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
                    color: "green"
                  },
                  {
                    step: 8,
                    title: "Kitchen Notification",
                    description: "Restaurant kitchen receives order instantly",
                    details: [
                      "Order appears on kitchen dashboard immediately",
                      "Kitchen staff sees all order details and special requests",
                      "Order status automatically set to 'Received'",
                      "Kitchen can update status as they begin preparation",
                      "Real-time notifications sent to customer"
                    ],
                    icon: <Bell className="w-5 h-5 text-yellow-400" />,
                    color: "yellow"
                  },
                  {
                    step: 9,
                    title: "Order Preparation & Tracking",
                    description: "Customer tracks order status in real-time",
                    details: [
                      "Customer can view live order status updates",
                      "Status progresses: Received → Preparing → Ready → Served",
                      "Estimated completion time updates dynamically",
                      "Customer receives notifications for status changes",
                      "Kitchen staff updates status as order progresses"
                    ],
                    icon: <Clock className="w-5 h-5 text-blue-400" />,
                    color: "blue"
                  },
                  {
                    step: 10,
                    title: "Order Completion",
                    description: "Order is served and marked as complete",
                    details: [
                      "Kitchen marks order as 'Ready' when prepared",
                      "Service staff delivers order to customer's table",
                      "Staff marks order as 'Served' in the system",
                      "Customer receives final notification of completion",
                      "Order history is saved for future reference"
                    ],
                    icon: <Receipt className="w-5 h-5 text-green-400" />,
                    color: "green"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-${item.color}-500/20 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`bg-${item.color}-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold`}>
                          {item.step}
                        </span>
                        <h3 className="text-lg font-bold text-white">{item.title}</h3>
                      </div>
                      <p className="text-gray-300 mb-3">{item.description}</p>
                      <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                        <h4 className="text-sm font-semibold text-white mb-2">Detailed Process:</h4>
                        <ul className="space-y-1 text-sm text-gray-400">
                          {item.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start">
                              <span className="text-gray-500 mr-2">•</span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {index < 9 && (
                      <div className="flex justify-center mt-6">
                        <ArrowRight className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Customer Experience Benefits</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Convenience Features</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">No app download required</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Works on any smartphone with camera</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Contactless ordering and payment</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Real-time order tracking</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Multiple payment options</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Time Savings</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">No waiting for menu or waiter</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Instant order placement</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Faster payment processing</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Reduced order errors</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Live preparation updates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'system-requirements':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">System Requirements</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                ServeNow is designed to work with minimal hardware requirements, but certain devices can significantly
                enhance your restaurant's operational efficiency and customer experience.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Smartphone className="w-6 h-6 mr-3 text-blue-400" />
                Basic Requirements (Included)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Wifi className="w-5 h-5 mr-2 text-green-400" />
                    Internet Connection
                  </h3>
                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span>Minimum 10 Mbps broadband connection</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span>WiFi network for customer access</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span>Stable connection for real-time updates</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span>Backup mobile data recommended</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <QrCode className="w-5 h-5 mr-2 text-blue-400" />
                    QR Code Table Stands
                  </h3>
                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span>QR code stands based on number of tables</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span>Waterproof and durable materials</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span>Easy to clean and maintain</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span>Additional stands available for purchase</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-green-400 mb-3">✓ What's Included in Setup Package</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-200">
                  <div>• QR code stands based on table count</div>
                  <div>• Complete menu digitization</div>
                  <div>• Restaurant dashboard setup</div>
                  <div>• Staff training session</div>
                  <div>• Payment gateway configuration</div>
                  <div>• Technical support for 30 days</div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Settings className="w-6 h-6 mr-3 text-purple-400" />
                Recommended Devices (Optional Purchase)
              </h2>

              <p className="text-gray-300 mb-6">
                While ServeNow works on any device with a web browser, these specialized devices can significantly
                improve your restaurant's efficiency and provide a better experience for both staff and customers.
              </p>

              <div className="space-y-8">
                {[
                  {
                    category: "Kitchen Display Systems",
                    description: "Dedicated screens for kitchen staff to manage orders efficiently",
                    devices: [
                      {
                        name: "Kitchen Display Monitor",
                        specs: "24-27 inch touchscreen display",
                        price: "₹25,000 - ₹35,000",
                        benefits: [
                          "Large, clear display visible from anywhere in kitchen",
                          "Touch interface for easy order status updates",
                          "Waterproof and heat-resistant design",
                          "Reduces paper waste and improves order accuracy"
                        ],
                        whyNeeded: "Kitchen staff can see all orders at a glance, update status with a touch, and eliminate the need for printed order tickets. This reduces errors and speeds up service."
                      },
                      {
                        name: "Kitchen Tablet Stand",
                        specs: "10-12 inch tablet with protective case",
                        price: "₹10,000 - ₹15,000",
                        benefits: [
                          "Compact solution for smaller kitchens",
                          "Easy to clean and sanitize",
                          "Portable for flexible kitchen layouts",
                          "Cost-effective alternative to large displays"
                        ],
                        whyNeeded: "Perfect for smaller restaurants or as a secondary display. Staff can easily move it around the kitchen as needed while maintaining full order visibility."
                      }
                    ],
                    color: "blue",
                    icon: <Server className="w-6 h-6 text-blue-400" />
                  },
                  {
                    category: "Management Dashboard",
                    description: "Dedicated displays for restaurant managers and owners",
                    devices: [
                      {
                        name: "Manager Dashboard Monitor",
                        specs: "21-24 inch desktop monitor",
                        price: "₹18,000 - ₹25,000",
                        benefits: [
                          "Real-time analytics and performance metrics",
                          "Complete restaurant overview in one screen",
                          "Multi-window capability for different views",
                          "Professional presentation for business meetings"
                        ],
                        whyNeeded: "Managers need to monitor overall restaurant performance, track sales, manage staff, and analyze customer data. A dedicated large screen makes this much more efficient."
                      },
                      {
                        name: "Management Tablet",
                        specs: "12-13 inch tablet with keyboard",
                        price: "₹12,000 - ₹15,000",
                        benefits: [
                          "Portable management solution",
                          "Work from anywhere in the restaurant",
                          "Handle administrative tasks efficiently",
                          "Access to all management features"
                        ],
                        whyNeeded: "Restaurant managers are always on the move. A portable tablet allows them to manage operations while walking around, talking to customers, and supervising staff."
                      }
                    ],
                    color: "green",
                    icon: <BarChart3 className="w-6 h-6 text-green-400" />
                  },
                  {
                    category: "Customer-Facing Devices",
                    description: "Optional devices to enhance customer experience",
                    devices: [
                      {
                        name: "Digital Menu Kiosk",
                        specs: "32-43 inch touchscreen kiosk",
                        price: "₹45,000 - ₹65,000",
                        benefits: [
                          "Self-service ordering for customers without phones",
                          "Showcase menu items with large, attractive displays",
                          "Reduce wait times during peak hours",
                          "Upselling opportunities with visual promotions"
                        ],
                        whyNeeded: "Some customers prefer not to use their phones or may have older devices. A kiosk provides an alternative ordering method and can increase average order value through visual upselling."
                      },
                      {
                        name: "Table-Side Ordering Tablet",
                        specs: "10 inch tablet with secure table mount",
                        price: "₹8,000 - ₹12,000 per table",
                        benefits: [
                          "Premium dining experience",
                          "Instant ordering without QR scanning",
                          "Entertainment while waiting for food",
                          "Detailed menu browsing with images"
                        ],
                        whyNeeded: "For upscale restaurants wanting to provide a premium experience. Customers can browse the menu leisurely, see detailed images, and place orders without using their phones."
                      }
                    ],
                    color: "purple",
                    icon: <Smartphone className="w-6 h-6 text-purple-400" />
                  }
                ].map((category, index) => (
                  <div key={index} className="bg-black/60 p-8 rounded-2xl border border-white/10">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className={`w-16 h-16 bg-${category.color}-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-${category.color}-500/30`}>
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{category.category}</h3>
                        <p className="text-gray-300 text-lg">{category.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {category.devices.map((device, deviceIndex) => (
                        <div key={deviceIndex} className="bg-black/40 p-6 rounded-xl border border-white/10">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-white mb-1">{device.name}</h4>
                              <p className="text-gray-400 text-sm">{device.specs}</p>
                            </div>
                            <div className={`bg-${category.color}-500/20 px-3 py-1 rounded-full`}>
                              <span className={`text-${category.color}-400 font-semibold text-sm`}>{device.price}</span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h5 className="text-white font-semibold mb-2">Why This Device?</h5>
                            <p className="text-gray-400 text-sm leading-relaxed">{device.whyNeeded}</p>
                          </div>

                          <div>
                            <h5 className="text-white font-semibold mb-2">Key Benefits:</h5>
                            <ul className="space-y-1 text-sm text-gray-400">
                              {device.benefits.map((benefit, benefitIndex) => (
                                <li key={benefitIndex} className="flex items-start">
                                  <span className={`text-${category.color}-400 mr-2 mt-1 text-xs`}>•</span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-green-400" />
                Why Invest in Dedicated Devices?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white">Operational Efficiency</h3>
                  <div className="space-y-4">
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-blue-400" />
                        Faster Order Processing
                      </h4>
                      <p className="text-gray-400 text-sm">Dedicated kitchen displays reduce order processing time by 30-40% compared to using phones or shared devices.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                        Reduced Errors
                      </h4>
                      <p className="text-gray-400 text-sm">Large, clear displays and touch interfaces minimize order mistakes and miscommunication between staff.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-purple-400" />
                        Better Staff Coordination
                      </h4>
                      <p className="text-gray-400 text-sm">Multiple staff members can work simultaneously without device conflicts or waiting for access.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white">Business Benefits</h3>
                  <div className="space-y-4">
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                        Increased Revenue
                      </h4>
                      <p className="text-gray-400 text-sm">Faster service means more table turns and higher customer satisfaction, directly impacting revenue.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2 flex items-center">
                        <Star className="w-4 h-4 mr-2 text-yellow-400" />
                        Professional Image
                      </h4>
                      <p className="text-gray-400 text-sm">Dedicated devices create a more professional appearance and enhance customer confidence in your restaurant.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2 flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2 text-blue-400" />
                        Better Analytics
                      </h4>
                      <p className="text-gray-400 text-sm">Dedicated management displays allow for better monitoring of performance metrics and business insights.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Device Recommendations by Restaurant Size</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-400" />
                    Small Restaurant (10-20 tables)
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="font-medium text-white">Essential:</div>
                    <ul className="space-y-1 text-gray-400 ml-4">
                      <li>• 1 Kitchen tablet (₹15,000)</li>
                      <li>• 1 Manager tablet (₹20,000)</li>
                    </ul>
                    <div className="font-medium text-white mt-4">Optional:</div>
                    <ul className="space-y-1 text-gray-400 ml-4">
                      <li>• 1 Service tablet (₹12,000)</li>
                    </ul>
                    <div className="bg-blue-500/20 p-3 rounded-lg mt-4">
                      <div className="font-semibold text-blue-400">Total: ₹35,000 - ₹47,000</div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-green-400" />
                    Medium Restaurant (20-40 tables)
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="font-medium text-white">Essential:</div>
                    <ul className="space-y-1 text-gray-400 ml-4">
                      <li>• 1 Kitchen display (₹30,000)</li>
                      <li>• 1 Manager monitor (₹20,000)</li>
                      <li>• 2 Service tablets (₹24,000)</li>
                    </ul>
                    <div className="font-medium text-white mt-4">Optional:</div>
                    <ul className="space-y-1 text-gray-400 ml-4">
                      <li>• 1 Digital kiosk (₹50,000)</li>
                    </ul>
                    <div className="bg-green-500/20 p-3 rounded-lg mt-4">
                      <div className="font-semibold text-green-400">Total: ₹74,000 - ₹1,24,000</div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-400" />
                    Large Restaurant (40+ tables)
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="font-medium text-white">Essential:</div>
                    <ul className="space-y-1 text-gray-400 ml-4">
                      <li>• 2 Kitchen displays (₹60,000)</li>
                      <li>• 1 Manager setup (₹45,000)</li>
                      <li>• 3-4 Service tablets (₹48,000)</li>
                    </ul>
                    <div className="font-medium text-white mt-4">Recommended:</div>
                    <ul className="space-y-1 text-gray-400 ml-4">
                      <li>• 2 Digital kiosks (₹1,00,000)</li>
                      <li>• Table tablets (₹3,00,000+)</li>
                    </ul>
                    <div className="bg-purple-500/20 p-3 rounded-lg mt-4">
                      <div className="font-semibold text-purple-400">Total: ₹1,53,000 - ₹5,53,000</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">Important Note</h3>
                  <p className="text-yellow-200 mb-3">
                    All recommended devices are optional purchases and not included in the ServeNow setup package.
                    The system works perfectly with any smartphone, tablet, or computer with a web browser.
                  </p>
                  <p className="text-yellow-200">
                    These devices are recommended to maximize efficiency and provide the best possible experience
                    for your staff and customers. You can start with basic devices and upgrade gradually as your business grows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'qr-ordering':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">QR Code Ordering System</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                ServeNow's QR code ordering system enables contactless dining experiences where customers
                can scan, browse, order, and pay directly from their smartphones without any app downloads.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <QrCode className="w-6 h-6 mr-3 text-blue-400" />
                How QR Code Ordering Works
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Customer Experience</h3>
                    <div className="space-y-3">
                      {[
                        { step: 1, text: "Customer sits at table with QR code stand", icon: <Users className="w-4 h-4 text-blue-400" /> },
                        { step: 2, text: "Scans QR code with smartphone camera", icon: <QrCode className="w-4 h-4 text-green-400" /> },
                        { step: 3, text: "Digital menu opens in web browser", icon: <Menu className="w-4 h-4 text-purple-400" /> },
                        { step: 4, text: "Browses menu and adds items to cart", icon: <ShoppingCart className="w-4 h-4 text-orange-400" /> },
                        { step: 5, text: "Completes order and payment", icon: <CreditCard className="w-4 h-4 text-red-400" /> }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <span className="bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            {item.step}
                          </span>
                          {item.icon}
                          <span className="text-gray-300 text-sm">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">System Features</h3>
                    <div className="space-y-3 text-sm text-gray-400">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>Unique QR codes for each table</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>No app download required</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>Works on any smartphone</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>Automatic table identification</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>Mobile-optimized interface</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>Real-time menu updates</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">QR Code Generation & Management</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white">QR Code Features</h3>
                  <div className="space-y-4">
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Unique Table Identification</h4>
                      <p className="text-gray-400 text-sm">Each QR code contains restaurant ID and table number, ensuring orders are correctly attributed to the right table.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Professional Design</h4>
                      <p className="text-gray-400 text-sm">QR codes include restaurant branding, instructions, and are formatted for professional table stands.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Easy Regeneration</h4>
                      <p className="text-gray-400 text-sm">Lost or damaged QR codes can be instantly regenerated and reprinted from the dashboard.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white">Technical Specifications</h3>
                  <div className="space-y-4">
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">QR Code Format</h4>
                      <p className="text-gray-400 text-sm">High-resolution QR codes with error correction, readable from various angles and lighting conditions.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">URL Structure</h4>
                      <p className="text-gray-400 text-sm">Clean URLs with restaurant and table parameters: servenow.com/menu/restaurant-id/table-number</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Security Features</h4>
                      <p className="text-gray-400 text-sm">Encrypted parameters and validation to prevent unauthorized access or tampering.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Benefits for Restaurants</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Faster Service</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• No waiting for menus or waiters</li>
                    <li>• Instant order placement</li>
                    <li>• Reduced order taking time</li>
                    <li>• Faster table turnover</li>
                  </ul>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Cost Savings</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Reduced printing costs</li>
                    <li>• Lower staff requirements</li>
                    <li>• No menu reprinting needed</li>
                    <li>• Decreased order errors</li>
                  </ul>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Safety & Hygiene</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Contactless ordering process</li>
                    <li>• No shared physical menus</li>
                    <li>• Reduced staff-customer contact</li>
                    <li>• Easy sanitization of QR stands</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'menu-management':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Digital Menu Management</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Create, organize, and manage your restaurant's digital menu with real-time updates,
                rich media support, and advanced categorization features.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Menu className="w-6 h-6 mr-3 text-blue-400" />
                Menu Creation & Organization
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Menu Categories</h3>
                    <div className="space-y-3">
                      {[
                        { name: "Appetizers", desc: "Starters and small plates", icon: "🥗" },
                        { name: "Main Courses", desc: "Primary dishes and entrees", icon: "🍽️" },
                        { name: "Desserts", desc: "Sweet treats and desserts", icon: "🍰" },
                        { name: "Beverages", desc: "Drinks, juices, and cocktails", icon: "🥤" },
                        { name: "Specials", desc: "Daily specials and promotions", icon: "⭐" }
                      ].map((category, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-black/40 rounded-lg">
                          <span className="text-2xl">{category.icon}</span>
                          <div>
                            <div className="font-medium text-white">{category.name}</div>
                            <div className="text-gray-400 text-sm">{category.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Item Management Features</h3>
                    <div className="space-y-3 text-sm text-gray-400">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>Rich text descriptions with formatting</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>High-quality image uploads</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>Pricing with currency formatting</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>Dietary information and allergens</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>Availability status (in stock/out of stock)</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>Customization options and add-ons</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>Preparation time estimates</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>Popularity indicators and recommendations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Real-time Menu Updates</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <RefreshCw className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Instant Updates</h3>
                  <p className="text-gray-400 text-sm mb-3">Changes made to menu items are immediately reflected across all customer devices.</p>
                  <ul className="space-y-1 text-xs text-gray-500">
                    <li>• Price changes</li>
                    <li>• Item availability</li>
                    <li>• New item additions</li>
                    <li>• Description updates</li>
                  </ul>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Scheduled Changes</h3>
                  <p className="text-gray-400 text-sm mb-3">Schedule menu changes for specific times, perfect for daily specials and time-based pricing.</p>
                  <ul className="space-y-1 text-xs text-gray-500">
                    <li>• Happy hour pricing</li>
                    <li>• Daily specials</li>
                    <li>• Seasonal menus</li>
                    <li>• Weekend variations</li>
                  </ul>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Eye className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Inventory Integration</h3>
                  <p className="text-gray-400 text-sm mb-3">Automatically mark items as unavailable when inventory runs low.</p>
                  <ul className="space-y-1 text-xs text-gray-500">
                    <li>• Stock level monitoring</li>
                    <li>• Auto-disable out of stock</li>
                    <li>• Low stock alerts</li>
                    <li>• Restock notifications</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Advanced Menu Features</h2>

              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <Star className="w-5 h-5 mr-2 text-yellow-400" />
                      Menu Analytics
                    </h3>
                    <div className="space-y-3 text-sm text-gray-400">
                      <div>• Track most popular items</div>
                      <div>• Monitor customer preferences</div>
                      <div>• Analyze ordering patterns</div>
                      <div>• Revenue per menu item</div>
                      <div>• Peak ordering times</div>
                      <div>• Customer feedback integration</div>
                    </div>
                  </div>

                  <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-blue-400" />
                      Customization Options
                    </h3>
                    <div className="space-y-3 text-sm text-gray-400">
                      <div>• Multiple size options</div>
                      <div>• Add-on ingredients</div>
                      <div>• Spice level selection</div>
                      <div>• Cooking preferences</div>
                      <div>• Special instructions field</div>
                      <div>• Dietary modifications</div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Menu Display Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-black/40 rounded-lg">
                      <div className="text-2xl mb-2">📱</div>
                      <div className="font-medium text-white text-sm">Mobile Optimized</div>
                      <div className="text-gray-400 text-xs">Perfect for smartphones</div>
                    </div>
                    <div className="text-center p-4 bg-black/40 rounded-lg">
                      <div className="text-2xl mb-2">🖼️</div>
                      <div className="font-medium text-white text-sm">Image Gallery</div>
                      <div className="text-gray-400 text-xs">High-quality food photos</div>
                    </div>
                    <div className="text-center p-4 bg-black/40 rounded-lg">
                      <div className="text-2xl mb-2">🔍</div>
                      <div className="font-medium text-white text-sm">Search & Filter</div>
                      <div className="text-gray-400 text-xs">Easy item discovery</div>
                    </div>
                    <div className="text-center p-4 bg-black/40 rounded-lg">
                      <div className="text-2xl mb-2">🎨</div>
                      <div className="font-medium text-white text-sm">Brand Styling</div>
                      <div className="text-gray-400 text-xs">Custom colors & fonts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'order-tracking':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Real-time Order Tracking</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Monitor orders from placement to delivery with live status updates, estimated completion times,
                and seamless communication between kitchen, service staff, and customers.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-blue-400" />
                Order Status Tracking
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  {[
                    { status: "RECEIVED", color: "blue", icon: <CheckCircle className="w-5 h-5" />, desc: "Order confirmed and sent to kitchen" },
                    { status: "PREPARING", color: "yellow", icon: <RefreshCw className="w-5 h-5" />, desc: "Kitchen is preparing your order" },
                    { status: "READY", color: "purple", icon: <Bell className="w-5 h-5" />, desc: "Order ready for pickup/delivery" },
                    { status: "SERVED", color: "green", icon: <Receipt className="w-5 h-5" />, desc: "Order delivered to customer" },
                    { status: "COMPLETED", color: "gray", icon: <Star className="w-5 h-5" />, desc: "Order completed successfully" }
                  ].map((item, index) => (
                    <div key={index} className={`bg-${item.color}-500/20 p-4 rounded-xl border border-${item.color}-500/30 text-center`}>
                      <div className={`w-12 h-12 bg-${item.color}-500/30 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                        <div className={`text-${item.color}-400`}>{item.icon}</div>
                      </div>
                      <div className={`font-bold text-${item.color}-400 mb-2`}>{item.status}</div>
                      <div className="text-gray-400 text-xs">{item.desc}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Real-time Updates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-white mb-3">For Customers</h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-center">
                          <Smartphone className="w-4 h-4 text-blue-400 mr-2" />
                          Live status updates on their device
                        </li>
                        <li className="flex items-center">
                          <Clock className="w-4 h-4 text-green-400 mr-2" />
                          Estimated completion time
                        </li>
                        <li className="flex items-center">
                          <Bell className="w-4 h-4 text-purple-400 mr-2" />
                          Push notifications for status changes
                        </li>
                        <li className="flex items-center">
                          <Eye className="w-4 h-4 text-orange-400 mr-2" />
                          Order history and tracking page
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-3">For Restaurant Staff</h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-center">
                          <Server className="w-4 h-4 text-blue-400 mr-2" />
                          Kitchen dashboard with all active orders
                        </li>
                        <li className="flex items-center">
                          <Users className="w-4 h-4 text-green-400 mr-2" />
                          Service staff notifications
                        </li>
                        <li className="flex items-center">
                          <BarChart3 className="w-4 h-4 text-purple-400 mr-2" />
                          Order queue management
                        </li>
                        <li className="flex items-center">
                          <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
                          Delay alerts and notifications
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Kitchen Management Dashboard</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Order Queue Display</h3>
                    <div className="space-y-3">
                      {[
                        { order: "#1234", table: "Table 5", time: "12:30 PM", items: "2x Burger, 1x Fries", status: "preparing", priority: "normal" },
                        { order: "#1235", table: "Table 2", time: "12:32 PM", items: "1x Pizza, 2x Coke", status: "received", priority: "high" },
                        { order: "#1236", table: "Table 8", time: "12:35 PM", items: "3x Pasta, 1x Salad", status: "ready", priority: "normal" }
                      ].map((order, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${order.priority === 'high' ? 'bg-red-500/10 border-red-500/30' : 'bg-black/40 border-white/10'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-white">{order.order} - {order.table}</div>
                            <div className="text-gray-400 text-sm">{order.time}</div>
                          </div>
                          <div className="text-gray-400 text-sm mb-2">{order.items}</div>
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${order.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-400' :
                              order.status === 'received' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                              {order.status.toUpperCase()}
                            </span>
                            {order.priority === 'high' && (
                              <span className="text-red-400 text-xs font-medium">HIGH PRIORITY</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Kitchen Features</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Time Tracking</div>
                          <div className="text-gray-400 text-sm">Automatic timing from order receipt to completion</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">One-Touch Updates</div>
                          <div className="text-gray-400 text-sm">Easy status updates with single tap/click</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Bell className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Audio Alerts</div>
                          <div className="text-gray-400 text-sm">Sound notifications for new orders and delays</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Performance Metrics</div>
                          <div className="text-gray-400 text-sm">Track preparation times and efficiency</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Service Staff Tools</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Ready Orders</h3>
                  <p className="text-gray-400 text-sm mb-3">View all orders ready for delivery with table numbers and order details.</p>
                  <ul className="space-y-1 text-xs text-gray-500">
                    <li>• Table identification</li>
                    <li>• Order contents</li>
                    <li>• Special instructions</li>
                    <li>• Customer preferences</li>
                  </ul>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Delivery Confirmation</h3>
                  <p className="text-gray-400 text-sm mb-3">Mark orders as served and update customer status automatically.</p>
                  <ul className="space-y-1 text-xs text-gray-500">
                    <li>• One-tap confirmation</li>
                    <li>• Customer notifications</li>
                    <li>• Service time tracking</li>
                    <li>• Feedback collection</li>
                  </ul>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Eye className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Order History</h3>
                  <p className="text-gray-400 text-sm mb-3">Access complete order history for customer inquiries and issue resolution.</p>
                  <ul className="space-y-1 text-xs text-gray-500">
                    <li>• Past orders lookup</li>
                    <li>• Customer preferences</li>
                    <li>• Issue tracking</li>
                    <li>• Service notes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'user-roles':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Multi-user Access Control</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Secure role-based access system that ensures each team member has appropriate permissions
                and access to only the features they need for their responsibilities.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-400" />
                User Roles & Permissions
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[
                  {
                    role: "Restaurant Owner",
                    color: "red",
                    icon: <UserCheck className="w-6 h-6 text-red-400" />,
                    description: "Full system access with complete administrative control",
                    permissions: [
                      "Complete system administration",
                      "User management and role assignment",
                      "Financial reports and analytics",
                      "Menu management and pricing",
                      "Payment gateway configuration",
                      "Restaurant settings and branding",
                      "Staff performance monitoring",
                      "System backup and security settings"
                    ]
                  },
                  {
                    role: "Manager",
                    color: "blue",
                    icon: <Settings className="w-6 h-6 text-blue-400" />,
                    description: "Operational management with limited administrative access",
                    permissions: [
                      "Daily operations management",
                      "Staff scheduling and assignments",
                      "Order monitoring and reports",
                      "Menu item availability updates",
                      "Customer service management",
                      "Inventory tracking",
                      "Performance analytics viewing",
                      "Basic system configuration"
                    ]
                  },
                  {
                    role: "Kitchen Staff",
                    color: "green",
                    icon: <Server className="w-6 h-6 text-green-400" />,
                    description: "Kitchen operations focused on order preparation and management",
                    permissions: [
                      "View incoming orders",
                      "Update order preparation status",
                      "Mark orders as ready",
                      "Access kitchen dashboard",
                      "View order details and special instructions",
                      "Update item availability",
                      "Kitchen performance metrics",
                      "Order timing and queue management"
                    ]
                  },
                  {
                    role: "Service Staff",
                    color: "purple",
                    icon: <Users className="w-6 h-6 text-purple-400" />,
                    description: "Customer service and order delivery responsibilities",
                    permissions: [
                      "View ready orders for delivery",
                      "Mark orders as served",
                      "Access customer information",
                      "Handle customer inquiries",
                      "Process manual payments",
                      "View order history",
                      "Customer feedback management",
                      "Table management"
                    ]
                  }
                ].map((roleData, index) => (
                  <div key={index} className={`bg-${roleData.color}-500/10 p-6 rounded-2xl border border-${roleData.color}-500/20`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-12 h-12 bg-${roleData.color}-500/20 rounded-xl flex items-center justify-center`}>
                        {roleData.icon}
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold text-${roleData.color}-400`}>{roleData.role}</h3>
                        <p className="text-gray-400 text-sm">{roleData.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white text-sm">Permissions & Access:</h4>
                      <ul className="space-y-1">
                        {roleData.permissions.map((permission, permIndex) => (
                          <li key={permIndex} className="flex items-start text-sm text-gray-400">
                            <CheckCircle className={`w-3 h-3 text-${roleData.color}-400 mr-2 mt-0.5 flex-shrink-0`} />
                            {permission}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Security Features</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Secure Authentication</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Strong password requirements</li>
                    <li>• Email verification</li>
                    <li>• Session timeout protection</li>
                    <li>• Login attempt monitoring</li>
                    <li>• Account lockout protection</li>
                  </ul>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Eye className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Activity Monitoring</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• User action logging</li>
                    <li>• Login/logout tracking</li>
                    <li>• Permission change alerts</li>
                    <li>• Suspicious activity detection</li>
                    <li>• Audit trail maintenance</li>
                  </ul>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Settings className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Access Control</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Role-based permissions</li>
                    <li>• Feature-level restrictions</li>
                    <li>• Data access limitations</li>
                    <li>• Time-based access controls</li>
                    <li>• IP address restrictions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">User Management Dashboard</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Staff Management</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                            <UserCheck className="w-4 h-4 text-red-400" />
                          </div>
                          <div>
                            <div className="font-medium text-white">John Smith</div>
                            <div className="text-gray-400 text-sm">Restaurant Owner</div>
                          </div>
                        </div>
                        <div className="text-green-400 text-sm">Active</div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <Settings className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium text-white">Sarah Johnson</div>
                            <div className="text-gray-400 text-sm">Manager</div>
                          </div>
                        </div>
                        <div className="text-green-400 text-sm">Active</div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                            <Server className="w-4 h-4 text-green-400" />
                          </div>
                          <div>
                            <div className="font-medium text-white">Mike Chen</div>
                            <div className="text-gray-400 text-sm">Kitchen Staff</div>
                          </div>
                        </div>
                        <div className="text-yellow-400 text-sm">Offline</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Management Features</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Add New Users</div>
                          <div className="text-gray-400 text-sm">Invite staff members and assign roles</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Settings className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Role Management</div>
                          <div className="text-gray-400 text-sm">Modify permissions and access levels</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Eye className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Activity Monitoring</div>
                          <div className="text-gray-400 text-sm">Track user actions and login history</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Shield className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Security Settings</div>
                          <div className="text-gray-400 text-sm">Configure access controls and restrictions</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'introduction':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">What is ServeNow?</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                ServeNow is a complete restaurant management platform that digitizes your restaurant operations.
                Built with modern technology using Next.js, TypeScript, and Supabase database.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/40 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">QR Code Ordering</h3>
                <p className="text-gray-400 mb-4">Customers scan QR codes to view your digital menu and place orders directly from their phones.</p>
                <div className="text-green-400 font-semibold">✓ Contactless & Safe</div>
              </div>

              <div className="bg-black/40 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Menu className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Digital Menu</h3>
                <p className="text-gray-400 mb-4">Manage your menu items, prices, and descriptions through an easy-to-use dashboard.</p>
                <div className="text-green-400 font-semibold">✓ Real-time Updates</div>
              </div>

              <div className="bg-black/40 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Order Management</h3>
                <p className="text-gray-400 mb-4">Track orders in real-time with status updates from pending to completed.</p>
                <div className="text-green-400 font-semibold">✓ Live Tracking</div>
              </div>

              <div className="bg-black/40 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Cashfree Payments</h3>
                <p className="text-gray-400 mb-4">Secure payment processing through Cashfree gateway with support for all major payment methods.</p>
                <div className="text-green-400 font-semibold">✓ Secure & Reliable</div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Technology Stack</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Frontend</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Next.js 14 with App Router</li>
                    <li>• TypeScript for type safety</li>
                    <li>• Tailwind CSS for styling</li>
                    <li>• Framer Motion for animations</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Backend</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Supabase PostgreSQL database</li>
                    <li>• RESTful API endpoints</li>
                    <li>• Real-time subscriptions</li>
                    <li>• Secure authentication</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Integrations</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Cashfree payment gateway</li>
                    <li>• QR code generation</li>
                    <li>• Image upload & storage</li>
                    <li>• Email notifications</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'order-lifecycle':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Order Lifecycle Flow</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Detailed breakdown of how orders move through the system from creation to completion,
                including all status changes, notifications, and system processes.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Workflow className="w-6 h-6 mr-3 text-blue-400" />
                Order Status Progression
              </h2>

              <div className="space-y-8">
                {[
                  {
                    status: "PENDING",
                    title: "Order Created",
                    description: "Customer completes order but payment is still processing",
                    systemActions: [
                      "Order record created in database with PENDING status",
                      "Temporary order ID generated",
                      "Customer redirected to payment gateway",
                      "Order held in pending state until payment confirmation"
                    ],
                    userExperience: [
                      "Customer sees 'Processing Payment' message",
                      "Redirected to Cashfree payment interface",
                      "Order not yet visible to restaurant staff",
                      "Customer can still cancel at this stage"
                    ],
                    color: "yellow",
                    icon: <Clock className="w-5 h-5 text-yellow-400" />
                  },
                  {
                    status: "CONFIRMED",
                    title: "Payment Successful",
                    description: "Payment completed successfully, order confirmed and sent to kitchen",
                    systemActions: [
                      "Cashfree webhook confirms payment success",
                      "Order status updated to CONFIRMED",
                      "Kitchen dashboard receives real-time notification",
                      "Customer receives order confirmation with tracking link",
                      "Order appears in restaurant's active orders list"
                    ],
                    userExperience: [
                      "Customer sees order confirmation screen",
                      "Receives unique order ID for tracking",
                      "Can access real-time order tracking page",
                      "Kitchen staff sees order details immediately"
                    ],
                    color: "green",
                    icon: <CheckCircle className="w-5 h-5 text-green-400" />
                  },
                  {
                    status: "PREPARING",
                    title: "Kitchen Started Preparation",
                    description: "Kitchen staff has acknowledged order and begun preparation",
                    systemActions: [
                      "Kitchen staff clicks 'Start Preparing' button",
                      "Order status updated to PREPARING",
                      "Timestamp recorded for preparation start time",
                      "Real-time notification sent to customer",
                      "Estimated completion time calculated and displayed"
                    ],
                    userExperience: [
                      "Customer receives notification: 'Your order is being prepared'",
                      "Order tracking page shows 'Preparing' status",
                      "Estimated completion time displayed",
                      "Kitchen dashboard shows order in preparation queue"
                    ],
                    color: "blue",
                    icon: <RefreshCw className="w-5 h-5 text-blue-400" />
                  },
                  {
                    status: "READY",
                    title: "Order Ready for Pickup",
                    description: "Kitchen has completed preparation, order ready for service",
                    systemActions: [
                      "Kitchen staff marks order as READY",
                      "Service staff receives notification",
                      "Order moves to 'Ready for Service' queue",
                      "Customer notification sent automatically",
                      "Preparation time recorded for analytics"
                    ],
                    userExperience: [
                      "Customer receives notification: 'Your order is ready'",
                      "Service staff sees order in ready queue",
                      "Order tracking shows 'Ready for Service'",
                      "Kitchen can focus on next orders"
                    ],
                    color: "purple",
                    icon: <Bell className="w-5 h-5 text-purple-400" />
                  },
                  {
                    status: "SERVED",
                    title: "Order Delivered to Customer",
                    description: "Service staff has delivered order to customer's table",
                    systemActions: [
                      "Service staff marks order as SERVED",
                      "Order completion timestamp recorded",
                      "Customer receives final notification",
                      "Order moves to completed orders history",
                      "Analytics data updated with service metrics"
                    ],
                    userExperience: [
                      "Customer receives notification: 'Order delivered, enjoy your meal!'",
                      "Order tracking shows completion",
                      "Order appears in customer's order history",
                      "Restaurant dashboard shows completed order"
                    ],
                    color: "green",
                    icon: <Receipt className="w-5 h-5 text-green-400" />
                  },
                  {
                    status: "CANCELLED",
                    title: "Order Cancelled",
                    description: "Order cancelled due to payment failure or other issues",
                    systemActions: [
                      "Order status updated to CANCELLED",
                      "If payment was successful, refund process initiated",
                      "Kitchen notification removed if order was confirmed",
                      "Cancellation reason recorded",
                      "Customer and restaurant both notified"
                    ],
                    userExperience: [
                      "Customer receives cancellation notification",
                      "Refund processed if payment was completed",
                      "Order removed from kitchen queue",
                      "Cancellation reason provided to customer"
                    ],
                    color: "red",
                    icon: <XCircle className="w-5 h-5 text-red-400" />
                  }
                ].map((item, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-start space-x-6">
                      <div className={`w-16 h-16 bg-${item.color}-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-${item.color}-500/30`}>
                        {item.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className={`bg-${item.color}-500 text-white px-3 py-1 rounded-full text-sm font-bold`}>
                            {item.status}
                          </span>
                          <h3 className="text-xl font-bold text-white">{item.title}</h3>
                        </div>

                        <p className="text-gray-300 mb-4 text-lg">{item.description}</p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-black/60 p-5 rounded-xl border border-white/10">
                            <h4 className="text-white font-semibold mb-3 flex items-center">
                              <Server className="w-4 h-4 mr-2 text-blue-400" />
                              System Actions
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                              {item.systemActions.map((action, actionIndex) => (
                                <li key={actionIndex} className="flex items-start">
                                  <span className="text-blue-400 mr-2 mt-1">•</span>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-black/60 p-5 rounded-xl border border-white/10">
                            <h4 className="text-white font-semibold mb-3 flex items-center">
                              <Users className="w-4 h-4 mr-2 text-green-400" />
                              User Experience
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                              {item.userExperience.map((experience, expIndex) => (
                                <li key={expIndex} className="flex items-start">
                                  <span className="text-green-400 mr-2 mt-1">•</span>
                                  {experience}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {index < 5 && (
                      <div className="flex justify-center my-6">
                        <ArrowRight className="w-6 h-6 text-gray-500 transform rotate-90" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Real-time Notifications</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <Smartphone className="w-5 h-5 mr-2 text-blue-400" />
                    Customer Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="font-medium text-white mb-1">Order Confirmed</div>
                      <div className="text-gray-400 text-sm">"Your order #1234 has been confirmed and sent to the kitchen."</div>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="font-medium text-white mb-1">Preparation Started</div>
                      <div className="text-gray-400 text-sm">"Great news! Your order is now being prepared. Estimated time: 15 minutes."</div>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="font-medium text-white mb-1">Order Ready</div>
                      <div className="text-gray-400 text-sm">"Your order is ready and will be served to your table shortly."</div>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="font-medium text-white mb-1">Order Served</div>
                      <div className="text-gray-400 text-sm">"Your order has been delivered. Enjoy your meal!"</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-orange-400" />
                    Restaurant Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="font-medium text-white mb-1">New Order Alert</div>
                      <div className="text-gray-400 text-sm">"New order received for Table 5 - ₹450 total"</div>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="font-medium text-white mb-1">Order Ready for Service</div>
                      <div className="text-gray-400 text-sm">"Order #1234 is ready for delivery to Table 5"</div>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="font-medium text-white mb-1">Payment Confirmed</div>
                      <div className="text-gray-400 text-sm">"Payment of ₹450 confirmed for Order #1234"</div>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="font-medium text-white mb-1">Order Completed</div>
                      <div className="text-gray-400 text-sm">"Order #1234 marked as served - Total time: 18 minutes"</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'restaurant-workflow':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Restaurant Operations Flow</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Complete workflow for restaurant staff from receiving orders to serving customers.
                This covers kitchen operations, service management, and administrative tasks.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-400" />
                Staff Roles & Responsibilities
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <UserCheck className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Kitchen Staff</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Receive and acknowledge new orders</li>
                    <li>• Update order status during preparation</li>
                    <li>• Mark orders as ready when completed</li>
                    <li>• Manage preparation queue efficiently</li>
                  </ul>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Service Staff</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Monitor ready orders for delivery</li>
                    <li>• Deliver orders to correct tables</li>
                    <li>• Mark orders as served in system</li>
                    <li>• Handle customer inquiries</li>
                  </ul>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Settings className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Manager/Admin</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Monitor overall operations</li>
                    <li>• Manage menu items and pricing</li>
                    <li>• View analytics and reports</li>
                    <li>• Handle system configuration</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-xl font-bold text-white">Kitchen Operations Workflow</h3>

                {[
                  {
                    step: 1,
                    title: "Order Notification Received",
                    description: "New order appears on kitchen dashboard with audio/visual alert",
                    actions: [
                      "Kitchen display shows new order with flashing indicator",
                      "Audio notification plays to alert kitchen staff",
                      "Order details displayed: items, quantities, special requests",
                      "Table number and customer name clearly visible",
                      "Order timestamp shows when it was placed"
                    ],
                    tips: [
                      "Acknowledge orders quickly to maintain customer confidence",
                      "Check for any special dietary requirements or modifications",
                      "Prioritize orders based on preparation time and complexity"
                    ],
                    color: "blue"
                  },
                  {
                    step: 2,
                    title: "Order Acknowledgment",
                    description: "Kitchen staff acknowledges receipt and begins preparation",
                    actions: [
                      "Staff clicks 'Start Preparing' button on order",
                      "Order status changes from CONFIRMED to PREPARING",
                      "Customer receives notification that preparation has started",
                      "Order moves to active preparation queue",
                      "Estimated completion time is calculated and displayed"
                    ],
                    tips: [
                      "Acknowledge orders within 2-3 minutes of receipt",
                      "Organize ingredients and prep stations before starting",
                      "Communicate with team about order priorities"
                    ],
                    color: "green"
                  },
                  {
                    step: 3,
                    title: "Food Preparation",
                    description: "Kitchen prepares items according to order specifications",
                    actions: [
                      "Follow standard recipes and preparation procedures",
                      "Prepare items in optimal sequence for timing",
                      "Monitor cooking times and quality standards",
                      "Handle special requests and modifications",
                      "Coordinate multiple items to finish simultaneously"
                    ],
                    tips: [
                      "Use timer systems to track cooking progress",
                      "Maintain food safety and hygiene standards",
                      "Communicate delays immediately if they occur"
                    ],
                    color: "orange"
                  },
                  {
                    step: 4,
                    title: "Quality Check & Plating",
                    description: "Final quality control and professional presentation",
                    actions: [
                      "Inspect all items for quality and completeness",
                      "Ensure proper temperature and presentation",
                      "Plate items according to restaurant standards",
                      "Add garnishes and final touches",
                      "Verify order matches original specifications"
                    ],
                    tips: [
                      "Double-check order against original request",
                      "Maintain consistent plating standards",
                      "Ensure hot items are served hot, cold items cold"
                    ],
                    color: "purple"
                  },
                  {
                    step: 5,
                    title: "Order Ready Notification",
                    description: "Mark order as ready and notify service staff",
                    actions: [
                      "Click 'Mark as Ready' button in system",
                      "Order status changes to READY",
                      "Service staff receive immediate notification",
                      "Order appears in 'Ready for Service' queue",
                      "Customer receives notification that order is ready"
                    ],
                    tips: [
                      "Mark orders ready only when completely finished",
                      "Ensure proper food temperature is maintained",
                      "Communicate directly with service staff if needed"
                    ],
                    color: "cyan"
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <div className="flex items-start space-x-4 mb-4">
                      <span className={`bg-${item.color}-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                        {item.step}
                      </span>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                        <p className="text-gray-300">{item.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-white font-semibold mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                          Required Actions
                        </h5>
                        <ul className="space-y-2 text-sm text-gray-400">
                          {item.actions.map((action, actionIndex) => (
                            <li key={actionIndex} className="flex items-start">
                              <span className="text-green-400 mr-2 mt-1">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="text-white font-semibold mb-3 flex items-center">
                          <Star className="w-4 h-4 mr-2 text-yellow-400" />
                          Best Practices
                        </h5>
                        <ul className="space-y-2 text-sm text-gray-400">
                          {item.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start">
                              <span className="text-yellow-400 mr-2 mt-1">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Service Staff Workflow</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white">Order Delivery Process</h3>
                  <div className="space-y-4">
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">1. Monitor Ready Orders</h4>
                      <p className="text-gray-400 text-sm">Check dashboard regularly for orders marked as READY by kitchen staff.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">2. Collect Order</h4>
                      <p className="text-gray-400 text-sm">Gather all items for the order, verify completeness against order details.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">3. Deliver to Table</h4>
                      <p className="text-gray-400 text-sm">Locate correct table using table number, confirm customer name if needed.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">4. Mark as Served</h4>
                      <p className="text-gray-400 text-sm">Update order status to SERVED in the system after successful delivery.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white">Customer Service Tips</h3>
                  <div className="space-y-4">
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Professional Delivery</h4>
                      <p className="text-gray-400 text-sm">Announce items as you serve them, ensure customer satisfaction.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Handle Inquiries</h4>
                      <p className="text-gray-400 text-sm">Be prepared to answer questions about orders, ingredients, or timing.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Manage Issues</h4>
                      <p className="text-gray-400 text-sm">Address any concerns promptly, escalate to management when necessary.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Maintain Standards</h4>
                      <p className="text-gray-400 text-sm">Ensure consistent service quality and follow restaurant protocols.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'payment-flow':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Payment Processing Flow</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Comprehensive breakdown of the payment process from customer checkout to settlement,
                including security measures, error handling, and reconciliation procedures.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <CreditCard className="w-6 h-6 mr-3 text-blue-400" />
                Complete Payment Journey
              </h2>

              <div className="space-y-8">
                {[
                  {
                    step: 1,
                    title: "Order Total Calculation",
                    description: "System calculates final order amount including taxes and fees",
                    process: [
                      "Sum all menu item prices × quantities",
                      "Apply any applicable discounts or promotions",
                      "Calculate taxes based on restaurant location",
                      "Add service charges if configured",
                      "Display itemized breakdown to customer"
                    ],
                    technical: [
                      "Prices fetched from menu_items table",
                      "Tax rates retrieved from restaurant settings",
                      "Real-time calculation prevents price manipulation",
                      "Order total stored in orders table"
                    ],
                    color: "blue"
                  },
                  {
                    step: 2,
                    title: "Payment Session Creation",
                    description: "ServeNow creates secure payment session with Cashfree",
                    process: [
                      "Generate unique payment session ID",
                      "Send order details to Cashfree API",
                      "Receive secure payment URL from Cashfree",
                      "Store payment session details in database",
                      "Redirect customer to Cashfree payment page"
                    ],
                    technical: [
                      "API call to Cashfree /payments endpoint",
                      "Payment session includes order_id, amount, customer_details",
                      "Return URL configured for success/failure handling",
                      "Webhook URL set for payment status updates"
                    ],
                    color: "green"
                  },
                  {
                    step: 3,
                    title: "Customer Payment Processing",
                    description: "Customer completes payment through Cashfree interface",
                    process: [
                      "Customer selects preferred payment method",
                      "Enters payment details (card/UPI/net banking)",
                      "Cashfree processes payment with bank/gateway",
                      "Payment authentication (OTP/PIN verification)",
                      "Transaction completion or failure response"
                    ],
                    technical: [
                      "All payment data handled by Cashfree (PCI compliant)",
                      "ServeNow never stores sensitive payment information",
                      "Real-time payment status updates via webhooks",
                      "Transaction ID generated for tracking"
                    ],
                    color: "purple"
                  },
                  {
                    step: 4,
                    title: "Payment Verification",
                    description: "ServeNow receives and verifies payment confirmation",
                    process: [
                      "Cashfree sends webhook notification to ServeNow",
                      "Verify webhook signature for security",
                      "Update order status based on payment result",
                      "Send confirmation to customer and restaurant",
                      "Handle payment failures appropriately"
                    ],
                    technical: [
                      "Webhook signature verification using shared secret",
                      "Payment status: SUCCESS, FAILED, PENDING",
                      "Database transaction to update order and payment records",
                      "Idempotency checks to prevent duplicate processing"
                    ],
                    color: "orange"
                  },
                  {
                    step: 5,
                    title: "Order Confirmation & Settlement",
                    description: "Successful payment triggers order confirmation and settlement process",
                    process: [
                      "Order status updated to CONFIRMED",
                      "Kitchen receives order notification",
                      "Customer receives order confirmation",
                      "Payment amount scheduled for settlement",
                      "Transaction fees calculated and recorded"
                    ],
                    technical: [
                      "Real-time database updates trigger notifications",
                      "Settlement typically occurs within 1-2 business days",
                      "Transaction fees deducted automatically by Cashfree",
                      "Detailed transaction records maintained for reconciliation"
                    ],
                    color: "cyan"
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <div className="flex items-start space-x-4 mb-4">
                      <span className={`bg-${item.color}-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                        {item.step}
                      </span>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                        <p className="text-gray-300 text-lg">{item.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-white font-semibold mb-3 flex items-center">
                          <Users className="w-4 h-4 mr-2 text-blue-400" />
                          User Process
                        </h5>
                        <ul className="space-y-2 text-sm text-gray-400">
                          {item.process.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start">
                              <span className="text-blue-400 mr-2 mt-1">•</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="text-white font-semibold mb-3 flex items-center">
                          <Server className="w-4 h-4 mr-2 text-green-400" />
                          Technical Implementation
                        </h5>
                        <ul className="space-y-2 text-sm text-gray-400">
                          {item.technical.map((tech, techIndex) => (
                            <li key={techIndex} className="flex items-start">
                              <span className="text-green-400 mr-2 mt-1">•</span>
                              {tech}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Payment Security & Error Handling</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-400" />
                    Security Measures
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Webhook Signature Verification</h4>
                      <p className="text-gray-400 text-sm">All payment notifications verified using HMAC-SHA256 signatures to prevent tampering.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">PCI DSS Compliance</h4>
                      <p className="text-gray-400 text-sm">Cashfree handles all sensitive payment data with full PCI DSS Level 1 compliance.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">SSL/TLS Encryption</h4>
                      <p className="text-gray-400 text-sm">All communication encrypted with 256-bit SSL certificates for data protection.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Fraud Detection</h4>
                      <p className="text-gray-400 text-sm">Real-time fraud monitoring and risk assessment for all transactions.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                    Error Handling
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Payment Failures</h4>
                      <p className="text-gray-400 text-sm">Automatic retry mechanisms and clear error messages for failed transactions.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Network Issues</h4>
                      <p className="text-gray-400 text-sm">Timeout handling and graceful degradation for connectivity problems.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Duplicate Prevention</h4>
                      <p className="text-gray-400 text-sm">Idempotency keys prevent duplicate charges from multiple submissions.</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Reconciliation</h4>
                      <p className="text-gray-400 text-sm">Daily automated reconciliation between ServeNow and Cashfree records.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Settlement & Reporting</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                    Settlement Timeline
                  </h3>
                  <div className="space-y-3 text-sm text-gray-400">
                    <div>
                      <div className="font-medium text-white">T+1 Settlement</div>
                      <div>Funds settled within 1 business day</div>
                    </div>
                    <div>
                      <div className="font-medium text-white">Weekend Processing</div>
                      <div>Weekend transactions settled on Monday</div>
                    </div>
                    <div>
                      <div className="font-medium text-white">Holiday Delays</div>
                      <div>Bank holidays may delay settlement</div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                    Transaction Reporting
                  </h3>
                  <div className="space-y-3 text-sm text-gray-400">
                    <div>
                      <div className="font-medium text-white">Real-time Dashboard</div>
                      <div>Live transaction monitoring</div>
                    </div>
                    <div>
                      <div className="font-medium text-white">Daily Reports</div>
                      <div>Automated daily transaction summaries</div>
                    </div>
                    <div>
                      <div className="font-medium text-white">Monthly Statements</div>
                      <div>Detailed monthly financial reports</div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Receipt className="w-5 h-5 mr-2 text-purple-400" />
                    Fee Structure
                  </h3>
                  <div className="space-y-3 text-sm text-gray-400">
                    <div>
                      <div className="font-medium text-white">Transaction Fees</div>
                      <div>Deducted automatically from settlement</div>
                    </div>
                    <div>
                      <div className="font-medium text-white">No Setup Fees</div>
                      <div>No additional gateway setup costs</div>
                    </div>
                    <div>
                      <div className="font-medium text-white">Transparent Pricing</div>
                      <div>All fees clearly disclosed upfront</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'cashfree-integration':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Cashfree Payment Gateway</h1>
              <p className="text-xl text-gray-300">ServeNow uses Cashfree as the primary payment gateway for secure online transactions.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-black/40 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-400" />
                    How Cashfree Integration Works
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">1</span>
                      <div>
                        <p className="text-white font-medium">Customer Places Order</p>
                        <p className="text-gray-400 text-sm">Order is created in ServeNow system</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">2</span>
                      <div>
                        <p className="text-white font-medium">Payment Request to Cashfree</p>
                        <p className="text-gray-400 text-sm">ServeNow creates payment session with Cashfree</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">3</span>
                      <div>
                        <p className="text-white font-medium">Customer Pays</p>
                        <p className="text-gray-400 text-sm">Secure payment through Cashfree interface</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">4</span>
                      <div>
                        <p className="text-white font-medium">Payment Confirmation</p>
                        <p className="text-gray-400 text-sm">Cashfree notifies ServeNow of payment status</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Supported Payment Methods</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/60 p-3 rounded-lg border border-white/10 text-center">
                      <div className="text-sm font-medium text-white">Credit Cards</div>
                      <div className="text-xs text-gray-400">Visa, Mastercard, Rupay</div>
                    </div>
                    <div className="bg-black/60 p-3 rounded-lg border border-white/10 text-center">
                      <div className="text-sm font-medium text-white">Debit Cards</div>
                      <div className="text-xs text-gray-400">All major banks</div>
                    </div>
                    <div className="bg-black/60 p-3 rounded-lg border border-white/10 text-center">
                      <div className="text-sm font-medium text-white">UPI</div>
                      <div className="text-xs text-gray-400">GPay, PhonePe, Paytm</div>
                    </div>
                    <div className="bg-black/60 p-3 rounded-lg border border-white/10 text-center">
                      <div className="text-sm font-medium text-white">Net Banking</div>
                      <div className="text-xs text-gray-400">50+ banks</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-black/40 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Security Features</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center">
                      <Shield className="w-4 h-4 text-green-400 mr-2" />
                      PCI DSS Level 1 Compliance
                    </li>
                    <li className="flex items-center">
                      <Shield className="w-4 h-4 text-green-400 mr-2" />
                      256-bit SSL Encryption
                    </li>
                    <li className="flex items-center">
                      <Shield className="w-4 h-4 text-green-400 mr-2" />
                      Two-factor Authentication
                    </li>
                    <li className="flex items-center">
                      <Shield className="w-4 h-4 text-green-400 mr-2" />
                      Real-time Fraud Detection
                    </li>
                    <li className="flex items-center">
                      <Shield className="w-4 h-4 text-green-400 mr-2" />
                      Webhook Signature Verification
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'payment-fees':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Transaction Fees</h1>
              <p className="text-xl text-gray-300">Understanding the payment processing fees for your restaurant.</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 mb-8">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">Important: Payment Gateway Fees</h3>
                  <p className="text-yellow-200">
                    Cashfree charges transaction fees on every successful payment. These fees are deducted automatically
                    from your settlement amount and are separate from ServeNow's subscription fees.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-black/40 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Cashfree Transaction Fees</h3>
                  <div className="space-y-4">
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">Credit Cards</span>
                        <span className="text-red-400 font-bold">1.95% + ₹3</span>
                      </div>
                      <p className="text-gray-400 text-sm">Per successful transaction</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">Debit Cards</span>
                        <span className="text-red-400 font-bold">0.9% + ₹3</span>
                      </div>
                      <p className="text-gray-400 text-sm">Per successful transaction</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">UPI</span>
                        <span className="text-red-400 font-bold">0.5% + ₹2</span>
                      </div>
                      <p className="text-gray-400 text-sm">Per successful transaction</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">Net Banking</span>
                        <span className="text-red-400 font-bold">₹15 flat</span>
                      </div>
                      <p className="text-gray-400 text-sm">Per successful transaction</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-black/40 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Fee Calculation Example</h3>
                  <div className="space-y-3">
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white mb-1">Order Amount: ₹500</div>
                        <div className="text-sm text-gray-400">Credit Card Payment</div>
                      </div>
                    </div>
                    <div className="text-center text-gray-400">↓</div>
                    <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Order Amount</span>
                          <span className="text-white">₹500.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Cashfree Fee (1.95% + ₹3)</span>
                          <span className="text-red-400">-₹12.75</span>
                        </div>
                        <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                          <span className="text-white">You Receive</span>
                          <span className="text-green-400">₹487.25</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'setup-costs':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">One-time Setup Costs</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                ServeNow's one-time setup fee covers everything you need to get your restaurant fully operational
                with our digital ordering system. This comprehensive package ensures a smooth transition to contactless dining.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Zap className="w-6 h-6 mr-3 text-blue-400" />
                Complete Setup Package - ₹3,999
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-blue-400 mb-4">What's Included in Setup</h3>
                    <div className="space-y-4">
                      {[
                        {
                          item: "QR Code Stands",
                          value: "₹1,500",
                          description: "Professional table stands based on your restaurant's table count",
                          details: [
                            "Waterproof and durable materials",
                            "Custom branding with restaurant logo",
                            "Clear scanning instructions for customers",
                            "Easy to clean and maintain",
                            "Replacement guarantee for first 6 months"
                          ]
                        },
                        {
                          item: "Menu Digitization",
                          value: "₹1,000",
                          description: "Complete conversion of your physical menu to digital format",
                          details: [
                            "Professional menu photography (up to 50 items)",
                            "Menu categorization and organization",
                            "Item descriptions and pricing setup",
                            "Dietary information and allergen warnings",
                            "Mobile-optimized layout and design"
                          ]
                        },
                        {
                          item: "System Setup",
                          value: "₹1,000",
                          description: "Complete restaurant profile and dashboard configuration",
                          details: [
                            "Restaurant profile creation with branding",
                            "Payment gateway integration and testing",
                            "Table mapping and QR code generation",
                            "User accounts for staff members",
                            "Initial system configuration and testing"
                          ]
                        },
                        {
                          item: "Training & Support",
                          value: "₹499",
                          description: "Comprehensive staff training and initial support",
                          details: [
                            "2-hour on-site staff training session",
                            "Digital training materials and guides",
                            "30 days of priority technical support",
                            "Phone and email support during setup",
                            "Troubleshooting and optimization assistance"
                          ]
                        }
                      ].map((item, index) => (
                        <div key={index} className="bg-black/60 p-5 rounded-xl border border-white/10">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-white">{item.item}</h4>
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
                              {item.value}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-3">{item.description}</p>
                          <ul className="space-y-1">
                            {item.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-start text-xs text-gray-400">
                                <CheckCircle className="w-3 h-3 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Setup Process Timeline</h3>
                    <div className="space-y-4">
                      {[
                        { day: "Day 1", task: "Initial consultation and requirements gathering", duration: "2 hours" },
                        { day: "Day 2-3", task: "Menu digitization and photography", duration: "1-2 days" },
                        { day: "Day 4-5", task: "System setup and configuration", duration: "1-2 days" },
                        { day: "Day 6", task: "QR code generation and stand preparation", duration: "4 hours" },
                        { day: "Day 7", task: "Staff training and system testing", duration: "3 hours" },
                        { day: "Day 8", task: "Go-live and initial support", duration: "Ongoing" }
                      ].map((step, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-400 text-sm font-bold">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-white text-sm">{step.day}</span>
                              <span className="text-gray-400 text-xs">{step.duration}</span>
                            </div>
                            <p className="text-gray-400 text-sm">{step.task}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-green-400 mb-4">Setup Guarantees</h3>
                    <div className="space-y-3 text-sm text-green-200">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>Complete setup within 7 business days</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>100% satisfaction guarantee or money back</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>Free re-training if staff changes within 3 months</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>6-month warranty on all physical materials</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span>30-day priority support included</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Additional Setup Options</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">Express Setup</h3>
                  <div className="text-2xl font-bold text-blue-400 mb-2">₹5,999</div>
                  <p className="text-gray-400 text-sm mb-4">Complete setup within 3 business days</p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Priority scheduling</li>
                    <li>• Dedicated setup team</li>
                    <li>• Same-day QR code delivery</li>
                    <li>• Extended training session</li>
                  </ul>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">Premium Photography</h3>
                  <div className="text-2xl font-bold text-purple-400 mb-2">₹2,500</div>
                  <p className="text-gray-400 text-sm mb-4">Professional food photography upgrade</p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Professional photographer</li>
                    <li>• Studio-quality lighting</li>
                    <li>• Up to 100 menu items</li>
                    <li>• High-resolution images</li>
                  </ul>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">Extended Support</h3>
                  <div className="text-2xl font-bold text-green-400 mb-2">₹1,500</div>
                  <p className="text-gray-400 text-sm mb-4">Additional 60 days of priority support</p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• 90 days total support</li>
                    <li>• Unlimited phone calls</li>
                    <li>• On-site visits if needed</li>
                    <li>• Menu updates included</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">Important Setup Information</h3>
                  <div className="space-y-2 text-yellow-200 text-sm">
                    <p>• Setup fee is a one-time payment due before installation begins</p>
                    <p>• Monthly subscription starts only after successful setup completion</p>
                    <p>• Additional QR code stands can be ordered separately at ₹150 each</p>
                    <p>• Setup includes basic menu items only; complex customizations may incur additional charges</p>
                    <p>• Payment gateway setup requires restaurant's business documents and bank details</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'monthly-subscription':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Monthly Subscription</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                ServeNow's monthly subscription provides ongoing access to all platform features,
                regular updates, technical support, and unlimited order processing for your restaurant.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Star className="w-6 h-6 mr-3 text-green-400" />
                Monthly Plan - ₹1,999/month
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-green-400 mb-2">₹1,999</div>
                      <div className="text-gray-400">per month</div>
                      <div className="text-sm text-gray-500">Just ₹66 per day</div>
                      <div className="text-xs text-gray-600 mt-2">Less than the cost of 2 cups of coffee daily</div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white">Core Platform Features</h3>
                      {[
                        "Unlimited order processing and transactions",
                        "Real-time order tracking and notifications",
                        "Complete menu management system",
                        "Multi-user access with role-based permissions",
                        "Kitchen and service staff dashboards",
                        "Customer order history and analytics",
                        "Payment gateway integration and processing",
                        "QR code management and regeneration"
                      ].map((feature, index) => (
                        <div key={index} className="flex items-start text-sm text-green-200">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Advanced Features Included</h3>
                    <div className="space-y-4">
                      {[
                        {
                          category: "Analytics & Reporting",
                          features: [
                            "Daily, weekly, and monthly sales reports",
                            "Popular items and customer preference analysis",
                            "Peak hours and ordering pattern insights",
                            "Revenue tracking and profit analysis",
                            "Staff performance metrics"
                          ]
                        },
                        {
                          category: "Customer Experience",
                          features: [
                            "Mobile-optimized ordering interface",
                            "Real-time order status updates",
                            "Customer feedback collection",
                            "Order history and repeat ordering",
                            "Special offers and promotions"
                          ]
                        },
                        {
                          category: "Restaurant Management",
                          features: [
                            "Inventory tracking and low-stock alerts",
                            "Menu item availability management",
                            "Table management and optimization",
                            "Staff scheduling and task assignment",
                            "Customer service tools and communication"
                          ]
                        }
                      ].map((section, index) => (
                        <div key={index} className="bg-black/40 p-4 rounded-lg">
                          <h4 className="font-semibold text-white mb-2">{section.category}</h4>
                          <ul className="space-y-1">
                            {section.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-start text-xs text-gray-400">
                                <span className="text-green-400 mr-2">•</span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Support & Maintenance Included</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">24/7 Customer Support</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Phone support during business hours</li>
                    <li>• Email support with 4-hour response time</li>
                    <li>• Live chat support on dashboard</li>
                    <li>• Emergency support for critical issues</li>
                    <li>• Dedicated account manager</li>
                  </ul>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                    <RefreshCw className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Regular Updates</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Monthly feature updates and improvements</li>
                    <li>• Security patches and bug fixes</li>
                    <li>• New payment method integrations</li>
                    <li>• Performance optimizations</li>
                    <li>• Mobile app updates</li>
                  </ul>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Data & Security</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Daily automated data backups</li>
                    <li>• 99.9% uptime guarantee</li>
                    <li>• SSL encryption for all data</li>
                    <li>• GDPR compliance and data protection</li>
                    <li>• Regular security audits</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Subscription Benefits & Value</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Cost Comparison</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg">
                        <span className="text-gray-300">Traditional POS System</span>
                        <span className="text-red-400 font-semibold">₹5,000-15,000/month</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg">
                        <span className="text-gray-300">Printed Menu Updates</span>
                        <span className="text-red-400 font-semibold">₹2,000-5,000/month</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg">
                        <span className="text-gray-300">Additional Staff Costs</span>
                        <span className="text-red-400 font-semibold">₹10,000-20,000/month</span>
                      </div>
                      <div className="border-t border-white/10 pt-3">
                        <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                          <span className="text-white font-semibold">ServeNow Total</span>
                          <span className="text-green-400 font-bold">₹1,999/month</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-green-400 font-bold text-lg">Save ₹15,000-38,000 per month!</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">ROI Calculator</h3>
                    <div className="space-y-4">
                      <div className="bg-black/40 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">Average Restaurant Benefits</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Faster table turnover (20%)</span>
                            <span className="text-green-400">+₹8,000/month</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Reduced order errors (15%)</span>
                            <span className="text-green-400">+₹3,000/month</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Lower staff requirements</span>
                            <span className="text-green-400">+₹5,000/month</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">No printing costs</span>
                            <span className="text-green-400">+₹2,000/month</span>
                          </div>
                          <div className="border-t border-white/10 pt-2">
                            <div className="flex justify-between font-semibold">
                              <span className="text-white">Total Monthly Benefit</span>
                              <span className="text-green-400">₹18,000</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-500/10 rounded-lg">
                        <div className="text-green-400 font-bold">Net Monthly Profit: ₹16,001</div>
                        <div className="text-gray-400 text-sm">ROI: 800% per month</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <Star className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-blue-400 mb-2">Subscription Terms & Conditions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-200 text-sm">
                    <div>
                      <p>• Monthly billing cycle with automatic renewal</p>
                      <p>• Cancel anytime with 30-day notice</p>
                      <p>• No long-term contracts or commitments</p>
                      <p>• Prorated billing for partial months</p>
                    </div>
                    <div>
                      <p>• Payment due on the same date each month</p>
                      <p>• Late payment fees apply after 7 days</p>
                      <p>• Service suspension after 15 days non-payment</p>
                      <p>• Data retention for 90 days after cancellation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'whats-included':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">What's Included</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                ServeNow provides a complete restaurant digitization solution. Here's everything included
                in your setup package and monthly subscription to ensure your success.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
                Complete Feature Overview
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-green-400 mb-4">✓ Included in Setup (₹3,999)</h3>
                    <div className="space-y-4">
                      {[
                        {
                          category: "Physical Materials",
                          items: [
                            "QR code stands based on table count",
                            "Professional table stand design with branding",
                            "Waterproof and durable materials",
                            "Clear customer instructions",
                            "6-month replacement warranty"
                          ]
                        },
                        {
                          category: "Menu Digitization",
                          items: [
                            "Complete menu conversion to digital format",
                            "Professional food photography (up to 50 items)",
                            "Menu categorization and organization",
                            "Item descriptions and pricing setup",
                            "Mobile-optimized design and layout"
                          ]
                        },
                        {
                          category: "System Configuration",
                          items: [
                            "Restaurant profile creation with branding",
                            "Payment gateway integration and testing",
                            "Table mapping and QR code generation",
                            "Staff user accounts and role assignment",
                            "Complete system testing and optimization"
                          ]
                        },
                        {
                          category: "Training & Support",
                          items: [
                            "2-hour comprehensive staff training session",
                            "Digital training materials and user guides",
                            "30 days of priority technical support",
                            "Phone and email support during setup",
                            "Troubleshooting and optimization assistance"
                          ]
                        }
                      ].map((section, index) => (
                        <div key={index} className="bg-black/60 p-4 rounded-lg border border-white/10">
                          <h4 className="font-bold text-white mb-2">{section.category}</h4>
                          <ul className="space-y-1">
                            {section.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start text-sm text-gray-400">
                                <CheckCircle className="w-3 h-3 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-blue-400 mb-4">✓ Included in Monthly Plan (₹1,999)</h3>
                    <div className="space-y-4">
                      {[
                        {
                          category: "Core Platform Features",
                          items: [
                            "Unlimited order processing and transactions",
                            "Real-time order tracking and notifications",
                            "Complete menu management system",
                            "Multi-user access with role-based permissions",
                            "Kitchen and service staff dashboards"
                          ]
                        },
                        {
                          category: "Advanced Analytics",
                          items: [
                            "Daily, weekly, and monthly sales reports",
                            "Popular items and customer preference analysis",
                            "Peak hours and ordering pattern insights",
                            "Revenue tracking and profit analysis",
                            "Staff performance metrics and insights"
                          ]
                        },
                        {
                          category: "Customer Experience",
                          items: [
                            "Mobile-optimized ordering interface",
                            "Real-time order status updates for customers",
                            "Customer feedback collection system",
                            "Order history and repeat ordering features",
                            "Special offers and promotions management"
                          ]
                        },
                        {
                          category: "Support & Maintenance",
                          items: [
                            "24/7 customer support (phone, email, chat)",
                            "Monthly feature updates and improvements",
                            "Security patches and bug fixes",
                            "Daily automated data backups",
                            "99.9% uptime guarantee with monitoring"
                          ]
                        }
                      ].map((section, index) => (
                        <div key={index} className="bg-black/60 p-4 rounded-lg border border-white/10">
                          <h4 className="font-bold text-white mb-2">{section.category}</h4>
                          <ul className="space-y-1">
                            {section.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start text-sm text-gray-400">
                                <CheckCircle className="w-3 h-3 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Detailed Feature Breakdown</h2>

              <div className="space-y-8">
                {[
                  {
                    title: "QR Code Ordering System",
                    icon: <QrCode className="w-6 h-6 text-blue-400" />,
                    color: "blue",
                    features: [
                      "Unique QR codes for each table with restaurant and table identification",
                      "No app download required - works with any smartphone camera",
                      "Mobile-optimized menu interface with fast loading times",
                      "Automatic table identification and order routing",
                      "Support for multiple languages and accessibility features",
                      "Offline menu caching for poor internet connections"
                    ]
                  },
                  {
                    title: "Digital Menu Management",
                    icon: <Menu className="w-6 h-6 text-green-400" />,
                    color: "green",
                    features: [
                      "Unlimited menu items with rich descriptions and images",
                      "Real-time menu updates that sync instantly across all devices",
                      "Category organization with custom sorting and filtering",
                      "Pricing management with promotional offers and discounts",
                      "Inventory tracking with automatic item availability updates",
                      "Dietary information, allergen warnings, and nutritional data"
                    ]
                  },
                  {
                    title: "Order Management & Tracking",
                    icon: <Clock className="w-6 h-6 text-purple-400" />,
                    color: "purple",
                    features: [
                      "Real-time order status tracking from placement to delivery",
                      "Kitchen dashboard with order queue and timing management",
                      "Service staff notifications for ready orders and deliveries",
                      "Customer notifications with estimated completion times",
                      "Order history and repeat ordering functionality",
                      "Special instructions and customization handling"
                    ]
                  },
                  {
                    title: "Payment Processing",
                    icon: <CreditCard className="w-6 h-6 text-orange-400" />,
                    color: "orange",
                    features: [
                      "Secure Cashfree payment gateway integration",
                      "Support for all major payment methods (cards, UPI, net banking)",
                      "Automatic payment confirmation and order processing",
                      "Transaction history and financial reporting",
                      "Refund processing and dispute management",
                      "PCI DSS compliant security with encryption"
                    ]
                  },
                  {
                    title: "Analytics & Reporting",
                    icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
                    color: "cyan",
                    features: [
                      "Comprehensive sales reports with customizable date ranges",
                      "Popular items analysis and menu optimization insights",
                      "Customer behavior tracking and preference analysis",
                      "Peak hours identification and staff scheduling optimization",
                      "Revenue tracking with profit margin analysis",
                      "Export capabilities for accounting and tax purposes"
                    ]
                  },
                  {
                    title: "User Management & Security",
                    icon: <Users className="w-6 h-6 text-red-400" />,
                    color: "red",
                    features: [
                      "Role-based access control for different staff levels",
                      "Secure user authentication with password requirements",
                      "Activity logging and audit trails for all user actions",
                      "Permission management for sensitive operations",
                      "Multi-device access with session management",
                      "Data encryption and privacy protection compliance"
                    ]
                  }
                ].map((section, index) => (
                  <div key={index} className={`bg-${section.color}-500/10 border border-${section.color}-500/20 rounded-xl p-6`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-12 h-12 bg-${section.color}-500/20 rounded-xl flex items-center justify-center`}>
                        {section.icon}
                      </div>
                      <h3 className={`text-xl font-bold text-${section.color}-400`}>{section.title}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {section.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start text-sm text-gray-400">
                          <CheckCircle className={`w-4 h-4 text-${section.color}-400 mr-2 mt-0.5 flex-shrink-0`} />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Support & Training Included</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Initial Training Program</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Staff Training Session</div>
                          <div className="text-gray-400 text-sm">2-hour comprehensive training for all staff members</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Settings className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">System Walkthrough</div>
                          <div className="text-gray-400 text-sm">Complete demonstration of all features and functions</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Eye className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Hands-on Practice</div>
                          <div className="text-gray-400 text-sm">Guided practice sessions with real order scenarios</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Certification</div>
                          <div className="text-gray-400 text-sm">Staff certification upon successful training completion</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Ongoing Support Services</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">24/7 Support Availability</div>
                          <div className="text-gray-400 text-sm">Round-the-clock assistance for critical issues</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <RefreshCw className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Regular Updates</div>
                          <div className="text-gray-400 text-sm">Monthly feature updates and system improvements</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Shield className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Data Security</div>
                          <div className="text-gray-400 text-sm">Daily backups and security monitoring</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Performance Monitoring</div>
                          <div className="text-gray-400 text-sm">Continuous system monitoring and optimization</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <Star className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-green-400 mb-2">Value Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-green-200 text-sm">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Setup Package Value (₹3,999)</h4>
                      <p>• QR Code Stands: ₹1,500 value</p>
                      <p>• Menu Digitization: ₹1,000 value</p>
                      <p>• System Setup: ₹1,000 value</p>
                      <p>• Training & Support: ₹499 value</p>
                      <p className="font-semibold text-green-400 mt-2">Total Value: ₹3,999</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Monthly Subscription Value (₹1,999)</h4>
                      <p>• Platform Access: ₹5,000+ value</p>
                      <p>• 24/7 Support: ₹2,000+ value</p>
                      <p>• Updates & Maintenance: ₹1,000+ value</p>
                      <p>• Analytics & Reports: ₹1,500+ value</p>
                      <p className="font-semibold text-green-400 mt-2">Total Value: ₹9,500+ monthly</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'pricing-structure':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Pricing Structure</h1>
              <p className="text-xl text-gray-300">Simple, transparent pricing with no hidden costs. Pay once for setup, then monthly subscription.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-black/40 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-blue-400" />
                    One-Time Setup Fee
                  </h3>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-blue-400 mb-2">₹3,999*</div>
                    <div className="text-gray-400">One-time payment</div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">What's Included:</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-center">
                        <Check className="w-3 h-3 text-green-400 mr-2" />
                        10 QR Code table stands (₹1,500 value)
                      </li>
                      <li className="flex items-center">
                        <Check className="w-3 h-3 text-green-400 mr-2" />
                        Complete menu digitization (₹1,000 value)
                      </li>
                      <li className="flex items-center">
                        <Check className="w-3 h-3 text-green-400 mr-2" />
                        Restaurant dashboard setup (₹1,000 value)
                      </li>
                      <li className="flex items-center">
                        <Check className="w-3 h-3 text-green-400 mr-2" />
                        Staff training session (₹500 value)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-black/40 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-green-400" />
                    Monthly Subscription
                  </h3>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-green-400 mb-2">₹1,999</div>
                    <div className="text-gray-400">per month</div>
                    <div className="text-sm text-gray-500">Just ₹66/day</div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Monthly Features:</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-center">
                        <Check className="w-3 h-3 text-green-400 mr-2" />
                        Unlimited order processing
                      </li>
                      <li className="flex items-center">
                        <Check className="w-3 h-3 text-green-400 mr-2" />
                        Real-time order tracking
                      </li>
                      <li className="flex items-center">
                        <Check className="w-3 h-3 text-green-400 mr-2" />
                        Menu management system
                      </li>
                      <li className="flex items-center">
                        <Check className="w-3 h-3 text-green-400 mr-2" />
                        Multi-user access control
                      </li>
                      <li className="flex items-center">
                        <Check className="w-3 h-3 text-green-400 mr-2" />
                        Analytics and reports
                      </li>
                      <li className="flex items-center">
                        <Check className="w-3 h-3 text-green-400 mr-2" />
                        24/7 customer support
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">ServeNow Documentation</h1>
              <p className="text-xl text-gray-300">Select a topic from the sidebar to learn more about ServeNow's features and how they work.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/40 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-2">For Restaurant Owners</h3>
                <p className="text-gray-400 mb-4">Learn how ServeNow can digitize your restaurant operations and improve customer experience.</p>
                <Button
                  onClick={() => setActiveSection('introduction')}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Get Started
                </Button>
              </div>

              <div className="bg-black/40 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-2">For Investors</h3>
                <p className="text-gray-400 mb-4">Understand the technology, pricing structure, and business model behind ServeNow.</p>
                <Button
                  onClick={() => setActiveSection('pricing-structure')}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  View Pricing
                </Button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center space-x-2 bg-black/40 backdrop-blur-lg border border-white/10 rounded-lg px-4 py-2 text-white hover:bg-black/60 transition-colors"
          >
            <Menu className="w-5 h-5" />
            <span>Documentation Menu</span>
          </button>
        </div>

        <div className="flex gap-4 lg:gap-8 relative">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
          )}
          
          {/* Sidebar */}
          <div className={`w-72 sm:w-80 flex-shrink-0 lg:block ${
            sidebarOpen 
              ? 'fixed top-0 left-0 h-full bg-black/95 backdrop-blur-xl border-r border-white/10 z-50 overflow-y-auto' 
              : 'hidden'
          } lg:relative lg:bg-transparent lg:border-0 lg:z-auto lg:overflow-visible`}>
            <div className="sticky top-32 space-y-4 lg:space-y-6 p-4 lg:p-0">
              {/* Mobile Close Button */}
              <div className="lg:hidden flex justify-between items-center mb-4 pt-20">
                <h3 className="text-white font-semibold">Documentation</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/40 border-white/10 text-white placeholder-gray-400 text-sm"
                />
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {docSections.map((section) => (
                  <div key={section.id} className="space-y-1">
                    <div className="flex items-center text-white font-medium py-2 px-3 rounded-lg bg-black/20 border border-white/10 text-sm">
                      {section.icon}
                      <span className="ml-2">{section.title}</span>
                    </div>
                    {section.subsections && (
                      <div className="ml-4 space-y-1">
                        {section.subsections.map((subsection) => (
                          <button
                            key={subsection.id}
                            onClick={() => {
                              setActiveSection(subsection.id)
                              setSidebarOpen(false) // Close mobile menu when item is selected
                            }}
                            className={`w-full text-left py-2 px-3 rounded-lg transition-colors text-sm ${activeSection === subsection.id
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                              }`}
                          >
                            {subsection.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-4 sm:p-6 lg:p-8"
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}