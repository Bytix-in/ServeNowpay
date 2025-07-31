'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  ArrowLeft,
  User,
  Printer
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

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [verificationTimeout, setVerificationTimeout] = useState(false)
  const [timeoutActive, setTimeoutActive] = useState(false)
  const [countdown, setCountdown] = useState(15)

  const orderId = searchParams.get('order_id')
  const noPayment = searchParams.get('no_payment') === 'true'
  const paymentStatus = searchParams.get('payment_status')
  const orderStatus = searchParams.get('order_status')

  useEffect(() => {
    // Check URL parameters for payment failure indicators
    if (paymentStatus === 'FAILED' || orderStatus === 'FAILED') {
      const reason = searchParams.get('reason') || 'payment_failed'
      router.push(`/payment/failure?order_id=${orderId}&reason=${reason}`)
      return
    }

    if (orderId) {
      fetchOrderDetails()
    } else {
      setError('No order ID provided')
      setLoading(false)
    }
  }, [orderId, paymentStatus, orderStatus, router, searchParams])

  // Set up verification timeout for pending/verifying payments
  useEffect(() => {
    if (order && !noPayment) {
      // Check if payment is not completed or failed
      const needsVerification = order.payment_status !== 'completed' &&
        order.payment_status !== 'failed' &&
        order.payment_status !== 'not_configured'

      if (needsVerification) {
        console.log('Setting up timeout for payment status:', order.payment_status)
        setTimeoutActive(true)
        setCountdown(15)

        // Countdown timer that updates every second
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            const newCount = prev - 1
            if (newCount <= 0) {
              clearInterval(countdownInterval)
              return 0
            }
            return newCount
          })
        }, 1000)

        const timeout = setTimeout(() => {
          console.log('Timeout reached, redirecting to fallback page')
          setVerificationTimeout(true)
          setTimeoutActive(false)
          clearInterval(countdownInterval)
          // Redirect to fallback page after 15 seconds
          router.push(`/payment/fallback?order_id=${orderId}&reason=verification_timeout`)
        }, 15000) // 15 seconds

        return () => {
          console.log('Clearing timeout')
          setTimeoutActive(false)
          clearInterval(countdownInterval)
          clearTimeout(timeout)
        }
      } else {
        setTimeoutActive(false)
        setCountdown(15)
      }
    }
  }, [order, orderId, noPayment, router])

  // Set up Supabase Realtime subscription for payment status changes
  useEffect(() => {
    if (!orderId) return

    // Subscribe to changes on the orders table for this specific order
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          if (payload.new) {
            const updatedOrder = payload.new as OrderDetails
            
            // Update order state with real-time data
            setOrder(prevOrder => ({
              ...updatedOrder,
              restaurant: prevOrder?.restaurant // Keep existing restaurant data
            }))

            // Handle payment status changes
            if (updatedOrder.payment_status === 'completed') {
              setTimeoutActive(false)
              setCountdown(0)
            } else if (updatedOrder.payment_status === 'failed') {
              router.push(`/payment/failure?order_id=${orderId}&reason=payment_failed`)
            }
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [orderId, router])

  // Initial payment verification (only once when component loads)
  useEffect(() => {
    if (order && !noPayment) {
      // Check if payment needs verification
      const needsVerification = order.payment_status !== 'completed' && 
                               order.payment_status !== 'failed' && 
                               order.payment_status !== 'not_configured'
      
      if (needsVerification) {
        // Verify immediately when component loads
        verifyPaymentStatus()
        
        // Also set up a single retry after 3 seconds if still not completed
        const retryTimeout = setTimeout(() => {
          if (order.payment_status !== 'completed') {
            verifyPaymentStatus()
          }
        }, 3000)
        
        return () => clearTimeout(retryTimeout)
      }
    }
  }, [order?.id]) // Only run when order ID changes, not on every order update

  const verifyPaymentStatus = async () => {
    if (checkingStatus) return // Prevent multiple simultaneous checks

    setCheckingStatus(true)
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
        // Always update the order with the latest data
        const { data: restaurantData } = await supabase
          .from('restaurants')
          .select('name, address, phone_number, email')
          .eq('id', data.order.restaurant_id)
          .single()

        setOrder({
          ...data.order,
          restaurant: restaurantData || order?.restaurant
        })

        // If payment failed, redirect to failure page
        if (data.payment_status === 'failed') {
          router.push(`/payment/failure?order_id=${orderId}&reason=payment_failed`)
        }

        // If payment completed, clear any timeouts
        if (data.payment_status === 'completed') {
          setTimeoutActive(false)
          setCountdown(0)
        }
      } else {
        console.error('Payment verification failed:', data.error || 'Unknown error')
        // Keep current status and let user try again
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      // Network or other errors - let user try again
    } finally {
      setCheckingStatus(false)
    }
  }

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)

      if (!orderId) {
        throw new Error('No order ID provided')
      }

      let response = await fetch(`/api/orders/${orderId}`)
      let data = await response.json()

      // If order not found, try to create it (this handles the case where user lands on success page
      // but order wasn't created yet due to payment flow issues)
      if (!data.success && data.code === 'ORDER_NOT_FOUND') {
        // For now, we'll just show the error since we don't have order creation data
        // In a real scenario, this data would come from payment gateway or session storage
        throw new Error('Order not found. Please contact the restaurant if you completed payment.')
      }

      if (data.success && data.order) {
        // Check if payment failed and redirect to failure page
        if (data.order.payment_status === 'failed') {
          router.push(`/payment/failure?order_id=${orderId}&reason=payment_failed`)
          return
        }

        // If payment status is still pending, set it to verifying for better UX
        if (data.order.payment_status === 'pending') {
          console.log('Updating payment status from pending to verifying')
          try {
            const updateResponse = await fetch(`/api/orders/${orderId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ payment_status: 'verifying' })
            })
            const updateResult = await updateResponse.json()
            console.log('Update result:', updateResult)
            data.order.payment_status = 'verifying'
          } catch (updateError) {
            console.error('Failed to update payment status:', updateError)
            // Continue with pending status if update fails
          }
        }

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

        // If payment is still pending/verifying, immediately try to verify it
        if (data.order.payment_status === 'pending' || data.order.payment_status === 'verifying') {
          // Wait a moment for the order state to be set, then verify
          setTimeout(() => {
            verifyPaymentStatus()
          }, 1000)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const goToProfile = () => {
    router.push('/profile')
  }

  const printInvoice = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {noPayment ? 'Order Placed Successfully!' :
              order?.payment_status === 'completed' ? 'Payment Successful!' :
                'Order Received!'}
          </h1>
          <p className="text-gray-600">
            {noPayment
              ? 'Your order has been received. The restaurant will contact you for payment.'
              : order?.payment_status === 'completed'
                ? 'Your payment has been processed and your order is confirmed.'
                : 'Your order has been received. Payment verification is in progress.'
            }
          </p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
            <div className="text-right">
              {order.unique_order_id && (
                <div className="text-lg font-mono font-bold text-blue-600 mb-1">
                  #{order.unique_order_id}
                </div>
              )}
              <span className="text-sm text-gray-500">#{order.id.slice(-8)}</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Restaurant Info */}
            <div className="border-b pb-4">
              <h3 className="font-medium text-gray-900 mb-2">{order.restaurant?.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                {order.restaurant?.address && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {order.restaurant.address}
                  </div>
                )}
                {order.restaurant?.phone_number && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {order.restaurant.phone_number}
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-b pb-4">
              <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Name:</strong> {order.customer_name}</p>
                <p><strong>Phone:</strong> {order.customer_phone}</p>
                <p><strong>Table:</strong> {order.table_number}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-b pb-4">
              <h3 className="font-medium text-gray-900 mb-2">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium">{item.dish_name}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount</span>
                <span className="text-green-600">{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Payment Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.payment_status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : order.payment_status === 'not_configured'
                    ? 'bg-yellow-100 text-yellow-800'
                    : order.payment_status === 'verifying'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                  {order.payment_status === 'completed' ? 'Paid' :
                    order.payment_status === 'not_configured' ? 'Manual Payment' :
                      order.payment_status === 'pending' ? 'Pending' :
                        order.payment_status === 'verifying' ? 'Verifying...' :
                          order.payment_status}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Order Time</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`border rounded-lg p-4 mb-6 ${(order.payment_status === 'pending' || order.payment_status === 'verifying') && !noPayment
            ? 'bg-yellow-50 border-yellow-200'
            : order.payment_status === 'failed'
              ? 'bg-red-50 border-red-200'
              : 'bg-blue-50 border-blue-200'
            }`}
        >
          <div className="flex items-center">
            <Clock className={`h-5 w-5 mr-3 ${(order.payment_status === 'pending' || order.payment_status === 'verifying') && !noPayment
              ? 'text-yellow-600'
              : order.payment_status === 'failed'
                ? 'text-red-600'
                : 'text-blue-600'
              }`} />
            <div className="flex-1">
              <h3 className={`font-medium ${(order.payment_status === 'pending' || order.payment_status === 'verifying') && !noPayment
                ? 'text-yellow-900'
                : order.payment_status === 'failed'
                  ? 'text-red-900'
                  : 'text-blue-900'
                }`}>
                {(order.payment_status === 'pending' || order.payment_status === 'verifying') && !noPayment
                  ? 'Payment Verification in Progress'
                  : order.payment_status === 'failed'
                    ? 'Payment Failed'
                    : 'What\'s Next?'
                }
              </h3>
              <p className={`text-sm ${(order.payment_status === 'pending' || order.payment_status === 'verifying') && !noPayment
                ? 'text-yellow-700'
                : order.payment_status === 'failed'
                  ? 'text-red-700'
                  : 'text-blue-700'
                }`}>
                {(order.payment_status === 'pending' || order.payment_status === 'verifying') && !noPayment
                  ? 'Click "Verify Payment Now" to instantly check your payment status with the payment gateway.'
                  : order.payment_status === 'failed'
                    ? 'Your payment could not be processed. Please try again or contact the restaurant.'
                    : noPayment
                      ? 'The restaurant will contact you shortly to confirm your order and arrange payment.'
                      : 'Your order is being prepared. You will be notified when it\'s ready.'
                }
              </p>

              {timeoutActive && (
                <div className="flex items-center justify-center mt-4 space-x-3">
                  <div className="relative w-12 h-12">
                    {/* Circular progress background */}
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-yellow-200"
                      />
                      {/* Animated progress circle */}
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - (15 - countdown) / 15)}`}
                        className="text-yellow-600 transition-all duration-1000 ease-linear"
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Countdown number in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-yellow-700">{countdown}</span>
                    </div>
                  </div>
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Redirecting to contact page...</p>
                    <p className="text-xs">in {countdown} second{countdown !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}
            </div>
            {(order.payment_status === 'pending' || order.payment_status === 'verifying') && !noPayment && (
              <div className="ml-4">
                {timeoutActive ? (
                  <div className="relative w-8 h-8">
                    {/* Circular progress for the status icon */}
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-yellow-300"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 12}`}
                        strokeDashoffset={`${2 * Math.PI * 12 * (1 - (15 - countdown) / 15)}`}
                        className="text-yellow-600 transition-all duration-1000 ease-linear"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>
                ) : (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                )}
              </div>
            )}
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

          <Button
            onClick={goToProfile}
            variant="outline"
            className="flex-1"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>

          {order.payment_status === 'completed' ? (
            <Button
              onClick={printInvoice}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
          ) : (order.payment_status === 'pending' || order.payment_status === 'verifying') && !noPayment ? (
            <Button
              onClick={verifyPaymentStatus}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={checkingStatus}
            >
              {checkingStatus ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                'Verify Payment Now'
              )}
            </Button>
          ) : order.payment_status === 'failed' ? (
            <Button
              onClick={() => router.push(`/payment/failure?order_id=${orderId}&reason=payment_failed`)}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Try Again
            </Button>
          ) : (
            <Button
              onClick={printInvoice}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}