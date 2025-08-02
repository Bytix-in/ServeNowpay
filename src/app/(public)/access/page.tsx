'use client'

import { motion } from 'framer-motion'
import { Shield, Key, Users, Settings, ArrowRight, Lock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Comfortaa } from 'next/font/google'

const comfortaa = Comfortaa({ subsets: ['latin'] })

export default function AccessPage() {
  const accessLevels = [
    {
      icon: Settings,
      title: 'Restaurant Access',
      description: 'Complete restaurant management access for restaurant owners and operators',
      features: [
        'Full restaurant dashboard',
        'Menu and inventory management',
        'Order and payment tracking',
        'Table management',
        'Analytics and reporting'
      ],
      link: '/auth/restaurant-login',
      color: 'blue'
    },
    {
      icon: Shield,
      title: 'Admin Access',
      description: 'Full system access for administrators and owners',
      features: [
        'All manager permissions',
        'System configuration',
        'User role management',
        'Billing and subscriptions',
        'Security settings',
        'Data export/import'
      ],
      link: '/admin',
      color: 'purple'
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          iconBg: 'bg-blue-500/20',
          iconBorder: 'border-blue-500/30',
          iconColor: 'text-blue-400',
          dotColor: 'bg-blue-400'
        }
      case 'purple':
        return {
          iconBg: 'bg-purple-500/20',
          iconBorder: 'border-purple-500/30',
          iconColor: 'text-purple-400',
          dotColor: 'bg-purple-400'
        }
      default:
        return {
          iconBg: 'bg-gray-500/20',
          iconBorder: 'border-gray-500/30',
          iconColor: 'text-gray-400',
          dotColor: 'bg-gray-400'
        }
    }
  }

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
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-8 border border-white/20">
              <Key className="w-4 h-4 mr-2" />
              Secure Access Portal
            </div>

            <h1 className="text-6xl font-bold text-white mb-8 leading-tight drop-shadow-lg" style={{ fontSize: '3.75rem' }}>
              Access Your Dashboard
            </h1>
            
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Choose your access level to get started with ServeNow. Each role is designed with specific permissions to match your responsibilities and ensure secure operations.
            </p>
          </motion.div>
        </section>

        {/* Access Level Cards */}
        <section className="bg-black/20 backdrop-blur-md py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
              {accessLevels.map((level, index) => {
                const colorClasses = getColorClasses(level.color)
                return (
                  <motion.div
                    key={level.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-black/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group"
                  >
                    <div className={`w-16 h-16 ${colorClasses.iconBg} backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border ${colorClasses.iconBorder} group-hover:${colorClasses.iconBg.replace('/20', '/30')} transition-all duration-300`}>
                      <level.icon className={`w-8 h-8 ${colorClasses.iconColor}`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4">{level.title}</h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">{level.description}</p>
                    
                    <ul className="space-y-3 mb-8">
                      {level.features.map((feature) => (
                        <li key={feature} className="flex items-center text-sm text-gray-300">
                          <div className={`w-2 h-2 ${colorClasses.dotColor} rounded-full mr-3 flex-shrink-0`} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <a 
                      href={level.link}
                      className="group/btn w-full bg-white/10 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 flex items-center justify-center"
                    >
                      Access {level.title.split(' ')[0]} Dashboard
                      <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </a>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Security Notice */}
        <section className="bg-black/20 backdrop-blur-md py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-black/80 backdrop-blur-lg p-12 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center max-w-4xl mx-auto"
            >
              <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-6">Enterprise-Grade Security</h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                All access levels are protected with bank-level security including two-factor authentication, role-based permissions, and comprehensive audit logging.
              </p>

              {/* Security Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Lock className="w-6 h-6 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">2FA Protection</h3>
                  <p className="text-gray-400 text-sm">Multi-factor authentication</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Users className="w-6 h-6 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Role-Based Access</h3>
                  <p className="text-gray-400 text-sm">Granular permissions</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Audit Logging</h3>
                  <p className="text-gray-400 text-sm">Complete activity tracking</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-transparent text-white px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-white/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300">
                  Learn About Security
                </button>
                <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300">
                  Need Help? Contact Support
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}