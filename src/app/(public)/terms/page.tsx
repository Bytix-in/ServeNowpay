'use client'

import { motion } from 'framer-motion'

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
                <p className="text-muted-foreground mb-8">
                    Last updated: {new Date().toLocaleDateString('en-IN')}
                </p>

                <div className="prose prose-lg max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                        <p className="mb-4">
                            By accessing and using ServeNow's restaurant management platform, you accept and agree to be bound by the terms and provision of this agreement. These Terms and Conditions govern your use of our services, including our website, mobile applications, and related services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                        <p className="mb-4">
                            ServeNow provides a comprehensive restaurant management platform that includes:
                        </p>
                        <ul className="list-disc pl-6 mb-4">
                            <li>Digital menu management and QR code ordering system</li>
                            <li>Payment processing and billing solutions</li>
                            <li>Order management and kitchen display systems</li>
                            <li>Customer relationship management tools</li>
                            <li>Analytics and reporting features</li>

                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Registration</h2>
                        <p className="mb-4">
                            To access certain features of our service, you must register for an account. You agree to:
                        </p>
                        <ul className="list-disc pl-6 mb-4">
                            <li>Provide accurate, current, and complete information during registration</li>
                            <li>Maintain and update your account information</li>
                            <li>Keep your login credentials secure and confidential</li>
                            <li>Accept responsibility for all activities under your account</li>
                            <li>Notify us immediately of any unauthorized use of your account</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
                        <p className="mb-4">
                            All pricing is displayed in Indian Rupees (INR). Payment terms include:
                        </p>
                        <ul className="list-disc pl-6 mb-4">
                            <li>All product and service pricing is exclusively in Indian Rupees (INR)</li>
                            <li>Subscription fees are billed monthly or annually in advance</li>
                            <li>Transaction fees apply to payment processing services</li>
                            <li>All fees are non-refundable except as specified in our refund policy</li>
                            <li>We reserve the right to change pricing with 30 days notice</li>
                            <li>Failure to pay may result in service suspension or termination</li>
                            <li>18% GST will be added to all purchases as per Indian tax regulations</li>
                            <li>International customers will be billed in INR with conversion handled by payment processor</li>
                        </ul>
                        <p className="mb-4">
                            <strong>Currency Policy:</strong> ServeNow operates exclusively in Indian Rupees (INR) for all transactions.
                            We do not accept payments in other currencies. Exchange rates for international customers are determined
                            by your payment provider at the time of transaction.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use Policy</h2>
                        <p className="mb-4">
                            You agree not to use our service to:
                        </p>
                        <ul className="list-disc pl-6 mb-4">
                            <li>Violate any applicable laws or regulations</li>
                            <li>Infringe on intellectual property rights</li>
                            <li>Transmit harmful, offensive, or inappropriate content</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Interfere with the proper functioning of our services</li>
                            <li>Use our service for fraudulent or illegal activities</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">6. Data Privacy and Security</h2>
                        <p className="mb-4">
                            We are committed to protecting your privacy and data security. Our data practices include:
                        </p>
                        <ul className="list-disc pl-6 mb-4">
                            <li>Compliance with applicable data protection laws</li>
                            <li>Secure storage and transmission of your data</li>
                            <li>Limited data sharing only as necessary for service provision</li>
                            <li>Regular security audits and updates</li>
                            <li>User control over personal data and privacy settings</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
                        <p className="mb-4">
                            ServeNow and its licensors own all intellectual property rights in our service. You retain ownership of your content but grant us necessary licenses to provide our services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">8. Service Availability</h2>
                        <p className="mb-4">
                            While we strive for 99.9% uptime, we cannot guarantee uninterrupted service. We reserve the right to modify, suspend, or discontinue any part of our service with reasonable notice.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                        <p className="mb-4">
                            To the maximum extent permitted by law, ServeNow shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
                        <p className="mb-4">
                            Either party may terminate this agreement at any time. Upon termination, your access to our service will cease, and we may delete your data according to our data retention policy.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
                        <p className="mb-4">
                            These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Bangalore, India.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
                        <p className="mb-4">
                            If you have any questions about these Terms and Conditions, please contact us at:
                        </p>
                        <ul className="list-none mb-4">
                            <li>Email: legal@servenow.com</li>
                            <li>Phone: +91 9876543210</li>
                            <li>Address: 123 Tech Park, Sector 15, Bangalore, India</li>
                        </ul>
                    </section>
                </div>
            </motion.div>
        </div>
    )
}