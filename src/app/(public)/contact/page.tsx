'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-bold mb-6" style={{ fontSize: '3.75rem' }}>Contact Us</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Have questions or need assistance? Our team is here to help you.
          Reach out to us through any of the channels below.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-card p-8 rounded-lg border shadow-sm"
        >
          <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input id="name" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input id="email" type="email" placeholder="your.email@example.com" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </label>
              <Input id="phone" placeholder="+91 98765 43210" />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Subject
              </label>
              <Input id="subject" placeholder="How can we help you?" />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea 
                id="message" 
                placeholder="Please provide details about your inquiry..." 
                rows={5}
              />
            </div>
            
            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
          
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Office Address</h3>
                <p className="text-muted-foreground">
                  Sijua, Bhubaneswar<br />
                  Odisha 751019<br />
                  India
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Phone Numbers</h3>
                <p className="text-muted-foreground">
                  Customer Support: +91 85217 36139<br />
                  Sales Inquiries: +91 82605 42544<br />
                  Technical Support: +91 96924 02032
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Email Addresses</h3>
                <p className="text-muted-foreground">
                  General Inquiries: bytixcompany@gmail.com<br />
                  Customer Support: bytixcompany@gmail.com<br />
                  Sales: bytixcompany@gmail.com
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Business Hours</h3>
                <p className="text-muted-foreground">
                  Monday - Friday: 9:00 AM - 6:00 PM IST<br />
                  Saturday: 10:00 AM - 2:00 PM IST<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Map Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Find Us</h2>
        <div className="bg-muted h-96 rounded-lg overflow-hidden">
          {/* Replace with actual map integration */}
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">Interactive map will be displayed here</p>
          </div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-2">What are your support hours?</h3>
            <p className="text-muted-foreground">
              Our customer support team is available Monday through Friday from 9:00 AM to 6:00 PM IST, and Saturday from 10:00 AM to 2:00 PM IST.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How quickly will I receive a response?</h3>
            <p className="text-muted-foreground">
              We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please call our support line.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Do you offer on-site support?</h3>
            <p className="text-muted-foreground">
              Yes, we offer on-site support for Enterprise customers in select cities across India. Additional charges may apply.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How can I schedule a demo?</h3>
            <p className="text-muted-foreground">
              You can schedule a product demo by filling out the contact form above or by emailing sales@servenow.com with your preferred date and time.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}