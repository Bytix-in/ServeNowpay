'use client'

import { motion } from 'framer-motion'

export default function RefundsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold mb-8">Refunds and Cancellations Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString('en-IN')}
        </p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Overview</h2>
            <p className="mb-4">
              At ServeNow, we want you to be completely satisfied with our restaurant management platform. This policy outlines our refund and cancellation procedures for all our services and subscription plans.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Subscription Refunds</h2>
            <h3 className="text-xl font-semibold mb-3">2.1 Money-Back Guarantee</h3>
            <p className="mb-4">
              We offer a 30-day money-back guarantee for all new subscriptions. If you're not satisfied with our service within the first 30 days, you can request a full refund.
            </p>
            
            <h3 className="text-xl font-semibold mb-3">2.2 Refund Conditions</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Refund requests must be made within 30 days of initial subscription</li>
              <li>Account must not have violated our Terms of Service</li>
              <li>Refunds are processed to the original payment method</li>
              <li>Processing time: 5-10 business days</li>
              <li>One-time refund per customer/business entity</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Cancellation Policy</h2>
            <h3 className="text-xl font-semibold mb-3">3.1 How to Cancel</h3>
            <p className="mb-4">
              You can cancel your subscription at any time through:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Your account dashboard under "Billing & Subscription"</li>
              <li>Contacting our support team at support@servenow.com</li>
              <li>Calling our customer service at +91 9876543210</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3.2 Cancellation Effects</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Service continues until the end of your current billing period</li>
              <li>No additional charges after cancellation</li>
              <li>Data export available for 90 days post-cancellation</li>
              <li>Account reactivation possible within 90 days</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Transaction Processing Fees</h2>
            <h3 className="text-xl font-semibold mb-3">4.1 Payment Processing</h3>
            <p className="mb-4">
              Transaction fees for payment processing are generally non-refundable as they are charged by third-party payment processors. However, exceptions may apply in cases of:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Technical errors on our platform</li>
              <li>Duplicate charges due to system malfunction</li>
              <li>Unauthorized transactions (subject to investigation)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.2 Chargeback Protection</h3>
            <p className="mb-4">
              We provide chargeback protection and will work with you to resolve any disputed transactions with your customers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Partial Refunds</h2>
            <p className="mb-4">
              In certain circumstances, we may offer partial refunds:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Service downtime exceeding our SLA commitments</li>
              <li>Feature unavailability affecting core functionality</li>
              <li>Billing errors or overcharges</li>
              <li>Downgrade requests mid-billing cycle (prorated)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Non-Refundable Items</h2>
            <p className="mb-4">
              The following are generally non-refundable:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Setup fees and onboarding charges</li>
              <li>Custom development work</li>
              <li>Third-party integration costs</li>
              <li>Training and consultation services</li>
              <li>Hardware purchases (tablets, printers, etc.)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Refund Process</h2>
            <h3 className="text-xl font-semibold mb-3">7.1 How to Request a Refund</h3>
            <ol className="list-decimal pl-6 mb-4">
              <li>Contact our support team with your refund request</li>
              <li>Provide your account details and reason for refund</li>
              <li>Our team will review your request within 2 business days</li>
              <li>If approved, refund will be processed within 5-10 business days</li>
              <li>You'll receive confirmation once the refund is completed</li>
            </ol>

            <h3 className="text-xl font-semibold mb-3">7.2 Required Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Account email address</li>
              <li>Transaction ID or invoice number</li>
              <li>Reason for refund request</li>
              <li>Preferred refund method (if different from original payment)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Dispute Resolution</h2>
            <p className="mb-4">
              If you're not satisfied with our refund decision, you can:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Request escalation to our management team</li>
              <li>Provide additional documentation supporting your case</li>
              <li>Seek mediation through consumer protection agencies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p className="mb-4">
              For refund requests or questions about this policy, contact us:
            </p>
            <ul className="list-none mb-4">
              <li><strong>Email:</strong> billing@servenow.com</li>
              <li><strong>Phone:</strong> +91 9876543210</li>
              <li><strong>Support Hours:</strong> Monday-Friday, 9:00 AM - 6:00 PM IST</li>
              <li><strong>Address:</strong> 123 Tech Park, Sector 15, Bangalore, India</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Policy Updates</h2>
            <p className="mb-4">
              We reserve the right to update this refund policy. Changes will be communicated via email and posted on our website. Continued use of our service after changes constitutes acceptance of the updated policy.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}