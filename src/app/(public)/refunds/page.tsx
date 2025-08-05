'use client'

import { motion } from 'framer-motion'
import { XCircle, AlertTriangle, Clock, CheckCircle, FileText, CreditCard, Calendar, Shield } from 'lucide-react'

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-6 border border-white/20">
              <CreditCard className="w-4 h-4 mr-2" />
              Refund & Cancellation Policy
            </div>
            <h1 className="text-5xl font-bold mb-6">Refunds and Cancellations Policy</h1>
            <p className="text-gray-300 text-lg">
              Clear policies regarding refunds and cancellations for ServeNow restaurant management services.
            </p>
          </div>

          <div className="bg-black/80 backdrop-blur-lg p-8 rounded-3xl border border-white/10">
            <div className="mb-8">
              <p className="text-gray-300 mb-4">
                <strong>Last updated:</strong> January 8, 2025
              </p>
              <p className="text-gray-300 mb-4">
                This Refunds and Cancellations Policy outlines the terms and conditions for refunds and cancellations of ServeNow restaurant management services operated by Bytix Company.
              </p>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold text-red-400 mb-2">Important Notice</h3>
                    <p className="text-red-200 text-sm">
                      <strong>NO REFUNDS POLICY:</strong> ServeNow operates under a strict no-refunds policy for all services. 
                      All payments made for setup fees and monthly subscriptions are final and non-refundable under any circumstances.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                <XCircle className="w-6 h-6 mr-3 text-red-400" />
                1. No Refunds Policy
              </h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-white">1.1 Setup Fee - No Refunds</h3>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                  <p className="text-red-200 text-sm mb-3">
                    <strong>The one-time setup fee of ₹3,999 is completely non-refundable once any of the following services have been initiated:</strong>
                  </p>
                  <ul className="list-disc pl-6 text-red-200 text-sm">
                    <li>Initial consultation and requirements gathering has been completed</li>
                    <li>Menu digitization process has begun</li>
                    <li>QR code stands have been manufactured or delivered</li>
                    <li>Restaurant profile has been created in our system</li>
                    <li>Staff training session has been scheduled or conducted</li>
                    <li>Any technical setup work has commenced</li>
                  </ul>
                </div>
                <p className="text-gray-300 text-sm">
                  <strong>Reason:</strong> The setup fee covers physical materials, professional services, and customization work that cannot be reversed or reused for other restaurants.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-white">1.2 Monthly Subscription - No Refunds</h3>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                  <p className="text-red-200 text-sm mb-3">
                    <strong>Monthly subscription fees of ₹1,999 are non-refundable for any reason, including:</strong>
                  </p>
                  <ul className="list-disc pl-6 text-red-200 text-sm">
                    <li>Partial month usage (no pro-rated refunds)</li>
                    <li>Service dissatisfaction or change of mind</li>
                    <li>Business closure or change in business model</li>
                    <li>Technical issues or temporary service disruptions</li>
                    <li>Force majeure events (natural disasters, pandemics, etc.)</li>
                    <li>Changes in local regulations or business environment</li>
                    <li>Staff turnover or inability to use the system</li>
                    <li>Competition or better offers from other providers</li>
                  </ul>
                </div>
                <p className="text-gray-300 text-sm">
                  <strong>Reason:</strong> Monthly fees are charged in advance for service provision, infrastructure maintenance, and ongoing support costs.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-blue-400" />
                2. Subscription Cancellation Policy
              </h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-white">2.1 Cancellation Eligibility</h3>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                  <p className="text-blue-200 text-sm mb-3">
                    <strong>You may request subscription cancellation ONLY if ALL of the following conditions are met:</strong>
                  </p>
                  <ul className="list-disc pl-6 text-blue-200 text-sm">
                    <li><strong>Minimum Usage Period:</strong> You have used our services for at least 15 consecutive days from activation</li>
                    <li><strong>Account in Good Standing:</strong> No outstanding payments or violations of terms of service</li>
                    <li><strong>Proper Notice:</strong> Written cancellation request submitted at least 30 days before desired cancellation date</li>
                    <li><strong>Data Backup:</strong> You have exported all necessary data from your account</li>
                    <li><strong>Equipment Return:</strong> All physical materials (QR stands) are returned in good condition</li>
                  </ul>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-white">2.2 Cancellation Process</h3>
                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: "Submit Written Request",
                      description: "Send cancellation request to bytixcompany@gmail.com",
                      requirements: [
                        "Include restaurant name and account details",
                        "Specify desired cancellation date (minimum 30 days notice)",
                        "Provide reason for cancellation",
                        "Confirm data export completion"
                      ]
                    },
                    {
                      step: 2,
                      title: "Eligibility Verification",
                      description: "We verify your account meets all cancellation conditions",
                      requirements: [
                        "Check minimum 15-day usage requirement",
                        "Verify no outstanding payments",
                        "Confirm no active disputes or issues",
                        "Review terms of service compliance"
                      ]
                    },
                    {
                      step: 3,
                      title: "Equipment Return",
                      description: "Return all physical materials provided during setup",
                      requirements: [
                        "QR code stands in original condition",
                        "Any additional hardware or materials",
                        "Packaging and shipping costs borne by restaurant",
                        "Items must be received within 7 days of cancellation request"
                      ]
                    },
                    {
                      step: 4,
                      title: "Final Settlement",
                      description: "Complete final billing and account closure",
                      requirements: [
                        "Pay all outstanding monthly fees",
                        "Settle any additional service charges",
                        "Confirm data deletion preferences",
                        "Receive final account statement"
                      ]
                    }
                  ].map((item, index) => (
                    <div key={index} className="bg-black/60 p-5 rounded-xl border border-white/10">
                      <div className="flex items-start space-x-4 mb-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-400 text-sm font-bold">{item.step}</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                          <p className="text-gray-300 text-sm">{item.description}</p>
                        </div>
                      </div>
                      <ul className="list-disc pl-12 text-sm text-gray-400">
                        {item.requirements.map((req, reqIndex) => (
                          <li key={reqIndex}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-white">2.3 Cancellation Restrictions</h3>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                  <p className="text-red-200 text-sm mb-3">
                    <strong>Cancellation will be DENIED if any of the following apply:</strong>
                  </p>
                  <ul className="list-disc pl-6 text-red-200 text-sm">
                    <li>Less than 15 days of service usage from activation date</li>
                    <li>Outstanding payments or overdue fees</li>
                    <li>Violation of terms of service or acceptable use policy</li>
                    <li>Failure to return physical materials in good condition</li>
                    <li>Active disputes or unresolved support tickets</li>
                    <li>Fraudulent activity or misuse of services</li>
                    <li>Insufficient notice period (less than 30 days)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                <Clock className="w-6 h-6 mr-3 text-orange-400" />
                3. Timeline and Processing
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Cancellation Timeline</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Minimum Usage Period:</span>
                      <span className="text-white font-semibold">15 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Notice Period Required:</span>
                      <span className="text-white font-semibold">30 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Processing Time:</span>
                      <span className="text-white font-semibold">7-10 business days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Equipment Return Window:</span>
                      <span className="text-white font-semibold">7 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Data Retention:</span>
                      <span className="text-white font-semibold">90 days</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Important Dates</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-400">Service Activation:</span>
                      <p className="text-white text-xs">Date when restaurant first starts using ServeNow</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Earliest Cancellation Request:</span>
                      <p className="text-white text-xs">15 days after service activation</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Earliest Cancellation Date:</span>
                      <p className="text-white text-xs">45 days after service activation (15 days usage + 30 days notice)</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Final Billing Date:</span>
                      <p className="text-white text-xs">Last day of service before cancellation</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3 text-yellow-400" />
                4. Special Circumstances
              </h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-white">4.1 Force Majeure Events</h3>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
                  <p className="text-yellow-200 text-sm mb-3">
                    <strong>Even in cases of force majeure events, no refunds will be provided:</strong>
                  </p>
                  <ul className="list-disc pl-6 text-yellow-200 text-sm">
                    <li>Natural disasters (earthquakes, floods, cyclones)</li>
                    <li>Pandemics or health emergencies</li>
                    <li>Government-mandated business closures</li>
                    <li>War, terrorism, or civil unrest</li>
                    <li>Internet or power outages beyond our control</li>
                  </ul>
                </div>
                <p className="text-gray-300 text-sm">
                  However, we may offer service credits or extended support on a case-by-case basis at our sole discretion.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                <FileText className="w-6 h-6 mr-3 text-cyan-400" />
                5. Contact Information
              </h2>
              <p className="mb-4 text-gray-300">
                For cancellation requests or questions about this policy, contact us:
              </p>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-300 mb-2">
                      <strong>Email:</strong> bytixcompany@gmail.com
                    </p>
                    <p className="text-gray-300 mb-2">
                      <strong>Phone:</strong> +91 82605 42544
                    </p>
                    <p className="text-gray-300 mb-2">
                      <strong>Subject Line:</strong> "Cancellation Request - [Restaurant Name]"
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
                      <strong>Response Time:</strong> 48-72 hours for cancellation requests
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3 text-red-400">Final Acknowledgment</h3>
              <p className="text-red-200 text-sm mb-3">
                By using ServeNow services, you explicitly acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 text-red-200 text-sm">
                <li>You understand and accept the strict no-refunds policy</li>
                <li>You agree to all cancellation conditions and restrictions</li>
                <li>You acknowledge that all payments are final and non-refundable</li>
                <li>You accept the minimum 15-day usage requirement for cancellation eligibility</li>
                <li>You understand the 30-day notice requirement for cancellation</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}