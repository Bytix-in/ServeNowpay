'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function ProductsPage() {
  const products = [
    {
      id: 'pos',
      name: 'Point of Sale System',
      description: 'Complete restaurant POS solution with order management, billing, and inventory tracking.',
      price: '₹15,999',
      period: '/month',
      features: [
        'Cloud-based POS software',
        'Touchscreen interface',
        'Order management',
        'Inventory tracking',
        'User management',
        'Reporting and analytics',
        'Multi-location support',
        '24/7 technical support'
      ],
      image: '/images/products/pos.jpg'
    },
    {
      id: 'qr-ordering',
      name: 'QR Code Ordering System',
      description: 'Contactless digital menu and ordering system with QR code integration.',
      price: '₹7,999',
      period: '/month',
      features: [
        'Digital menu management',
        'QR code generation',
        'Mobile-friendly interface',
        'Real-time order updates',
        'Payment integration',
        'Menu customization',
        'Multi-language support',
        'Customer feedback collection'
      ],
      image: '/images/products/qr-ordering.jpg'
    },
    {
      id: 'kitchen-display',
      name: 'Kitchen Display System',
      description: 'Streamline kitchen operations with digital order display and management.',
      price: '₹5,999',
      period: '/month',
      features: [
        'Real-time order display',
        'Order timing and tracking',
        'Course management',
        'Recipe display',
        'Order prioritization',
        'Multi-station support',
        'Performance analytics',
        'Integration with POS'
      ],
      image: '/images/products/kitchen-display.jpg'
    },
    {
      id: 'inventory',
      name: 'Inventory Management',
      description: 'Advanced inventory control system for restaurants and food businesses.',
      price: '₹8,999',
      period: '/month',
      features: [
        'Stock tracking and alerts',
        'Supplier management',
        'Purchase order creation',
        'Recipe costing',
        'Waste management',
        'Inventory forecasting',
        'Barcode scanning',
        'Inventory reports'
      ],
      image: '/images/products/inventory.jpg'
    },
    {
      id: 'crm',
      name: 'Customer Relationship Management',
      description: 'Build customer loyalty with advanced CRM tools designed for restaurants.',
      price: '₹6,999',
      period: '/month',
      features: [
        'Customer database',
        'Loyalty program',
        'Automated marketing',
        'Reservation management',
        'Customer feedback',
        'Birthday/anniversary reminders',
        'Customer segmentation',
        'Campaign analytics'
      ],
      image: '/images/products/crm.jpg'
    },
    {
      id: 'analytics',
      name: 'Business Analytics',
      description: 'Comprehensive analytics and reporting tools for data-driven decisions.',
      price: '₹9,999',
      period: '/month',
      features: [
        'Sales analytics',
        'Menu performance',
        'User productivity',
        'Customer behavior',
        'Customizable dashboards',
        'Scheduled reports',
        'Data export options',
        'Trend forecasting'
      ],
      image: '/images/products/analytics.jpg'
    }
  ]

  const services = [
    {
      id: 'implementation',
      name: 'Implementation Services',
      description: 'Professional setup and implementation of ServeNow systems.',
      price: '₹25,000',
      type: 'one-time',
      details: [
        'System configuration',
        'Menu setup',
        'User training',
        'Data migration',
        'Hardware installation',
        'Integration with existing systems',
        'Custom workflow setup',
        'Go-live support'
      ]
    },
    {
      id: 'training',
      name: 'User Training',
      description: 'Comprehensive training programs for restaurant users.',
      price: '₹15,000',
      type: 'per session',
      details: [
        'POS system training',
        'Kitchen display system training',
        'Inventory management training',
        'Manager dashboard training',
        'Reporting and analytics training',
        'Troubleshooting basics',
        'Best practices workshop',
        'Training materials and documentation'
      ]
    },
    {
      id: 'custom-dev',
      name: 'Custom Development',
      description: 'Tailored solutions to meet specific business requirements.',
      price: '₹2,000',
      type: 'per hour',
      details: [
        'Custom feature development',
        'Third-party integrations',
        'API customization',
        'Workflow automation',
        'Custom reporting',
        'Mobile app customization',
        'White-labeling',
        'Enterprise integrations'
      ]
    },
    {
      id: 'support',
      name: 'Premium Support',
      description: 'Enhanced support options for priority assistance.',
      price: '₹12,999',
      type: 'per month',
      details: [
        'Dedicated support manager',
        'Priority ticket handling',
        '24/7 phone support',
        'Monthly system health check',
        'Performance optimization',
        'Regular system updates',
        'Preventive maintenance',
        'Emergency on-site support'
      ]
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
          Our Products and Services
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Comprehensive restaurant management solutions designed to streamline operations,
          enhance customer experience, and boost your bottom line.
        </p>
      </motion.div>

      {/* Products Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-48 bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Product Image</p>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-muted-foreground mb-4">{product.description}</p>
                <div className="mb-4">
                  <span className="text-2xl font-bold">{product.price}</span>
                  <span className="text-muted-foreground">{product.period}</span>
                </div>
                <ul className="mb-6 space-y-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full">Learn More</Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">Professional Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold mb-2">{service.name}</h3>
              <p className="text-muted-foreground mb-4">{service.description}</p>
              <div className="mb-4">
                <span className="text-2xl font-bold">{service.price}</span>
                <span className="text-muted-foreground"> {service.type}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {service.details.map((detail, i) => (
                  <div key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full">Request Service</Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-primary/10 rounded-lg p-8 text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Need a customized solution?</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Our team can create tailored packages combining our products and services
          to perfectly match your restaurant's unique requirements.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button>Schedule a Consultation</Button>
          <Button variant="outline">View Case Studies</Button>
        </div>
      </motion.div>

      {/* Pricing Note */}
      <div className="mt-16 text-center text-muted-foreground">
        <p>All prices are listed in Indian Rupees (INR) and are exclusive of applicable taxes.</p>
        <p>18% GST will be added to all purchases as per Indian tax regulations.</p>
      </div>
    </div>
  )
}