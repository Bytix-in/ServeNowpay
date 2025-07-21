'use client'

import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { ContactForm } from '@/components/forms/ContactForm'

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      details: 'hello@servenow.com',
      description: 'Send us an email anytime!'
    },
    {
      icon: Phone,
      title: 'Phone',
      details: '+1 (555) 123-4567',
      description: 'Mon-Fri from 8am to 6pm PST'
    },
    {
      icon: MapPin,
      title: 'Office',
      details: '123 Business Ave, Suite 100',
      description: 'San Francisco, CA 94105'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Monday - Friday',
      description: '8:00 AM - 6:00 PM PST'
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
          Get in Touch
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Have questions about ServeNow? We'd love to hear from you. 
          Send us a message and we'll respond as soon as possible.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
          <ContactForm />
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-8"
        >
          <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
          
          {contactInfo.map((info, index) => (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="flex items-start space-x-4"
            >
              <div className="bg-primary/10 p-3 rounded-lg">
                <info.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{info.title}</h3>
                <p className="text-foreground mb-1">{info.details}</p>
                <p className="text-muted-foreground text-sm">{info.description}</p>
              </div>
            </motion.div>
          ))}

          {/* Additional Info */}
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold mb-3">Need immediate help?</h3>
            <p className="text-muted-foreground mb-4">
              Check out our comprehensive documentation and FAQ section for quick answers 
              to common questions.
            </p>
            <div className="space-y-2">
              <a href="#" className="block text-primary hover:underline">
                → Documentation
              </a>
              <a href="#" className="block text-primary hover:underline">
                → FAQ
              </a>
              <a href="#" className="block text-primary hover:underline">
                → Community Forum
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}