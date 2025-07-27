'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowLeft,
  RefreshCw,
  Copy,
  CheckCircle
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
  unique_order_id: string | null
  created_at: string
  restaurant?: {
    name: string
    address: string
    phone_number: string
    email: string
  }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function PaymentFallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [copied, setCopied] = useState(false)

  const orderId = searchParams.get('order_id')
  const reason = searchParams.get('reason') || 'verification_timeout'

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    } else {
      setError('No order ID provided')
      setLoading(false)
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      
      if (!orderId) {
        throw new Error('No order ID provided')
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
      } else {
        throw new Error(data.error || 'Order not found')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const verifyPaymentNow = async () => {
    if (!orderId || verifying) return
    
    setVerifying(true)
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId })
      })
      
      const data = await response.json()
      
      if (data.success && data.order) {
        setOrder(prevOrder => ({ 
          ...prevOrder!, 
          ...data.order,
          payment_status: data.payment_status 
        }))
        
        // If payment is now successful, redirect to success page
        if (data.payment_status === 'completed') {
          router.push(`/payment/success?order_id=${orderId}`)
          return
        }
        
        // If payment failed, show updated status
        if (data.payment_status === 'failed') {
          // Status will be reflected in the UI
        }
      }
    } catch (error) {
      console.error('Payment verification failed:', error)
    } finally {
      setVerifying(false)
    }
  }

  const copyOrderId = async () => {
    if (order?.unique_order_id) {
      try {
        await navigator.clipboard.writeText(order.unique_order_id)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = order.unique_order_id
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getStatusInfo = () => {
    if (reason === 'payment_failed' || order?.payment_status === 'failed') {
      return {
        icon: XCircle,
        title: 'Payment Issue Detected',
        message: 'We encountered an issue processing your payment. This could be due to insufficient funds, card restrictions, or technical difficulties. Please contact the restaurant below to resolve this matter and confirm your order status.',
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-900',
        iconColor: 'text-red-600'
      }
    } else if (reason === 'verification_timeout' || order?.payment_status === 'verifying' || order?.payment_status === 'pending') {
      return {
        icon: Clock,
        title: 'Payment Verification Required',
        message: 'Your payment transaction is being processed, but verification is taking longer than usual. This may be due to bank processing delays or system maintenance. Please contact the restaurant below with your order reference to confirm your payment status and order details.',
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-900',
        iconColor: 'text-blue-600'
      }
    } else {
      return {
        icon: AlertTriangle,
        title: 'Order Status Confirmation Needed',
        message: 'We are unable to automatically verify your payment and order status at this time. This could be due to temporary system issues or connectivity problems. Please contact the restaurant below with your order reference for immediate assistance and confirmation.',
        color: 'orange',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-900',
        iconColor: 'text-orange-600'
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load order details'}</p>
          <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                ⚠️ Important Notice
              </h2>
              <div className="prose prose-sm text-gray-700">
                <p className="mb-4">
                  <strong>Dear Customer,</strong>
                </p>
                <p className="mb-4">
                  Unfortunately, we were unable to verify your payment for the recent order. This may be due to one of the following reasons:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                  <li>Your payment was unsuccessful or declined by your bank or UPI service.</li>
                  <li>You may have refreshed, closed, or navigated away from the payment process too early.</li>
                  <li>There was an issue on the platform during the transaction.</li>
                </ul>
                <p className="mb-4">
                  <strong>If you have already completed the payment and the amount was deducted from your account, please contact the restaurant immediately using the contact details provided below.</strong> Our team will help verify and process your order manually.
                </p>
                <p className="mb-3">
                  <strong>What You Should Do:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
                  <li>Contact the restaurant using the information provided below.</li>
                  <li>Share your Order Reference ID to help us locate your transaction.</li>
                  <li>Provide any payment confirmation or proof (if available).</li>
                  <li>Keep this page open while contacting the restaurant for quicker assistance.</li>
                </ul>
                <p className="text-sm text-gray-600">
                  We sincerely apologize for the inconvenience and thank you for your cooperation in resolving this matter quickly.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className={`inline-flex items-center justify-center w-16 h-16 ${statusInfo.bgColor} rounded-full mb-4`}>
            <StatusIcon className={`h-8 w-8 ${statusInfo.iconColor}`} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {statusInfo.title}
          </h1>
        </motion.div>

        {/* Order ID Card */}
        {order.unique_order_id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Order Reference</h2>
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="text-2xl font-mono font-bold text-gray-900">{order.unique_order_id}</p>
              </div>
              <Button
                onClick={copyOrderId}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Please quote this Order ID when contacting the restaurant.
            </p>
          </motion.div>
        )}

        {/* Restaurant Contact Card */}
        {order.restaurant && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Restaurant Contact Information</h2>
              <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Contact Required
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{order.restaurant.name}</h3>
              <p className="text-sm text-gray-600 mb-3">Please contact us immediately for assistance with your order</p>
            </div>
            <div className="space-y-4">
              
              {order.restaurant.phone_number && (
                <div className="flex items-center bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Primary Contact (Recommended)</p>
                    <a 
                      href={`tel:${order.restaurant.phone_number}`}
                      className="text-lg font-bold text-green-700 hover:text-green-900 block"
                    >
                      {order.restaurant.phone_number}
                    </a>
                    <p className="text-xs text-green-600">Tap to call directly</p>
                  </div>
                </div>
              )}

              {order.restaurant.email && (
                <div className="flex items-center border border-gray-200 rounded-lg p-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Email Support</p>
                    <a 
                      href={`mailto:${order.restaurant.email}?subject=Order Support Required - ${order.unique_order_id || order.id}&body=Hello, I need assistance with my order. Order Reference: ${order.unique_order_id || order.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium block"
                    >
                      {order.restaurant.email}
                    </a>
                    <p className="text-xs text-gray-500">Email with order details pre-filled</p>
                  </div>
                </div>
              )}

              {order.restaurant.address && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-gray-900">{order.restaurant.address}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer</span>
              <span className="font-medium">{order.customer_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium">{order.customer_phone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Table</span>
              <span className="font-medium">{order.table_number}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t">
              <span>Total Amount</span>
              <span className="text-green-600">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
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
          
          <Button
            onClick={verifyPaymentNow}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={verifying}
          >
            {verifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Verify Payment Now
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default function PaymentFallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    }>
      <PaymentFallbackContent />
    </Suspense>
  )
}