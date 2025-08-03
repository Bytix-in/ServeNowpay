'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  User, 
  Phone, 
  LogOut,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Heart,
  X,
  MapPin,
  Clock,
  Receipt,
  CheckCircle,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

interface UserStats {
  totalOrders: number
  totalSpent: number
  favoriteRestaurants: number
  pendingOrders: number
  completedOrders: number
}

interface RecentOrder {
  id: string
  unique_order_id: string
  restaurant_name: string
  restaurant_address?: string
  items: any[]
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  table_number: string
  invoice_base64?: string
  invoice_generated?: boolean
}

export default function UserDashboard() {
  const [userPhone, setUserPhone] = useState('')
  const [userName, setUserName] = useState('')
  const [userStats, setUserStats] = useState<UserStats>({
    totalOrders: 0,
    totalSpent: 0,
    favoriteRestaurants: 0,
    pendingOrders: 0,
    completedOrders: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null)
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const router = useRouter()

  // Fetch user data and statistics
  const fetchUserData = async (phone: string) => {
    try {
      setLoading(true)
      
      // Fetch user orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          unique_order_id,
          total_amount,
          status,
          payment_status,
          created_at,
          table_number,
          items,
          invoice_base64,
          invoice_generated,
          restaurants (
            name,
            address
          )
        `)
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Process orders data
      const processedOrders: RecentOrder[] = orders?.map(order => ({
        id: order.id,
        unique_order_id: order.unique_order_id,
        restaurant_name: order.restaurants?.name || 'Unknown Restaurant',
        restaurant_address: order.restaurants?.address || null,
        items: order.items || [],
        total_amount: order.total_amount,
        status: order.status,
        payment_status: order.payment_status,
        created_at: order.created_at,
        table_number: order.table_number,
        invoice_base64: order.invoice_base64,
        invoice_generated: order.invoice_generated
      })) || []

      // Calculate statistics
      const completedOrders = processedOrders.filter(order => 
        order.payment_status === 'completed'
      )
      
      const totalSpent = completedOrders.reduce((sum, order) => 
        sum + order.total_amount, 0
      )

      const uniqueRestaurants = new Set(
        completedOrders.map(order => order.restaurant_name)
      ).size

      const pendingOrders = processedOrders.filter(order => 
        order.status === 'pending' || order.status === 'in_progress'
      ).length

      const stats: UserStats = {
        totalOrders: processedOrders.length,
        totalSpent,
        favoriteRestaurants: uniqueRestaurants,
        pendingOrders,
        completedOrders: completedOrders.length
      }

      setUserStats(stats)
      setRecentOrders(processedOrders.slice(0, 5)) // Show only recent 5 orders
      setLastUpdated(new Date())

    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if user is logged in
    const phone = localStorage.getItem('userPhone')
    const isLoggedIn = localStorage.getItem('userLoggedIn')
    
    if (!phone || !isLoggedIn) {
      router.push('/auth/user-login')
      return
    }
    
    setUserPhone(phone)
    // Generate a display name from phone number or use stored name
    const storedName = localStorage.getItem('userName')
    if (storedName) {
      setUserName(storedName)
    } else {
      setUserName(`User ${phone.slice(-4)}`)
    }

    // Fetch user data
    fetchUserData(phone)

    // Set up real-time subscription for orders
    const subscription = supabase
      .channel(`user-orders-${phone}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_phone=eq.${phone}`
        },
        (payload) => {
          // Refresh data when orders change
          fetchUserData(phone)
        }
      )
      .subscribe()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchUserData(phone), 30000)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('userPhone')
    localStorage.removeItem('userLoggedIn')
    localStorage.removeItem('userName')
    router.push('/')
  }

  const handleRefresh = () => {
    if (userPhone) {
      fetchUserData(userPhone)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  // Format date and time
  const formatDateTime = (timestamp: string) => {
    const now = new Date()
    const orderDate = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60))
      return `${diffInMinutes} minutes ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else {
      return orderDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short'
      })
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'served': return 'bg-gray-100 text-gray-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'New'
      case 'in_progress': return 'Preparing'
      case 'completed': return 'Ready'
      case 'served': return 'Delivered'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'verifying': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Format full date and time
  const formatFullDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Download invoice from base64 data
  const downloadInvoice = async (order: RecentOrder) => {
    try {
      setDownloadingPDF(true)
      
      // Check if invoice exists in the order data
      if (!order.invoice_base64) {
        // If no invoice exists, try to generate one
        const response = await fetch('/api/auto-generate-invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.id
          })
        })

        if (!response.ok) {
          throw new Error('Failed to generate invoice')
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to generate invoice')
        }

        // Refresh the order data to get the new invoice
        await fetchUserData(userPhone)
        alert('Invoice generated! Please try downloading again.')
        return
      }

      // Convert base64 to blob
      const base64Data = order.invoice_base64
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      
      // Determine content type based on the data
      let contentType = 'text/html'
      let fileExtension = 'html'
      
      // Check if it's actually a PDF (starts with PDF signature)
      if (base64Data.startsWith('JVBERi0')) {
        contentType = 'application/pdf'
        fileExtension = 'pdf'
      }
      
      const blob = new Blob([byteArray], { type: contentType })
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${order.unique_order_id || order.id.slice(-8)}.${fileExtension}`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Error downloading invoice:', error)
      alert('Failed to download invoice. Please try again.')
    } finally {
      setDownloadingPDF(false)
    }
  }

  if (!userPhone) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <User className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{userName}</h1>
                <div className="flex items-center gap-1 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">+91 {userPhone}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Live Data</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                disabled={loading}
                variant="outline"
                size="sm"
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="flex items-center justify-center mb-2">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {loading ? '...' : userStats.totalOrders}
            </div>
            <div className="text-xs text-gray-600">Total Orders</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {loading ? '...' : formatCurrency(userStats.totalSpent).replace('₹', '₹')}
            </div>
            <div className="text-xs text-gray-600">Total Spent</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="flex items-center justify-center mb-2">
              <Heart className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {loading ? '...' : userStats.favoriteRestaurants}
            </div>
            <div className="text-xs text-gray-600">Restaurants</div>
          </div>
        </motion.div>

        {/* Additional Stats */}
        {!loading && userStats.pendingOrders > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-orange-700">Active Orders</h3>
                <p className="text-2xl font-bold text-orange-900">{userStats.pendingOrders}</p>
              </div>
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-orange-600 animate-spin" />
              </div>
            </div>
            <p className="text-xs text-orange-600 mt-1">Orders being prepared</p>
          </motion.div>
        )}

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Real-time updates</span>
                </div>
              </div>

            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No orders yet</p>
              <p className="text-gray-400 text-sm">Start ordering from your favorite restaurants</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{order.restaurant_name}</h3>
                        {order.unique_order_id && (
                          <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            #{order.unique_order_id}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.items.length > 0 
                          ? order.items.map(item => `${item.dish_name} x${item.quantity}`).join(', ')
                          : 'Order details'
                        }
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(order.total_amount)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(order.created_at)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Table {order.table_number}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      {order.payment_status === 'completed' && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadInvoice(order)
                          }}
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                          disabled={downloadingPDF}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>



        {/* Bottom Spacing */}
        <div className="h-20"></div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
                  {selectedOrder.unique_order_id && (
                    <p className="text-sm font-mono text-blue-600">#{selectedOrder.unique_order_id}</p>
                  )}
                </div>
                <Button
                  onClick={() => setSelectedOrder(null)}
                  variant="outline"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-6">
              {/* Restaurant Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedOrder.restaurant_name}</h3>
                    {selectedOrder.restaurant_address && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{selectedOrder.restaurant_address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Order Status</span>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Payment</span>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                    {selectedOrder.payment_status}
                  </span>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3 h-3 text-gray-600" />
                      <span className="font-medium text-gray-700">Order Time</span>
                    </div>
                    <p className="text-gray-600">{formatFullDateTime(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3 h-3 text-gray-600" />
                      <span className="font-medium text-gray-700">Table Number</span>
                    </div>
                    <p className="text-gray-600">Table {selectedOrder.table_number}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.dish_name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          {item.price && (
                            <p className="text-sm text-gray-600">Price: {formatCurrency(item.price)} each</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(item.total || (item.price * item.quantity))}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Receipt className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No item details available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Total */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-green-800">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {/* Invoice Download Button */}
                {selectedOrder.payment_status === 'completed' && (
                  <Button
                    onClick={() => downloadInvoice(selectedOrder)}
                    disabled={downloadingPDF}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {downloadingPDF ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {selectedOrder.invoice_generated ? 'Downloading...' : 'Generating Invoice...'}
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        {selectedOrder.invoice_generated ? 'Download Invoice' : 'Generate & Download Invoice'}
                      </>
                    )}
                  </Button>
                )}
                
                {/* Other Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setSelectedOrder(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedOrder(null)
                      router.push('/user/orders')
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    View All Orders
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}