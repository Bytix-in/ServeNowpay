'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Phone, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Eye,
  Calendar,
  MapPin,
  Receipt,
  LogOut,
  Printer
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface RestaurantInfo {
  name: string
  address: string | null
}

interface Order {
  id: string
  unique_order_id: string | null
  restaurant_id: string
  customer_name: string
  customer_phone: string
  table_number: string
  items: any[]
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  restaurant: RestaurantInfo | null
}

interface UserSession {
  phone: string
  name: string
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    try {
      const savedSession = localStorage.getItem('userSession')
      if (savedSession) {
        const session = JSON.parse(savedSession)
        setUserSession(session)
        setIsLoggedIn(true)
        fetchUserOrders(session.phone)
      }
    } catch (error) {
      console.error('Error loading saved session:', error)
      // Clear invalid session data
      localStorage.removeItem('userSession')
    }
  }, [])

  const handlePhoneLogin = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number')
      return
    }

    // Basic phone number validation
    const cleanPhone = phoneNumber.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    setIsLoggingIn(true)
    setError(null)

    try {
      const response = await fetch('/api/profile/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: cleanPhone })
      })

      const data = await response.json()

      if (data.success) {
        const session = {
          phone: cleanPhone,
          name: data.customerName || 'Customer'
        }
        
        setUserSession(session)
        setIsLoggedIn(true)
        try {
          localStorage.setItem('userSession', JSON.stringify(session))
        } catch (error) {
          console.error('Error saving session:', error)
        }
        
        // Fetch user orders
        fetchUserOrders(cleanPhone)
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Failed to login. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const fetchUserOrders = async (phone: string) => {
    setLoadingOrders(true)
    try {
      const response = await fetch(`/api/profile/orders?phone=${phone}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.orders)
      } else {
        setError(data.error || 'Failed to fetch orders')
      }
    } catch (err) {
      setError('Failed to fetch orders')
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem('userSession')
    } catch (error) {
      console.error('Error clearing session:', error)
    }
    setUserSession(null)
    setIsLoggedIn(false)
    setOrders([])
    setPhoneNumber('')
    setSelectedOrder(null)
    setError(null)
  }

  const printInvoice = () => {
    window.print()
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
      case 'verifying':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 sm:mb-4">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Your Profile
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-2">
              Login with your phone number to view your order history
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full pl-10 pr-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handlePhoneLogin()}
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              onClick={handlePhoneLogin}
              disabled={isLoggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-sm sm:text-base"
            >
              {isLoggingIn ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Logging in...
                </>
              ) : (
                'Login & View Orders'
              )}
            </Button>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full py-3 text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  if (selectedOrder) {
    return (
      <>
        <style jsx global>{`
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            .bg-gray-50 { background: white !important; }
            .shadow-sm { box-shadow: none !important; }
            .border { border: 1px solid #e5e7eb !important; }
            .rounded-lg { border-radius: 0 !important; }
          }
          .print-only { display: none; }
        `}</style>
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 sm:mb-6"
          >
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 px-2">Invoice for Order #{selectedOrder.unique_order_id || selectedOrder.id.slice(-8)}</p>
          </motion.div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Order Information</h2>
              <div className="text-left sm:text-right">
                {selectedOrder.unique_order_id && (
                  <div className="text-base sm:text-lg font-mono font-bold text-blue-600 mb-1">
                    {selectedOrder.unique_order_id}
                  </div>
                )}
                <span className="text-sm text-gray-500">#{selectedOrder.id.slice(-8)}</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Restaurant Info */}
              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  {selectedOrder.restaurant?.name || 'Unknown Restaurant'}
                </h3>
                {selectedOrder.restaurant?.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {selectedOrder.restaurant.address}
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-900 mb-2">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0 text-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium">{item.dish_name}</span>
                        <span className="text-gray-500 sm:ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-medium text-green-600">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                  <span className="text-gray-600 text-sm sm:text-base">Table Number</span>
                  <span className="font-medium text-sm sm:text-base">{selectedOrder.table_number}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                  <span className="text-gray-600 text-sm sm:text-base">Order Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                  <span className="text-gray-600 text-sm sm:text-base">Payment Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                    {selectedOrder.payment_status}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                  <span className="text-gray-600 text-sm sm:text-base">Order Time</span>
                  <span className="font-medium text-sm sm:text-base break-all sm:break-normal">{formatDate(selectedOrder.created_at)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0 text-base sm:text-lg font-semibold pt-2 border-t">
                  <span>Total Amount</span>
                  <span className="text-green-600">{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Print-only Invoice Header */}
          <div className="print-only mb-6 text-center border-b pb-4">
            <h1 className="text-2xl font-bold">INVOICE</h1>
            <p className="text-gray-600">Order #{selectedOrder.unique_order_id || selectedOrder.id.slice(-8)}</p>
            <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 no-print"
          >
            <Button
              onClick={() => setSelectedOrder(null)}
              variant="outline"
              className="flex-1 py-3 text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
            
            <Button
              onClick={printInvoice}
              className="flex-1 bg-green-600 hover:bg-green-700 py-3 text-sm sm:text-base"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
          </motion.div>
        </div>
      </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Orders</h1>
            <p className="text-sm sm:text-base text-gray-600">Welcome back, {userSession?.name}</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="text-left sm:text-right">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-medium text-gray-900 break-all sm:break-normal">{userSession?.phone}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Orders List */}
        {loadingOrders ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-12"
          >
            <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Browse Restaurants
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                      {order.restaurant?.name || 'Unknown Restaurant'}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="break-all sm:break-normal">{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    {order.unique_order_id && (
                      <div className="text-sm font-mono font-bold text-blue-600 mb-1 break-all sm:break-normal">
                        {order.unique_order_id}
                      </div>
                    )}
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(order.total_amount)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                    <span className="text-sm text-gray-600">
                      Table {order.table_number}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                    <Button
                      onClick={() => {
                        setSelectedOrder(order)
                        // Small delay to ensure the order is set before printing
                        setTimeout(() => printInvoice(), 100)
                      }}
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 text-xs sm:text-sm"
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                    <Button
                      onClick={() => setSelectedOrder(order)}
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 sm:mt-8"
        >
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full sm:w-auto py-3 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </motion.div>
      </div>
    </div>
  )
}