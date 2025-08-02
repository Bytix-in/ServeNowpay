'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { MapPin, Phone, Mail, Clock, Users, Headphones, MessageCircle, CheckCircle, Menu, QrCode, BarChart3, Shield } from 'lucide-react'
import { Comfortaa } from 'next/font/google'

const comfortaa = Comfortaa({ subsets: ['latin'] })

export default function ContactPage() {
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
              <MessageCircle className="w-4 h-4 mr-2" />
              Get in Touch
            </div>

            <h1 className="text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Contact Our Team
            </h1>
            
            <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Ready to transform your restaurant operations? Our experts are here to help you get started with ServeNow's comprehensive restaurant management system.
            </p>
          </motion.div>
        </section>

        {/* Contact Sales Team Section */}
        <section className="bg-black/20 backdrop-blur-md py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Contact Our Sales Team</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Ready to see how ServeNow can transform your restaurant? Our sales experts will provide a personalized demo and help you choose the right solution.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-black/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center group"
              >
                <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30 group-hover:bg-blue-500/30 transition-all duration-300">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Schedule a Demo</h3>
                <p className="text-gray-300 mb-6">
                  Get a personalized walkthrough of our restaurant management system
                </p>
                <button className="w-full bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-semibold border border-white/20 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300">
                  Book Demo
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-black/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center group"
              >
                <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/30 group-hover:bg-green-500/30 transition-all duration-300">
                  <Phone className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Call Sales</h3>
                <p className="text-gray-300 mb-6">
                  Speak directly with our sales team for immediate assistance
                </p>
                <a 
                  href="tel:+918260542544"
                  className="w-full bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-semibold border border-white/20 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 block text-center"
                >
                  +91 82605 42544
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-black/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center group"
              >
                <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30 group-hover:bg-purple-500/30 transition-all duration-300">
                  <Mail className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Email Sales</h3>
                <p className="text-gray-300 mb-6">
                  Send us your requirements and we'll get back to you within 24 hours
                </p>
                <a 
                  href="mailto:bytixcompany@gmail.com"
                  className="w-full bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-semibold border border-white/20 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 block text-center"
                >
                  Send Email
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Contact Section */}
        <section className="bg-black/20 backdrop-blur-md py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-black/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500"
              >
                <h2 className="text-2xl font-semibold text-white mb-6">Send us a message</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-300">
                        Full Name
                      </label>
                      <Input id="name" placeholder="Your name" className="bg-white/10 border-white/20 text-white placeholder-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-300">
                        Email Address
                      </label>
                      <Input id="email" type="email" placeholder="your.email@example.com" className="bg-white/10 border-white/20 text-white placeholder-gray-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-300">
                      Phone Number
                    </label>
                    <Input id="phone" placeholder="+91 98765 43210" className="bg-white/10 border-white/20 text-white placeholder-gray-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-gray-300">
                      Subject
                    </label>
                    <Input id="subject" placeholder="How can we help you?" className="bg-white/10 border-white/20 text-white placeholder-gray-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-gray-300">
                      Message
                    </label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us about your restaurant and how we can help..." 
                      rows={5}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-white/10 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300"
                  >
                    Send Message
                  </button>
                </form>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-black/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500"
              >
                <h2 className="text-2xl font-semibold text-white mb-6">Contact Information</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-red-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 border border-red-500/30">
                      <MapPin className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">Office Address</h3>
                      <p className="text-gray-300">
                        Sijua, Bhubaneswar<br />
                        Odisha 751019<br />
                        India
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 border border-green-500/30">
                      <Phone className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">Phone Numbers</h3>
                      <p className="text-gray-300">
                        Customer Support: +91 85217 36139<br />
                        Sales Inquiries: +91 82605 42544<br />
                        Technical Support: +91 96924 02032
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 border border-blue-500/30">
                      <Mail className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">Email Addresses</h3>
                      <p className="text-gray-300">
                        General Inquiries: bytixcompany@gmail.com<br />
                        Customer Support: bytixcompany@gmail.com<br />
                        Sales: bytixcompany@gmail.com
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-yellow-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 border border-yellow-500/30">
                      <Clock className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">Business Hours</h3>
                      <p className="text-gray-300">
                        Monday - Friday: 9:00 AM - 6:00 PM IST<br />
                        Saturday: 10:00 AM - 2:00 PM IST<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* System Features Section */}
        <section className="bg-black/20 backdrop-blur-md py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-6">What's Included in ServeNow</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Our comprehensive restaurant management system includes all the features you need to run your restaurant efficiently.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-black/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center group"
              >
                <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30 group-hover:bg-blue-500/30 transition-all duration-300">
                  <Menu className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Menu Management</h3>
                <p className="text-gray-400 text-sm">Digital menu creation and real-time updates</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-black/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center group"
              >
                <div className="w-12 h-12 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4 border border-green-500/30 group-hover:bg-green-500/30 transition-all duration-300">
                  <QrCode className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">QR Code Ordering</h3>
                <p className="text-gray-400 text-sm">Contactless ordering system for customers</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-black/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center group"
              >
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30 group-hover:bg-purple-500/30 transition-all duration-300">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Analytics Dashboard</h3>
                <p className="text-gray-400 text-sm">Real-time insights and reporting</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-black/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center group"
              >
                <div className="w-12 h-12 bg-red-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-500/30 group-hover:bg-red-500/30 transition-all duration-300">
                  <Shield className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Secure Access</h3>
                <p className="text-gray-400 text-sm">Role-based user management system</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="bg-black/20 backdrop-blur-md py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-black/80 backdrop-blur-lg p-12 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 text-center max-w-4xl mx-auto"
            >
              <div className="w-16 h-16 bg-orange-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-500/30">
                <Headphones className="w-8 h-8 text-orange-400" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-6">24/7 Support Available</h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Our dedicated support team is here to help you succeed. Get assistance with setup, training, and ongoing support whenever you need it.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Quick Response</h3>
                  <p className="text-gray-400 text-sm">24-hour response guarantee</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Users className="w-6 h-6 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Expert Team</h3>
                  <p className="text-gray-400 text-sm">Restaurant industry specialists</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Phone className="w-6 h-6 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Multiple Channels</h3>
                  <p className="text-gray-400 text-sm">Phone, email, and chat support</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="tel:+918521736139"
                  className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300"
                >
                  Call Support: +91 85217 36139
                </a>
                <a 
                  href="mailto:bytixcompany@gmail.com"
                  className="bg-transparent text-white px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-white/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300"
                >
                  Email Support
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}