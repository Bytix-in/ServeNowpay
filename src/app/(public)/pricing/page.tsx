'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '₹2,499',
      period: '/month',
      description: 'Perfect for small restaurants getting started',
      features: [
        { name: 'Up to 5 users', included: true },
        { name: 'Digital menu & QR ordering', included: true },
        { name: 'Basic analytics & reports', included: true },
        { name: 'Email support', included: true },
        { name: 'Payment processing (2.5% fee)', included: true },
        { name: 'Advanced inventory management', included: false },
        { name: 'Custom integrations', included: false },
        { name: 'Priority support', included: false },
        { name: 'Custom branding', included: false }
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '₹6,999',
      period: '/month',
      description: 'Best for growing restaurant businesses',
      features: [
        { name: 'Up to 25 users', included: true },
        { name: 'Advanced menu management', included: true },
        { name: 'Detailed analytics & insights', included: true },
        { name: 'Priority email support', included: true },
        { name: 'Payment processing (2% fee)', included: true },
        { name: 'Advanced inventory management', included: true },
        { name: 'Kitchen display system', included: true },
        { name: 'Customer loyalty program', included: true },
        { name: 'Custom branding', included: false }
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '₹15,999',
      period: '/month',
      description: 'For restaurant chains and large establishments',
      features: [
        { name: 'Unlimited users', included: true },
        { name: 'Multi-location management', included: true },
        { name: 'Enterprise analytics & reporting', included: true },
        { name: '24/7 phone & email support', included: true },
        { name: 'Payment processing (1.5% fee)', included: true },
        { name: 'Advanced inventory & supply chain', included: true },
        { name: 'Custom integrations & API', included: true },
        { name: 'White-label solution', included: true },
        { name: 'Dedicated account manager', included: true }
      ],
      popular: false
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
        <h1 className="text-6xl font-bold mb-6" style={{ fontSize: '3.75rem' }}>
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your business. All plans include a 14-day free trial.
          No setup fees, no hidden costs.
        </p>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className={`relative bg-card p-8 rounded-lg border ${
              plan.popular 
                ? 'border-primary shadow-lg scale-105' 
                : 'hover:shadow-md'
            } transition-all`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-muted-foreground">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <li key={feature.name} className="flex items-center">
                  {feature.included ? (
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground mr-3" />
                  )}
                  <span className={feature.included ? '' : 'text-muted-foreground'}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>

            <Link href="/contact" className="w-full">
              <Button 
                className="w-full" 
                variant={plan.popular ? 'default' : 'outline'}
              >
                Contact Sales
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div>
            <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-muted-foreground">
              All plans come with a 14-day free trial. No credit card required to get started.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept UPI, credit/debit cards, net banking, and NEFT/RTGS transfers for Enterprise plans.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
            <p className="text-muted-foreground">
              Yes, we offer a 30-day money-back guarantee for all paid plans. See our refund policy for details.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Are there any setup fees?</h3>
            <p className="text-muted-foreground">
              No setup fees for Starter and Professional plans. Enterprise plans may have one-time setup costs.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What about GST?</h3>
            <p className="text-muted-foreground">
              All prices are exclusive of GST. 18% GST will be added to your invoice as per Indian tax regulations.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}