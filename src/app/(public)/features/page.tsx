'use client'

import { motion } from 'framer-motion'
import { 
  Zap, 
  Shield, 
  Database, 
  Users, 
  BarChart3, 
  Clock, 
  Smartphone, 
  Globe,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function FeaturesPage() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built with Next.js 14 and optimized for speed. Your customers will love the instant loading times.',
      benefits: ['Sub-second page loads', 'Optimized images', 'Edge caching']
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with end-to-end encryption and compliance with industry standards.',
      benefits: ['SOC 2 compliant', 'GDPR ready', '99.9% uptime SLA']
    },
    {
      icon: Database,
      title: 'Real-time Data',
      description: 'Powered by Supabase for real-time updates and seamless data synchronization.',
      benefits: ['Live updates', 'Offline support', 'Auto-sync']
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Built for teams with role-based access control and collaborative features.',
      benefits: ['Role management', 'Team workspaces', 'Activity tracking']
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive analytics and reporting to help you make data-driven decisions.',
      benefits: ['Custom dashboards', 'Export reports', 'Real-time metrics']
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to help you succeed with our platform.',
      benefits: ['Live chat', 'Email support', 'Knowledge base']
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Responsive design that works perfectly on all devices and screen sizes.',
      benefits: ['PWA support', 'Touch optimized', 'Offline capable']
    },
    {
      icon: Globe,
      title: 'Global Scale',
      description: 'Built to scale globally with CDN distribution and multi-region support.',
      benefits: ['Global CDN', 'Multi-region', 'Auto-scaling']
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
        <h1 className="text-4xl font-bold mb-6">
          Powerful Features for Modern Businesses
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Everything you need to build, scale, and manage your SaaS application. 
          From real-time data to enterprise security, we've got you covered.
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow"
          >
            <feature.icon className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
            <p className="text-muted-foreground mb-4">{feature.description}</p>
            <ul className="space-y-2">
              {feature.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  {benefit}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center bg-primary/5 p-8 rounded-lg"
      >
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-6">
          Join thousands of businesses already using ServeNow to power their operations.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg">
            Start Free Trial
          </Button>
          <Button variant="outline" size="lg">
            Schedule Demo
          </Button>
        </div>
      </motion.div>
    </div>
  )
}