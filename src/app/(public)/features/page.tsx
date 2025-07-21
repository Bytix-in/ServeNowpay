'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Powerful Features for Modern Restaurants
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
            Everything you need to streamline operations, delight customers, and grow your business.
          </p>
        </motion.div>
      </section>

      {/* Features will be added here as you provide the sections */}
      
      {/* CTA Section */}
      <section className="bg-black py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Restaurant?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Join hundreds of restaurants already using ServeNow to streamline their operations.
            </p>
            <Link href="/contact" className="group">
              <div className="inline-flex items-center bg-white text-black px-8 py-4 rounded-2xl transition-all hover:shadow-lg">
                <span className="text-xl font-bold">Get Started Today</span>
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}