'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  XCircle, 
  RefreshCw, 
  ArrowLeft,
  Phone,
  AlertTriangle,
  CreditCard,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

interface OrderDetails {
  id: string
  restaurant_id: string
  customer_name: string
  customer_phone: string
  table_number: string
  items: any[]
  total_amount: number
  status: string
  payment_status: string
  payment_error?: string
  created_at: string
  restaurant?: {
    name: string
    address: string
    phone_number: string
    email: string
  }
}

export default function PaymentFailurePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)

  const orderId = searchParams.get('order_id')
  const errorReason = searchParams.get('reason')

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    } else {
      setLoading(false)
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      
      if (!orderId) {
        return
      }
      
      const response = await fetch(`/api/orders/${orderId}`)
      const data = await response.json()
      
      if (data.success && data.order) {
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('name, address, phone_number, email')
          .eq('id', data.order.restaurant_id)
          .single()

        if (!restaurantError && restaurantData) {
          setOrder({ ...data.order, restaurant: restaurantData })
        } else {
          setOrder({ ...data.order, restaurant: null })
        }
      }
    } catch (err) {
      // Handle error silently for now
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const retryPayment = async () => {
    if (!order) return

    setRetrying(true)
    try {
      // Create a new payment session for the same order
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: order.restaurant_id,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          table_number: order.table_number,
          items: order.items,
          total_amount: order.total_amount,
          retry_order_id: order.id // Flag to indicate this is a retry
        })
      })

      if (response.ok) {
        const paymentData = await response.json()
        
        if (paymentData.payment_session_id) {
          // Initialize Cashfree Checkout for retry
          if (typeof window !== 'undefined' && (window as any).Cashfree) {
            const cashfree = (window as any).Cashfree({
              mode: paymentData.environment === 'production' ? 'production' : 'sandbox'
            })

            const checkoutOptions = {
              paymentSessionId: paymentData.payment_session_id,
              returnUrl: `${window.location.origin}/payment/success?order_id=${paymentData.order_id}`,
            }

            cashfree.checkout(checkoutOptions).then((result: any) => {
              if (result.error) {
                console.error('Payment retry failed:', result.error)
                alert('Payment retry failed. Please try again.')
              }
            })
          }
        }
      } else {
        throw new Error('Failed to retry payment')
      }
    } catch (error) {
      console.error('Error retrying payment:', error)
      alert('Unable to retry payment. Please contact the restaurant.')
    } finally {
      setRetrying(false)
    }
  }

  const getErrorMessage = () => {
    if (errorReason) {
      switch (errorReason.toLowerCase()) {
        case 'user_cancelled':
          return 'You cancelled the payment process.'
        case 'payment_failed':
          return 'Your payment could not be processed. Please check your payment method and try again.'
        case 'insufficient_funds':
          return 'Insufficient funds in your account. Please try with a different payment method.'
        case 'card_declined':
          return 'Your card was declined. Please try with a different card or payment method.'
        case 'network_error':
          return 'Network error occurred during payment. Please check your internet connection and try again.'
        case 'timeout':
          return 'Payment session timed out. Please try again.'
        default:
          return 'Payment failed due to an unknown error. Please try again.'
      }
    }
    return 'Payment could not be completed. Please try again or contact support.'
  }

  const getHelpText = () => {
    return [
      'Check your internet connection',
      'Ensure your payment method has sufficient funds',
      'Try using a different payment method',
      'Contact your bank if the issue persists',
      'Reach out to the restaurant for assistance'
    ]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Failure Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            {getErrorMessage()}
          </p>
        </motion.div>

        {/* Error Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-6"
        >
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">What happened?</h2>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{getErrorMessage()}</p>
          </div>

          {order && (
            <div className="space-y-3">
              <div className="border-b pb-3">
                <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Restaurant:</strong> {order.restaurant?.name}</p>
                  <p><strong>Customer:</strong> {order.customer_name}</p>
                  <p><strong>Table:</strong> {order.table_number}</p>
                  <p><strong>Amount:</strong> {formatCurrency(order.total_amount)}</p>
                  <p><strong>Order ID:</strong> #{order.id.slice(-8)}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Help Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-start">
            <HelpCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Troubleshooting Tips</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                {getHelpText().map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-1 h-1 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          {order && (
            <>
              <Button
                onClick={retryPayment}
                disabled={retrying}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {retrying ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                {retrying ? 'Retrying...' : 'Retry Payment'}
              </Button>

              {order.restaurant?.phone_number && (
                <Button
                  onClick={() => window.open(`tel:${order.restaurant?.phone_number}`)}
                  variant="outline"
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Restaurant
                </Button>
              )}
            </>
          )}
        </motion.div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500">
            Still having trouble? Contact our support team for assistance.
          </p>
        </motion.div>
      </div>
    </div>
  )
}