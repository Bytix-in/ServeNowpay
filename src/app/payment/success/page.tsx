'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Clock, IndianRupee, AlertCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

type Order = {
  id: string
  customer_name: string
  customer_phone: string
  table_number: string
  items: any[]
  total_amount: number
  payment_status: string | null
  status: string
  created_at: string
  restaurant: {
    name: string
    slug: string
  }
}

type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'PROCESSING' | null

// Create a separate component that uses useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants!inner(name, slug)
        `)
        .eq('id', orderId)
        .single()

      if (error) throw error

      setOrder({
        ...data,
        restaurant: data.restaurants
      })
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('Failed to load order details')
    }
  }

  useEffect(() => {
    if (!orderId) {
      setError('Order ID not found')
      setLoading(false)
      return
    }

    const loadOrder = async () => {
      await fetchOrder()
      setLoading(false)
    }

    loadOrder()

    // Auto-refresh every 5 seconds if payment is still processing
    const interval = setInterval(async () => {
      if (order && (order.payment_status === 'PENDING' || order.payment_status === 'PROCESSING' || !order.payment_status)) {
        await fetchOrder()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [orderId, order?.payment_status])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchOrder()
    setRefreshing(false)
  }

  const getPaymentStatusInfo = (paymentStatus: PaymentStatus) => {
    switch (paymentStatus) {
      case 'SUCCESS':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Payment Successful!',
          message: 'Your payment has been processed successfully.',
          showRefresh: false
        }
      case 'FAILED':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Payment Failed',
          message: 'Your payment could not be processed. Please try again.',
          showRefresh: true
        }
      case 'PENDING':
      case 'PROCESSING':
        return {
          icon: Loader2,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Payment Processing',
          message: 'We\'re confirming your payment. Please wait...',
          showRefresh: true
        }
      default:
        return {
          icon: Clock,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: 'Order Confirmed',
          message: 'Your order has been placed successfully.',
          showRefresh: false
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
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The order you are looking for does not exist.'}</p>
          <Button onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  const statusInfo = getPaymentStatusInfo(order.payment_status as PaymentStatus)
  const StatusIcon = statusInfo.icon
  const estimatedTime = order.items.reduce((max, item) => 
    Math.max(max, item.preparation_time || 0), 0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Dynamic Status Header */}
          <div className="text-center mb-8">
            <div className="relative">
              <StatusIcon 
                className={`w-16 h-16 mx-auto mb-4 ${statusInfo.color} ${
                  order.payment_status === 'PROCESSING' || order.payment_status === 'PENDING' ? 'animate-spin' : ''
                }`} 
              />
              {statusInfo.showRefresh && (
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  variant="outline"
                  size="sm"
                  className="absolute top-0 right-1/2 transform translate-x-12"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{statusInfo.title}</h1>
            <p className="text-gray-600">{statusInfo.message}</p>
            
            {/* Payment Status Badge */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-4 ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${statusInfo.color.replace('text-', 'bg-')}`}></div>
              {order.payment_status ? `Payment ${order.payment_status}` : 'Order Placed'}
            </div>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-medium">{order.id.slice(0, 8)}...</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Restaurant</p>
                <p className="font-medium">{order.restaurant.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Table Number</p>
                <p className="font-medium">{order.table_number}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Items Ordered</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.dish_name}</span>
                      <span className="text-gray-600 ml-2">x{item.quantity}</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <IndianRupee className="w-4 h-4" />
                      <span>{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t mt-4 pt-4 flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <div className="flex items-center text-green-600 font-bold text-xl">
                  <IndianRupee className="w-5 h-5" />
                  <span>{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Status Card */}
          {order.payment_status === 'SUCCESS' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Estimated Preparation Time</h3>
              </div>
              <p className="text-green-800">
                Your order will be ready in approximately <strong>{estimatedTime} minutes</strong>.
              </p>
              <p className="text-sm text-green-700 mt-2">
                You'll receive updates on your order status. Please stay at table {order.table_number}.
              </p>
            </div>
          )}

          {/* Processing Status Card */}
          {(order.payment_status === 'PENDING' || order.payment_status === 'PROCESSING') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                <h3 className="font-semibold text-yellow-900">Payment Confirmation</h3>
              </div>
              <p className="text-yellow-800">
                We're processing your payment. This usually takes a few moments.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                Please don't refresh or close this page. We'll update the status automatically.
              </p>
            </div>
          )}

          {/* Failed Status Card */}
          {order.payment_status === 'FAILED' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Payment Failed</h3>
              </div>
              <p className="text-red-800">
                Your payment could not be processed. Please try placing the order again.
              </p>
              <p className="text-sm text-red-700 mt-2">
                If the problem persists, please contact the restaurant directly.
              </p>
            </div>
          )}

          {/* No Payment Status Card */}
          {!order.payment_status && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Order Confirmed</h3>
              </div>
              <p className="text-blue-800">
                Your order has been placed successfully and is being prepared.
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Estimated preparation time: <strong>{estimatedTime} minutes</strong>. Please stay at table {order.table_number}.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => window.location.href = `/${order.restaurant.slug}/menu`}
              variant="outline"
              className="flex-1"
            >
              Order More
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
/
/ Loading fallback component
function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading payment details...</p>
      </div>
    </div>
  );
}

// Main component that wraps the content with Suspense
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}