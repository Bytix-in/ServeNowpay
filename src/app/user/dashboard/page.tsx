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
      
      // Clean phone number (remove any non-digits) - same as profile API
      const cleanPhone = phone.replace(/\D/g, '')
      console.log('Original phone:', phone, 'Clean phone:', cleanPhone)
      
      // Fetch user orders using the same query structure as profile API
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant:restaurants(name, address)
        `)
        .eq('customer_phone', cleanPhone)
        .order('created_at', { ascending: false })

      console.log('Orders query result:', { orders, error: ordersError, count: orders?.length || 0 })

      // Debug: If no orders found, let's check what phone numbers exist in the database
      if (!orders || orders.length === 0) {
        const { data: sampleOrders } = await supabase
          .from('orders')
          .select('customer_phone, customer_name, unique_order_id')
          .limit(5)
        
        console.log('Sample orders in database:', sampleOrders)
        console.log('Looking for phone:', cleanPhone)
      }

      if (ordersError) throw ordersError

      // Process orders data - updated to match the new query structure
      const processedOrders: RecentOrder[] = orders?.map(order => ({
        id: order.id,
        unique_order_id: order.unique_order_id,
        restaurant_name: order.restaurant?.name || 'Unknown Restaurant',
        restaurant_address: order.restaurant?.address || null,
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
    // Check if user is logged in (support both authentication methods)
    let phone = localStorage.getItem('userPhone')
    let isLoggedIn = localStorage.getItem('userLoggedIn')
    
    // Also check for profile-based session
    if (!phone || !isLoggedIn) {
      try {
        const userSession = localStorage.getItem('userSession')
        if (userSession) {
          const session = JSON.parse(userSession)
          phone = session.phone
          isLoggedIn = 'true'
          // Migrate to new format
          localStorage.setItem('userPhone', phone)
          localStorage.setItem('userLoggedIn', 'true')
          localStorage.setItem('userName', session.name)
        }
      } catch (error) {
        console.error('Error parsing user session:', error)
      }
    }
    
    if (!phone || !isLoggedIn) {
      router.push('/auth/user-login')
      return
    }
    
    setUserPhone(phone)
    console.log('Using phone number for dashboard:', phone)
    
    // Generate a display name from phone number or use stored name
    const storedName = localStorage.getItem('userName')
    if (storedName) {
      setUserName(storedName)
    } else {
      setUserName(`User ${phone.slice(-4)}`)
    }

    // Fetch user data
    fetchUserData(phone)

    // Set up real-time subscription for orders using cleaned phone number
    const cleanPhone = phone.replace(/\D/g, '')
    const subscription = supabase
      .channel(`user-orders-${cleanPhone}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_phone=eq.${cleanPhone}`
        },
        (payload) => {
          console.log('Real-time order update received:', payload)
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

  const handleLogout = async () => {
    try {
      // Get the most recent order to redirect to that restaurant's menu
      if (recentOrders.length > 0) {
        const latestOrder = recentOrders[0]
        
        // Get restaurant slug from the database
        const { data: restaurant, error } = await supabase
          .from('restaurants')
          .select('slug')
          .eq('name', latestOrder.restaurant_name)
          .single()
        
        // Clear user session data
        localStorage.removeItem('userPhone')
        localStorage.removeItem('userLoggedIn')
        localStorage.removeItem('userName')
        localStorage.removeItem('userSession')
        
        // Redirect to the restaurant's menu page
        if (!error && restaurant?.slug) {
          router.push(`/${restaurant.slug}/menu`)
        } else {
          // Fallback to home page if restaurant not found
          router.push('/')
        }
      } else {
        // No orders found, redirect to home page
        localStorage.removeItem('userPhone')
        localStorage.removeItem('userLoggedIn')
        localStorage.removeItem('userName')
        localStorage.removeItem('userSession')
        router.push('/')
      }
    } catch (error) {
      console.error('Error during logout:', error)
      // Fallback: clear session and redirect to home
      localStorage.removeItem('userPhone')
      localStorage.removeItem('userLoggedIn')
      localStorage.removeItem('userName')
      localStorage.removeItem('userSession')
      router.push('/')
    }
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

  // Download invoice as PDF using dynamic invoice API
  const downloadInvoice = async (order: RecentOrder) => {
    try {
      setDownloadingPDF(true)
      
      // Clean phone number for API call
      const cleanPhone = userPhone.replace(/\D/g, '')
      
      // Generate invoice HTML using dynamic invoice API
      const response = await fetch(`/api/dynamic-invoice?orderId=${order.id}&customerPhone=${cleanPhone}&format=html`)
      
      if (!response.ok) {
        throw new Error('Failed to generate invoice')
      }
      
      // Get the HTML content
      const htmlContent = await response.text()
      
      // Create a temporary div to render the HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlContent
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '-9999px'
      tempDiv.style.width = '800px'
      document.body.appendChild(tempDiv)
      
      // Import PDF generation libraries
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).jsPDF
      
      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')
      
      // Calculate dimensions to fit A4
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 0
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      
      // Download the PDF
      pdf.save(`invoice-${order.unique_order_id || order.id.slice(-8)}.pdf`)
      
      // Cleanup
      document.body.removeChild(tempDiv)
      
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
        <div className="max-w-5xl mx-auto px-6 py-6">
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
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
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
          className="bg-white rounded-lg shadow-sm border border-gray-100"
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
            <div>
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`p-6 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    index !== recentOrders.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  {/* Left side - Restaurant info and date */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {order.restaurant_name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatDateTime(order.created_at)}</span>
                    </div>
                    
                    {/* Status badges and table */}
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                      <span className="text-sm text-gray-600">
                        Table {order.table_number}
                      </span>
                    </div>
                  </div>

                  {/* Right side - Order ID, Amount and Actions */}
                  <div className="text-right">
                    {order.unique_order_id && (
                      <div className="text-sm font-mono text-blue-600 mb-1">
                        {order.unique_order_id}
                      </div>
                    )}
                    <div className="text-xl font-bold text-green-600 mb-3">
                      {formatCurrency(order.total_amount)}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {order.payment_status === 'completed' && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadInvoice(order)
                          }}
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 flex items-center gap-1"
                          disabled={downloadingPDF}
                        >
                          <Download className="h-4 w-4" />
                          Print Invoice
                        </Button>
                      )}
                      <Button
                        onClick={() => setSelectedOrder(order)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Receipt className="h-4 w-4" />
                        View Details
                      </Button>
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
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setSelectedOrder(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  {selectedOrder.payment_status === 'completed' && (
                    <Button
                      onClick={() => downloadInvoice(selectedOrder)}
                      disabled={downloadingPDF}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {downloadingPDF ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          {selectedOrder.invoice_generated ? 'Downloading...' : 'Generating...'}
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download Invoice
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}