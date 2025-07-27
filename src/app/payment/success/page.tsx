'use client'

import { useEffect, useState } from 'react'
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
  created_at: string
  restaurant?: {
    name: string
    address: string
    phone_number: string
    email: string
  }
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      
      if (!orderId) {
        throw new Error('No order ID provided')
      }
      
      const response = await fetch(`/api/orders/${orderId}`)
      const data = await response.json()
      
      if (data.success && data.order) {
        // Check if payment failed and redirect to failure page
        if (data.order.payment_status === 'failed') {
          router.push(`/payment/failure?order_id=${orderId}`)
          return
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
            {noPayment ? 'Order Placed Successfully!' : 'Payment Successful!'}
          </h1>
          <p className="text-gray-600">
            {noPayment 
              ? 'Your order has been received. The restaurant will contact you for payment.'
              : 'Your payment has been processed and your order is confirmed.'
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
            <span className="text-sm text-gray-500">#{order.id.slice(-8)}</span>
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.payment_status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : order.payment_status === 'not_configured'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {order.payment_status === 'completed' ? 'Paid' : 
                   order.payment_status === 'not_configured' ? 'Manual Payment' : 
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
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-blue-900">What's Next?</h3>
              <p className="text-sm text-blue-700">
                {noPayment 
                  ? 'The restaurant will contact you shortly to confirm your order and arrange payment.'
                  : 'Your order is being prepared. You will be notified when it\'s ready.'
                }
              </p>
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
          
          <Button
            onClick={goToProfile}
            variant="outline"
            className="flex-1"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>

          <Button
            onClick={printInvoice}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Invoice
          </Button>
        </motion.div>
      </div>
    </div>
  )
}