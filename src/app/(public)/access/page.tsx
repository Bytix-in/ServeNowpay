'use client'

import { motion } from 'framer-motion'
import { Shield, Key, Users, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'

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
      link: '/auth/restaurant-login'
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
      link: '/admin'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <Key className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-6">
          Access Your Dashboard
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose your access level to get started with ServeNow. 
          Each role is designed with specific permissions to match your responsibilities.
        </p>
      </motion.div>

      {/* Access Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {accessLevels.map((level, index) => (
          <motion.div
            key={level.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="bg-card p-8 rounded-lg border hover:shadow-lg transition-shadow"
          >
            <level.icon className="h-12 w-12 text-primary mb-6" />
            <h3 className="text-xl font-bold mb-4">{level.title}</h3>
            <p className="text-muted-foreground mb-6">{level.description}</p>
            
            <ul className="space-y-2 mb-8">
              {level.features.map((feature) => (
                <li key={feature} className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button asChild className="w-full">
              <a href={level.link}>
                Access {level.title.split(' ')[0]} Dashboard
              </a>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-primary/5 p-8 rounded-lg text-center"
      >
        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Secure Access</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          All access levels are protected with enterprise-grade security including 
          two-factor authentication, role-based permissions, and audit logging.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline">
            Learn About Security
          </Button>
          <Button>
            Need Help? Contact Support
          </Button>
        </div>
      </motion.div>
    </div>
  )
}