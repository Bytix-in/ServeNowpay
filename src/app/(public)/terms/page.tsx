'use client'

import { motion } from 'framer-motion'
import { FileText, Shield, AlertCircle, CheckCircle, Users, CreditCard, Clock, Gavel } from 'lucide-react'
import { Comfortaa } from 'next/font/google'

const comfortaa = Comfortaa({ subsets: ['latin'] })

export default function TermsPage() {
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
              <FileText className="w-4 h-4 mr-2" />
              Legal Terms
            </div>

            <h1 className="text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Terms of Service
            </h1>
            
            <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              These terms govern your use of ServeNow's restaurant management platform and services.
            </p>
          </motion.div>
        </section>

        {/* Terms Content */}
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
                      These Terms of Service ("Terms") govern your use of ServeNow, a restaurant management platform operated by Bytix Company ("we," "our," or "us"). By accessing or using our services, you agree to be bound by these Terms.
                    </p>
                    <p className="text-gray-300">
                      Please read these Terms carefully before using our services. If you do not agree to these Terms, you may not access or use ServeNow.
                    </p>
                  </div>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <CheckCircle className="w-6 h-6 mr-3 text-blue-400" />
                      1. Acceptance of Terms
                    </h2>
                    <p className="mb-4 text-gray-300">
                      By accessing and using ServeNow's restaurant management platform, you accept and agree to be bound by the terms and provision of this agreement. These Terms and Conditions govern your use of our services, including our website, mobile applications, and related services.
                    </p>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <p className="text-blue-200 text-sm">
                        <strong>Important:</strong> These terms apply to restaurants using our platform, their staff members, and customers placing orders through our system.
                      </p>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <FileText className="w-6 h-6 mr-3 text-green-400" />
                      2. Description of Service
                    </h2>
                    <p className="mb-4 text-gray-300">
                      ServeNow provides a comprehensive restaurant management platform that includes:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <ul className="list-disc pl-6 text-gray-300">
                        <li>Digital menu management and QR code ordering system</li>
                        <li>Real-time order processing and tracking</li>
                        <li>Payment processing through Cashfree gateway</li>
                        <li>Kitchen and service staff management tools</li>
                      </ul>
                      <ul className="list-disc pl-6 text-gray-300">
                        <li>Multi-user access control and role management</li>
                        <li>Analytics and reporting features</li>
                        <li>Customer relationship management tools</li>
                        <li>Technical support and maintenance services</li>
                      </ul>
                    </div>
                    <p className="text-gray-300">
                      Our services are designed to digitize restaurant operations and improve customer dining experiences through contactless ordering and efficient management systems.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <Users className="w-6 h-6 mr-3 text-purple-400" />
                      3. User Accounts and Registration
                    </h2>
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">3.1 Account Creation</h3>
                      <p className="mb-3 text-gray-300">To access certain features of our service, you must register for an account. You agree to:</p>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li>Provide accurate, current, and complete information during registration</li>
                        <li>Maintain and update your account information to keep it accurate and complete</li>
                        <li>Maintain the security of your password and accept responsibility for all activities under your account</li>
                        <li>Notify us immediately of any unauthorized access or security breach</li>
                      </ul>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">3.2 Account Types</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                          <h4 className="font-semibold text-white mb-2">Restaurant Accounts</h4>
                          <ul className="text-sm text-gray-400">
                            <li>• Business verification required</li>
                            <li>• Valid GST registration needed</li>
                            <li>• Bank account for settlements</li>
                            <li>• Authorized signatory details</li>
                          </ul>
                        </div>
                        <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                          <h4 className="font-semibold text-white mb-2">Staff Accounts</h4>
                          <ul className="text-sm text-gray-400">
                            <li>• Created by restaurant management</li>
                            <li>• Role-based access permissions</li>
                            <li>• Activity monitoring enabled</li>
                            <li>• Managed by restaurant owners</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                      <p className="text-yellow-200 text-sm">
                        <strong>Account Responsibility:</strong> You are responsible for all activities that occur under your account. We reserve the right to suspend or terminate accounts that violate these terms.
                      </p>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <CreditCard className="w-6 h-6 mr-3 text-orange-400" />
                      4. Payment Terms and Billing
                    </h2>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">4.1 Subscription Fees</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li><strong>Setup Fee:</strong> One-time payment of ₹3,999 due before service activation</li>
                        <li><strong>Monthly Subscription:</strong> ₹1,999 per month, billed in advance</li>
                        <li><strong>Payment Due Date:</strong> Same date each month as your initial subscription</li>
                        <li><strong>Late Fees:</strong> ₹500 late fee applies after 7 days of non-payment</li>
                        <li><strong>Service Suspension:</strong> Services may be suspended after 15 days of non-payment</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">4.2 Transaction Processing</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li><strong>Payment Gateway:</strong> All customer payments processed through Cashfree</li>
                        <li><strong>Transaction Fees:</strong> Cashfree charges apply as per their fee structure</li>
                        <li><strong>Settlement:</strong> Funds settled to your bank account within 1-2 business days</li>
                        <li><strong>Refunds:</strong> Processed according to our refund policy and Cashfree terms</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">4.3 Taxes and Compliance</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li>All fees are exclusive of applicable taxes (GST, service tax, etc.)</li>
                        <li>You are responsible for all taxes related to your restaurant operations</li>
                        <li>We will provide GST invoices for our services as required by law</li>
                        <li>You must maintain valid GST registration throughout service period</li>
                      </ul>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <Shield className="w-6 h-6 mr-3 text-red-400" />
                      5. Acceptable Use Policy
                    </h2>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">5.1 Permitted Uses</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li>Use the platform for legitimate restaurant business operations</li>
                        <li>Process customer orders and payments in accordance with applicable laws</li>
                        <li>Maintain accurate menu information and pricing</li>
                        <li>Provide quality customer service through our platform</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">5.2 Prohibited Activities</h3>
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                        <p className="text-red-200 text-sm mb-3">
                          <strong>You agree NOT to use our services for:</strong>
                        </p>
                        <ul className="list-disc pl-6 text-red-200 text-sm">
                          <li>Any illegal activities or violation of local, state, or national laws</li>
                          <li>Processing fraudulent or unauthorized transactions</li>
                          <li>Selling prohibited items (alcohol without license, tobacco to minors, etc.)</li>
                          <li>Uploading malicious code, viruses, or harmful software</li>
                          <li>Attempting to gain unauthorized access to our systems</li>
                          <li>Reverse engineering or copying our software</li>
                          <li>Using the platform to compete with or harm our business</li>
                          <li>Violating intellectual property rights of others</li>
                        </ul>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">5.3 Content Standards</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li>Menu content must be accurate and not misleading</li>
                        <li>Food images must represent actual items served</li>
                        <li>Pricing must be current and clearly displayed</li>
                        <li>Allergen information must be accurate and complete</li>
                        <li>No offensive, discriminatory, or inappropriate content</li>
                      </ul>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <AlertCircle className="w-6 h-6 mr-3 text-yellow-400" />
                      6. Service Availability and Support
                    </h2>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">6.1 Service Level Agreement</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li><strong>Uptime Guarantee:</strong> 99.9% uptime excluding scheduled maintenance</li>
                        <li><strong>Planned Maintenance:</strong> Scheduled during low-traffic hours with advance notice</li>
                        <li><strong>Emergency Maintenance:</strong> May occur without notice for critical security issues</li>
                        <li><strong>Service Credits:</strong> Available for extended outages exceeding SLA</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">6.2 Customer Support</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                          <h4 className="font-semibold text-white mb-2">Support Channels</h4>
                          <ul className="text-sm text-gray-400">
                            <li>• Email: bytixcompany@gmail.com</li>
                            <li>• Phone: +91 82605 42544</li>
                            <li>• Live chat on dashboard</li>
                            <li>• Support ticket system</li>
                          </ul>
                        </div>
                        <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                          <h4 className="font-semibold text-white mb-2">Response Times</h4>
                          <ul className="text-sm text-gray-400">
                            <li>• Critical issues: Within 2 hours</li>
                            <li>• General support: Within 24 hours</li>
                            <li>• Feature requests: Within 48 hours</li>
                            <li>• Billing inquiries: Within 24 hours</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <Clock className="w-6 h-6 mr-3 text-cyan-400" />
                      7. Termination and Cancellation
                    </h2>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">7.1 Termination by You</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li>You may cancel your subscription at any time with 30 days written notice</li>
                        <li>Cancellation takes effect at the end of your current billing period</li>
                        <li>No refunds for partial months or unused services</li>
                        <li>Data export available for 90 days after cancellation</li>
                        <li>Setup fees are non-refundable after service activation</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">7.2 Termination by Us</h3>
                      <p className="mb-3 text-gray-300">We may terminate your account immediately if you:</p>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li>Violate these Terms of Service or our Acceptable Use Policy</li>
                        <li>Fail to pay fees for more than 30 days</li>
                        <li>Engage in fraudulent or illegal activities</li>
                        <li>Compromise the security or integrity of our systems</li>
                        <li>Provide false information during registration or use</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">7.3 Effect of Termination</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li>Immediate cessation of access to our services</li>
                        <li>Data retention for 90 days, then permanent deletion</li>
                        <li>Outstanding payments remain due and payable</li>
                        <li>Return of any physical materials (QR code stands) may be required</li>
                      </ul>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <Shield className="w-6 h-6 mr-3 text-green-400" />
                      8. Intellectual Property Rights
                    </h2>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">8.1 Our Intellectual Property</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li>ServeNow platform, software, and technology are owned by Bytix Company</li>
                        <li>All trademarks, logos, and brand names are our property</li>
                        <li>You receive a limited, non-exclusive license to use our services</li>
                        <li>No rights to modify, distribute, or create derivative works</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">8.2 Your Content</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li>You retain ownership of your restaurant data, menu content, and images</li>
                        <li>You grant us license to use your content to provide our services</li>
                        <li>You are responsible for ensuring you have rights to all content you upload</li>
                        <li>You must not infringe on others' intellectual property rights</li>
                      </ul>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <AlertCircle className="w-6 h-6 mr-3 text-red-400" />
                      9. Disclaimers and Limitation of Liability
                    </h2>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">9.1 Service Disclaimers</h3>
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                        <ul className="list-disc pl-6 text-red-200 text-sm">
                          <li>Services provided "as is" without warranties of any kind</li>
                          <li>We do not guarantee uninterrupted or error-free service</li>
                          <li>We are not responsible for third-party service failures (Cashfree, internet providers)</li>
                          <li>We do not guarantee specific business results or revenue increases</li>
                        </ul>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">9.2 Limitation of Liability</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li>Our liability is limited to the amount paid by you in the 12 months preceding the claim</li>
                        <li>We are not liable for indirect, incidental, or consequential damages</li>
                        <li>We are not responsible for lost profits, data, or business opportunities</li>
                        <li>You agree to indemnify us against claims arising from your use of our services</li>
                      </ul>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                      <Gavel className="w-6 h-6 mr-3 text-purple-400" />
                      10. Dispute Resolution and Governing Law
                    </h2>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">10.1 Governing Law</h3>
                      <ul className="list-disc pl-6 mb-4 text-gray-300">
                        <li>These Terms are governed by the laws of India</li>
                        <li>Any disputes will be subject to the jurisdiction of courts in Bhubaneswar, Odisha</li>
                        <li>Indian Consumer Protection Act applies where applicable</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">10.2 Dispute Resolution Process</h3>
                      <ol className="list-decimal pl-6 mb-4 text-gray-300">
                        <li><strong>Direct Communication:</strong> Contact our support team first</li>
                        <li><strong>Formal Complaint:</strong> Submit written complaint with details</li>
                        <li><strong>Mediation:</strong> Attempt resolution through mediation if needed</li>
                        <li><strong>Legal Action:</strong> Court proceedings as last resort</li>
                      </ol>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">11. Changes to Terms</h2>
                    <ul className="list-disc pl-6 mb-4 text-gray-300">
                      <li>We may update these Terms from time to time</li>
                      <li>Significant changes will be communicated via email or platform notifications</li>
                      <li>Continued use after changes constitutes acceptance of new terms</li>
                      <li>You may terminate your account if you disagree with changes</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">12. Contact Information</h2>
                    <p className="mb-4 text-gray-300">
                      For questions about these Terms of Service, please contact us:
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
                            <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST
                          </p>
                          <p className="text-gray-300">
                            <strong>Legal Inquiries:</strong> Within 48 hours response time
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-3 text-green-400">Acknowledgment</h3>
                    <p className="text-green-200 text-sm">
                      By using ServeNow, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between you and Bytix Company.
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