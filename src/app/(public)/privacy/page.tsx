'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react'
import { Comfortaa } from 'next/font/google'

const comfortaa = Comfortaa({ subsets: ['latin'] })

export default function PrivacyPage() {
  return (
    <div className={`min-h-screen bg-black ${comfortaa.className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 pt-32">
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
              <Shield className="w-4 h-4 mr-2" />
              Privacy & Security
            </div>

            <h1 className="text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Privacy Policy
            </h1>
            
            <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Your privacy is important to us. This policy explains how ServeNow collects, uses, and protects your personal information.
            </p>
          </motion.div>
        </section>

        {/* Privacy Content */}
        <section className="bg-black/20 backdrop-blur-md py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-black/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500"
              >
                <div className="prose prose-invert max-w-none">
                  <div className="mb-8">
                    <p className="text-gray-300 mb-4">
                      <strong>Last updated:</strong> January 8, 2025
                    </p>
                    <p className="text-gray-300 mb-4">
                      ServeNow ("we," "our," or "us") is a restaurant management platform operated by Bytix Company. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our digital ordering and restaurant management services.
                    </p>
                    <p className="text-gray-300">
                      By using ServeNow, you agree to the collection and use of information in accordance with this policy. This policy applies to restaurants using our platform, their staff members, and customers placing orders through our system.
                    </p>
                  </div>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <Database className="w-6 h-6 mr-3 text-blue-400" />
                      1. Information We Collect
                    </h2>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">1.1 Restaurant Information</h3>
                      <p className="mb-3 text-gray-300">When restaurants register with ServeNow, we collect:</p>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li><strong>Business Details:</strong> Restaurant name, business registration number, GST number, address, phone number, email address</li>
                        <li><strong>Owner/Manager Information:</strong> Name, contact details, identification for verification purposes</li>
                        <li><strong>Menu Data:</strong> Food items, descriptions, prices, categories, images, dietary information, allergen details</li>
                        <li><strong>Operational Data:</strong> Operating hours, table numbers, seating capacity, special instructions</li>
                        <li><strong>Banking Information:</strong> Bank account details for payment settlements (processed securely through Cashfree)</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">1.2 Staff User Information</h3>
                      <p className="mb-3 text-gray-300">For restaurant staff accounts, we collect:</p>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li><strong>Personal Details:</strong> Name, email address, phone number, role/position</li>
                        <li><strong>Account Information:</strong> Username, encrypted password, role permissions</li>
                        <li><strong>Activity Logs:</strong> Login times, actions performed, order updates, system usage</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">1.3 Customer Information</h3>
                      <p className="mb-3 text-gray-300">When customers place orders through our QR code system, we collect:</p>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li><strong>Order Details:</strong> Name, phone number, table number, order items, quantities, special instructions</li>
                        <li><strong>Payment Information:</strong> Payment method, transaction ID (payment details are processed by Cashfree, not stored by us)</li>
                        <li><strong>Device Information:</strong> IP address, browser type, device type, operating system (for security and analytics)</li>
                        <li><strong>Usage Data:</strong> Pages visited, time spent, menu items viewed, ordering patterns</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">1.4 Automatically Collected Information</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li><strong>System Logs:</strong> Server logs, error reports, performance metrics</li>
                        <li><strong>Analytics Data:</strong> Order volumes, popular items, peak hours, revenue statistics</li>
                        <li><strong>Security Data:</strong> Failed login attempts, suspicious activities, access patterns</li>
                      </ul>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <Eye className="w-6 h-6 mr-3 text-green-400" />
                      2. How We Use Your Information
                    </h2>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">2.1 Service Provision</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li>Process and manage restaurant orders in real-time</li>
                        <li>Facilitate communication between customers, kitchen staff, and service staff</li>
                        <li>Generate QR codes for table-specific menu access</li>
                        <li>Manage digital menus and real-time availability updates</li>
                        <li>Process payments through our integrated Cashfree gateway</li>
                        <li>Provide order tracking and status updates to customers</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">2.2 Business Operations</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li>Generate sales reports, analytics, and business insights for restaurants</li>
                        <li>Monitor system performance and optimize service delivery</li>
                        <li>Manage user accounts and role-based access permissions</li>
                        <li>Process monthly subscription payments and billing</li>
                        <li>Provide customer support and technical assistance</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">2.3 Legal and Security</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li>Comply with applicable laws and regulations</li>
                        <li>Detect and prevent fraudulent transactions and activities</li>
                        <li>Maintain system security and prevent unauthorized access</li>
                        <li>Resolve disputes and investigate complaints</li>
                        <li>Maintain records for tax and accounting purposes</li>
                      </ul>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <UserCheck className="w-6 h-6 mr-3 text-orange-400" />
                      3. Information Sharing and Disclosure
                    </h2>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">3.1 Within the Restaurant Ecosystem</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li><strong>Restaurant Staff:</strong> Order details are shared with authorized kitchen and service staff to fulfill orders</li>
                        <li><strong>Restaurant Management:</strong> Analytics and performance data are provided to restaurant owners and managers</li>
                        <li><strong>Customer Updates:</strong> Order status and notifications are sent to customers who placed orders</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">3.2 Third-Party Service Providers</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li><strong>Cashfree Payment Gateway:</strong> Payment processing and transaction management (they have their own privacy policy)</li>
                        <li><strong>Supabase:</strong> Database hosting and management services with enterprise-grade security</li>
                        <li><strong>Cloud Storage Providers:</strong> For secure storage of menu images and system backups</li>
                        <li><strong>Email Service Providers:</strong> For sending notifications, receipts, and support communications</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">3.3 Legal Requirements</h3>
                      <p className="mb-3 text-gray-300">We may disclose information when required by law or to:</p>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li>Comply with legal processes, court orders, or government requests</li>
                        <li>Enforce our terms of service and protect our rights</li>
                        <li>Investigate fraud, security issues, or technical problems</li>
                        <li>Protect the safety and rights of our users and the public</li>
                      </ul>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                      <p className="text-red-200 text-sm">
                        <strong>Important:</strong> We do not sell, rent, or trade personal information to third parties for marketing purposes. We do not share customer data between different restaurants using our platform.
                      </p>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <Lock className="w-6 h-6 mr-3 text-red-400" />
                      4. Data Security and Protection
                    </h2>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">4.1 Technical Safeguards</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li><strong>Encryption:</strong> All data transmission uses 256-bit SSL/TLS encryption</li>
                        <li><strong>Database Security:</strong> Row-level security (RLS) ensures data isolation between restaurants</li>
                        <li><strong>Authentication:</strong> Multi-factor authentication available for sensitive accounts</li>
                        <li><strong>Access Controls:</strong> Role-based permissions limit data access to authorized personnel only</li>
                        <li><strong>Regular Backups:</strong> Daily automated backups with secure, encrypted storage</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">4.2 Operational Security</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li><strong>Staff Training:</strong> Regular security awareness training for all employees</li>
                        <li><strong>Access Monitoring:</strong> Continuous monitoring of system access and user activities</li>
                        <li><strong>Incident Response:</strong> Established procedures for security incident detection and response</li>
                        <li><strong>Regular Audits:</strong> Periodic security assessments and vulnerability testing</li>
                        <li><strong>Data Minimization:</strong> We collect and retain only necessary information</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">4.3 Payment Security</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li><strong>PCI Compliance:</strong> Cashfree payment gateway is PCI DSS Level 1 compliant</li>
                        <li><strong>No Card Storage:</strong> We do not store credit card or payment details on our servers</li>
                        <li><strong>Secure Tokens:</strong> Payment processing uses secure tokenization</li>
                        <li><strong>Fraud Detection:</strong> Real-time monitoring for suspicious payment activities</li>
                      </ul>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <Database className="w-6 h-6 mr-3 text-purple-400" />
                      5. Data Retention and Deletion
                    </h2>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">5.1 Retention Periods</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li><strong>Order Data:</strong> Retained for 7 years for tax and accounting purposes</li>
                        <li><strong>Customer Information:</strong> Deleted after 2 years of inactivity unless required for legal compliance</li>
                        <li><strong>Payment Records:</strong> Retained for 7 years as required by Indian financial regulations</li>
                        <li><strong>System Logs:</strong> Retained for 1 year for security and troubleshooting purposes</li>
                        <li><strong>Analytics Data:</strong> Aggregated, anonymized data may be retained indefinitely</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">5.2 Account Deletion</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li>Restaurant accounts: Data retained for 90 days after cancellation, then permanently deleted (except legally required records)</li>
                        <li>Staff accounts: Deleted immediately upon removal by restaurant management</li>
                        <li>Customer data: Automatically deleted after 2 years of no ordering activity</li>
                      </ul>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <UserCheck className="w-6 h-6 mr-3 text-cyan-400" />
                      6. Your Rights and Choices
                    </h2>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">6.1 For Restaurant Owners and Staff</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li><strong>Access:</strong> View and download all data associated with your restaurant account</li>
                        <li><strong>Correction:</strong> Update incorrect or outdated information through your dashboard</li>
                        <li><strong>Deletion:</strong> Request deletion of your account and associated data (subject to legal retention requirements)</li>
                        <li><strong>Data Portability:</strong> Export your restaurant data in standard formats</li>
                        <li><strong>Restriction:</strong> Limit processing of your data for specific purposes</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">6.2 For Customers</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li><strong>Access:</strong> Request information about data collected during your orders</li>
                        <li><strong>Deletion:</strong> Request deletion of your personal information (contact us directly)</li>
                        <li><strong>Opt-out:</strong> Choose not to receive promotional communications</li>
                        <li><strong>Correction:</strong> Update incorrect information in your order history</li>
                      </ul>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                      <p className="text-blue-200 text-sm">
                        <strong>How to Exercise Your Rights:</strong> Contact us at bytixcompany@gmail.com with your request. We will respond within 30 days and may require identity verification for security purposes.
                      </p>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <Shield className="w-6 h-6 mr-3 text-green-400" />
                      7. Cookies and Tracking Technologies
                    </h2>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">7.1 Types of Cookies We Use</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li><strong>Essential Cookies:</strong> Required for basic platform functionality (login sessions, security)</li>
                        <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                        <li><strong>Preference Cookies:</strong> Remember user settings and preferences</li>
                        <li><strong>Security Cookies:</strong> Detect suspicious activity and prevent fraud</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">7.2 Managing Cookies</h3>
                      <p className="mb-3 text-gray-300">You can control cookies through your browser settings. However, disabling certain cookies may affect platform functionality.</p>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <Database className="w-6 h-6 mr-3 text-yellow-400" />
                      8. International Data Transfers
                    </h2>
                    <p className="mb-4 text-gray-300">
                      ServeNow operates primarily in India. Your data is stored on servers located in India through our hosting provider Supabase. If we need to transfer data internationally for service provision, we ensure appropriate safeguards are in place to protect your information.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <UserCheck className="w-6 h-6 mr-3 text-red-400" />
                      9. Children's Privacy
                    </h2>
                    <p className="mb-4 text-gray-300">
                      ServeNow is not intended for use by children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information promptly.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <Lock className="w-6 h-6 mr-3 text-orange-400" />
                      10. Data Breach Notification
                    </h2>
                    <p className="mb-4 text-gray-300">
                      In the event of a data breach that may affect your personal information, we will:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-300">
                      <li>Notify affected users within 72 hours of discovering the breach</li>
                      <li>Report to relevant authorities as required by law</li>
                      <li>Provide details about what information was involved</li>
                      <li>Explain steps we're taking to address the breach</li>
                      <li>Recommend actions you can take to protect yourself</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <FileText className="w-6 h-6 mr-3 text-cyan-400" />
                      11. Contact Information
                    </h2>
                    <p className="mb-4 text-gray-300">
                      For any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                    </p>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-300 mb-2">
                            <strong>Company:</strong> Bytix Company
                          </p>
                          <p className="text-gray-300 mb-2">
                            <strong>Email:</strong> bytixcompany@gmail.com
                          </p>
                          <p className="text-gray-300 mb-2">
                            <strong>Phone:</strong> +91 82605 42544
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-300 mb-2">
                            <strong>Address:</strong> Sijua, Bhubaneswar, Odisha 751019, India
                          </p>
                          <p className="text-gray-300 mb-2">
                            <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST
                          </p>
                          <p className="text-gray-300">
                            <strong>Response Time:</strong> Within 48 hours for privacy-related inquiries
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">12. Changes to This Privacy Policy</h2>
                    <p className="mb-4 text-gray-300">
                      We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make changes:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-300">
                      <li>We will update the "Last updated" date at the top of this policy</li>
                      <li>For significant changes, we will notify users via email or platform notifications</li>
                      <li>We will maintain previous versions for reference</li>
                      <li>Continued use of our services after changes constitutes acceptance of the updated policy</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">13. Governing Law</h2>
                    <p className="mb-4 text-gray-300">
                      This Privacy Policy is governed by the laws of India. Any disputes arising from this policy will be subject to the jurisdiction of the courts in Bhubaneswar, Odisha, India.
                    </p>
                  </section>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-3 text-green-400">Acknowledgment</h3>
                    <p className="text-green-200 text-sm">
                      By using ServeNow, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with any part of this policy, please do not use our services.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}