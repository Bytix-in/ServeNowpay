'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PaymentDisabledBanner } from '@/components/restaurant/PaymentSetupBanner'
import EnhancedRevenueDashboard from '@/components/restaurant/EnhancedRevenueDashboard'
import PeakHoursAnalysis from '@/components/restaurant/PeakHoursAnalysis'
import MenuPerformanceRanking from '@/components/restaurant/MenuPerformanceRanking'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import {
  Users,
  BarChart3,
  TrendingUp,
  ChevronDown,
  Search,
  Bell,
  Settings,
  Home,
  ShoppingBag,
  Utensils,
  Bike,
  Store,
  FileText,
  MessageSquare,
  Megaphone,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Menu,
  RefreshCw,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceDot
} from 'recharts'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  newCustomers: number
  pendingOrders: number
  completedOrders: number
  todayOrders: number
  todayRevenue: number
}

interface RecentOrder {
  id: string
  unique_order_id: string
  customer_name: string
  customer_phone: string
  table_number: string | null
  customer_address: string | null
  order_type: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  items: any[]
}

interface ChartDataPoint {
  day: string
  date: string
  orders: number
  revenue: number
  completedOrders: number
}

// Define tooltip props interface
interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export default function RestaurantDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState('Month')
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    newCustomers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayOrders: 0,
    todayRevenue: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [orderAnalyticsData, setOrderAnalyticsData] = useState<ChartDataPoint[]>([])
  const [revenueProfileData, setRevenueProfileData] = useState<ChartDataPoint[]>([])
  const [chartPeriod, setChartPeriod] = useState<'7days' | '30days' | '90days'>('30days')
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null)
  const [hasNoData, setHasNoData] = useState(false)
  const [onlineOrderingEnabled, setOnlineOrderingEnabled] = useState<boolean>(false)
  const [updatingOnlineOrdering, setUpdatingOnlineOrdering] = useState(false)

  // Generate chart data from orders
  const generateChartData = (orders: RecentOrder[], period: '7days' | '30days' | '90days') => {
    const days = period === '7days' ? 7 : period === '30days' ? 30 : 90
    const chartData: ChartDataPoint[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= date && orderDate < nextDate
      })

      const completedDayOrders = dayOrders.filter(order =>
        order.payment_status === 'completed'
      )

      chartData.push({
        day: date.getDate().toString().padStart(2, '0'),
        date: date.toLocaleDateString('en-IN', {
          month: 'short',
          day: '2-digit'
        }),
        orders: dayOrders.length,
        revenue: completedDayOrders.reduce((sum, order) => sum + order.total_amount, 0),
        completedOrders: completedDayOrders.length
      })
    }

    return chartData
  }

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    if (!user?.restaurantId) return

    try {
      // Get all orders for the restaurant
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', user.restaurantId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Check if there are any orders at all in the database
      
      if (!orders || orders.length === 0) {
        console.log('No orders found for restaurant:', user.restaurantId)
        
        // Check if there are any orders in the database at all
        const { data: allOrders } = await supabase
          .from('orders')
          .select('id, restaurant_id, unique_order_id, customer_name, total_amount, created_at')
          .limit(5)
        
        console.log('Sample orders in database:', allOrders)
        
        // Check if there are any restaurants in the database
        const { data: restaurants } = await supabase
          .from('restaurants')
          .select('id, name, slug')
          .limit(3)
        
        console.log('Sample restaurants in database:', restaurants)
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayOrders = orders?.filter(order =>
        new Date(order.created_at) >= today
      ) || []

      const completedOrders = orders?.filter(order =>
        order.payment_status === 'completed'
      ) || []

      const todayCompletedOrders = todayOrders.filter(order =>
        order.payment_status === 'completed'
      )

      // Calculate unique customers (by phone number)
      const uniqueCustomers = new Set(orders?.map(order => order.customer_phone) || [])

      const stats: DashboardStats = {
        totalOrders: orders?.length || 0,
        totalRevenue: completedOrders.reduce((sum, order) => sum + order.total_amount, 0),
        newCustomers: uniqueCustomers.size,
        pendingOrders: orders?.filter(order => order.status === 'pending').length || 0,
        completedOrders: completedOrders.length,
        todayOrders: todayOrders.length,
        todayRevenue: todayCompletedOrders.reduce((sum, order) => sum + order.total_amount, 0)
      }

      // Generate chart data
      const chartData = generateChartData(orders || [], chartPeriod)
      setOrderAnalyticsData(chartData)
      setRevenueProfileData(chartData)

      setDashboardStats(stats)
      setRecentOrders(orders?.slice(0, 10) || [])
      setLastUpdated(new Date())
      setHasNoData(!orders || orders.length === 0)

    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.restaurantId) return

    // Initial fetch
    fetchDashboardStats()
    fetchOnlineOrderingStatus()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`restaurant-dashboard-${user.restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${user.restaurantId}`
        },
        (payload) => {
          // Refresh stats when orders change
          fetchDashboardStats()
        }
      )
      .subscribe()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [user?.restaurantId])

  // Update chart data when period changes
  useEffect(() => {
    if (recentOrders.length > 0) {
      const chartData = generateChartData(recentOrders, chartPeriod)
      setOrderAnalyticsData(chartData)
      setRevenueProfileData(chartData)
    }
  }, [chartPeriod, recentOrders])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  // Format date and time
  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600'
      case 'in_progress': return 'text-blue-600'
      case 'completed': return 'text-green-600'
      case 'served': return 'text-gray-600'
      case 'cancelled': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'New Order'
      case 'in_progress': return 'Preparing'
      case 'completed': return 'Ready'
      case 'served': return 'Served'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  // Generate and download invoice dynamically
  const downloadInvoice = async (order: RecentOrder) => {
    try {
      setDownloadingInvoice(order.id)
      
      // Generate invoice dynamically using the new system
      const response = await fetch('/api/dynamic-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          customerPhone: order.customer_phone,
          options: { format: 'pdf' }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate invoice')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${order.unique_order_id || order.id.slice(-8)}.pdf`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Error downloading invoice:', error)
      alert('Failed to download invoice. Please try again.')
    } finally {
      setDownloadingInvoice(null)
    }
  }

  // Fix restaurant data - refresh and validate data
  const fixRestaurantData = async () => {
    if (!user?.restaurantId) return
    
    try {
      setLoading(true)
      // Refresh dashboard stats
      await fetchDashboardStats()
    } catch (error) {
      console.error('Error fixing restaurant data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch online ordering status
  const fetchOnlineOrderingStatus = async () => {
    if (!user?.restaurantId) return

    try {
      const response = await fetch(`/api/restaurant/online-ordering?restaurant_id=${user.restaurantId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch online ordering status')
      }

      setOnlineOrderingEnabled(data.enabled)
    } catch (error) {
      console.error('Error fetching online ordering status:', error)
    }
  }

  // Toggle online ordering
  const toggleOnlineOrdering = async () => {
    if (!user?.restaurantId) {
      console.error('No restaurant ID found in user context:', user)
      alert('Restaurant ID not found. Please refresh the page and try again.')
      return
    }

    try {
      setUpdatingOnlineOrdering(true)
      const newStatus = !onlineOrderingEnabled

      console.log('Toggling online ordering:', { 
        restaurantId: user.restaurantId, 
        currentStatus: onlineOrderingEnabled, 
        newStatus 
      })

      const response = await fetch('/api/restaurant/online-ordering', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: user.restaurantId,
          enabled: newStatus
        })
      })

      const data = await response.json()
      console.log('API response:', { status: response.status, data })

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update online ordering status')
      }

      setOnlineOrderingEnabled(newStatus)
      
      // Show success message
      alert(data.message)
    } catch (error) {
      console.error('Error updating online ordering status:', error)
      alert(`Failed to update online ordering status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUpdatingOnlineOrdering(false)
    }
  }

  // Get current period stats for display
  const getCurrentPeriodStats = () => {
    const totalOrders = orderAnalyticsData.reduce((sum, day) => sum + day.orders, 0)
    const totalRevenue = orderAnalyticsData.reduce((sum, day) => sum + day.revenue, 0)
    const avgOrdersPerDay = totalOrders / (orderAnalyticsData.length || 1)

    return {
      totalOrders,
      totalRevenue,
      avgOrdersPerDay: Math.round(avgOrdersPerDay * 10) / 10
    }
  }

  const periodStats = getCurrentPeriodStats()



  // Custom tooltip for the Order Analytics chart
  const OrderAnalyticsTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;

      return (
        <div className="bg-black text-white p-3 rounded-lg text-sm shadow-lg">
          <p className="font-medium mb-2">{data.date}</p>
          <div className="space-y-1">
            <p className="flex justify-between gap-4">
              <span>Orders:</span>
              <span className="font-bold">{data.orders}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span>Revenue:</span>
              <span className="font-bold">{formatCurrency(data.revenue)}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span>Completed:</span>
              <span className="font-bold">{data.completedOrders}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for the Revenue Profile chart
  const RevenueProfileTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;

      return (
        <div className="bg-black text-white p-3 rounded-lg text-sm shadow-lg">
          <p className="font-medium mb-2">{data.date}</p>
          <div className="space-y-1">
            <p className="flex justify-between gap-4">
              <span>Revenue:</span>
              <span className="font-bold">{formatCurrency(data.revenue)}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span>Orders:</span>
              <span className="font-bold">{data.orders}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Welcome Header with Real-time Indicator */}
      <div className="bg-white p-6 rounded-3xl shadow border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600">
              Here's your restaurant dashboard overview for today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Online Ordering Toggle */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Online Orders</span>
              </div>
              <button
                onClick={toggleOnlineOrdering}
                disabled={updatingOnlineOrdering}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  onlineOrderingEnabled ? 'bg-purple-600' : 'bg-gray-300'
                } ${updatingOnlineOrdering ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    onlineOrderingEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-xs font-medium ${onlineOrderingEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                {onlineOrderingEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Data</span>
            </div>
            <button
              onClick={fetchDashboardStats}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Last updated: {formatDateTime(lastUpdated.toISOString())}
        </div>
      </div>

      {/* Payment Setup Banners */}
      <PaymentDisabledBanner />

      {/* No Data Message */}
      {!loading && hasNoData && (
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">No Orders Yet</h3>
              <p className="text-blue-700 text-sm mb-2">
                Your dashboard will show real-time data once customers start placing orders.
              </p>
              {user?.restaurantSlug && (
                <p className="text-blue-600 text-xs">
                  Menu Link: <code className="bg-blue-100 px-1 rounded">/{user.restaurantSlug}/menu</code>
                </p>
              )}
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={fixRestaurantData}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium disabled:opacity-50"
              >
                Fix Data
              </button>
              <Link
                href="/restaurant/orders"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                View Orders
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="bg-white p-6 rounded-3xl shadow border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : dashboardStats.totalOrders}
            </p>
            <div className="flex items-center text-xs text-blue-500">
              <ShoppingBag className="w-3 h-3 mr-1" />
              <span>All time</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-3xl shadow border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : formatCurrency(dashboardStats.totalRevenue)}
            </p>
            <div className="flex items-center text-xs text-green-500">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>Paid orders</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-3xl shadow border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-medium text-gray-500 mb-2">Today's Orders</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : dashboardStats.todayOrders}
            </p>
            <div className="flex items-center text-xs text-orange-500">
              <Bell className="w-3 h-3 mr-1" />
              <span>Today</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-3xl shadow border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-medium text-gray-500 mb-2">Unique Customers</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : dashboardStats.newCustomers}
            </p>
            <div className="flex items-center text-xs text-purple-500">
              <Users className="w-3 h-3 mr-1" />
              <span>Total</span>
            </div>
          </div>
        </motion.div>
      </div>



      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-3xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-orange-700 mb-1">Pending Orders</h3>
              <p className="text-2xl font-bold text-orange-900">
                {loading ? '...' : dashboardStats.pendingOrders}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-3xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-700 mb-1">Completed Orders</h3>
              <p className="text-2xl font-bold text-green-900">
                {loading ? '...' : dashboardStats.completedOrders}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-3xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-700 mb-1">Today's Revenue</h3>
              <p className="text-2xl font-bold text-blue-900">
                {loading ? '...' : formatCurrency(dashboardStats.todayRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Order Type Breakdown */}
      {!loading && recentOrders.length > 0 && (
        <div className="bg-white p-6 rounded-3xl shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Types Today</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Dine In</p>
                  <p className="text-xs text-blue-600">Restaurant orders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">
                  {recentOrders.filter(order => order.order_type === 'dine_in' || !order.order_type).length}
                </p>
                <p className="text-xs text-blue-600">orders</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Bike className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-900">Online</p>
                  <p className="text-xs text-purple-600">Delivery orders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-900">
                  {recentOrders.filter(order => order.order_type === 'online').length}
                </p>
                <p className="text-xs text-purple-600">orders</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Online Ordering Status:</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${onlineOrderingEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className={`font-medium ${onlineOrderingEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {onlineOrderingEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Quick Access */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-100 p-6 rounded-3xl border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-1">Advanced Analytics</h3>
              <p className="text-purple-700 text-sm mb-2">
                Get detailed insights with custom date ranges, revenue trends, and performance metrics
              </p>
              <div className="flex items-center gap-4 text-sm text-purple-600">
                <span>• Date Range Selection</span>
                <span>• Revenue Analysis</span>
                <span>• Top Dishes Report</span>
                <span>• Export Data</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/restaurant/analytics"
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium text-center"
            >
              View Analytics
            </Link>
            <p className="text-xs text-purple-600 text-center">Detailed Reports</p>
          </div>
        </div>
      </div>

      {/* Enhanced Revenue Dashboard */}
      <EnhancedRevenueDashboard />

      {/* Peak Hours Analysis */}
      <PeakHoursAnalysis />

      {/* Menu Performance Ranking */}
      <MenuPerformanceRanking />

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Analytics */}
        <div className="bg-white p-6 rounded-3xl shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">Order Analytics - Period View</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Real-time</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Period:</span>
                <select
                  value={chartPeriod}
                  onChange={(e) => setChartPeriod(e.target.value as any)}
                  className="text-sm border rounded-xl px-2 py-1 cursor-pointer hover:bg-gray-50"
                >
                  <option value="7days">7 Days</option>
                  <option value="30days">30 Days</option>
                  <option value="90days">90 Days</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold text-gray-900">
              {loading ? '...' : periodStats.totalOrders}
            </h3>
            <div className="flex items-center text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-xl">
              <BarChart3 className="w-3 h-3 mr-1" />
              <span>Period Orders</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {loading ? 'Loading...' : `${periodStats.totalOrders} orders in last ${chartPeriod === '7days' ? '7 days' : chartPeriod === '30days' ? '30 days' : '90 days'} (Avg: ${periodStats.avgOrdersPerDay}/day)`}
          </p>
          <div className="h-64 relative">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : orderAnalyticsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <BarChart3 className="w-12 h-12 mb-2" />
                <p className="text-sm">No order data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={orderAnalyticsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#888' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#888' }}
                  />
                  <Tooltip content={<OrderAnalyticsTooltip />} />

                  {/* Completed Orders line (dashed) */}
                  <Line
                    type="monotone"
                    dataKey="completedOrders"
                    stroke="#10b981"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                    name="Completed Orders"
                  />

                  {/* Total Orders line */}
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                    name="Total Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        {/* Revenue Profile */}
        <div className="bg-white p-6 rounded-3xl shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">Revenue Profile</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Revenue</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold text-gray-900">
              {loading ? '...' : formatCurrency(periodStats.totalRevenue)}
            </h3>
            <div className="flex items-center text-xs text-green-500 bg-green-50 px-2 py-1 rounded-xl">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>Period Revenue</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {loading ? 'Loading...' : `Revenue from ${orderAnalyticsData.reduce((sum, day) => sum + day.completedOrders, 0)} completed orders in last ${chartPeriod === '7days' ? '7 days' : chartPeriod === '30days' ? '30 days' : '90 days'}`}
          </p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-xs">Daily Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Trend</span>
            </div>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : revenueProfileData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <TrendingUp className="w-12 h-12 mb-2" />
                <p className="text-sm">No revenue data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueProfileData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#888' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#888' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<RevenueProfileTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      {/* Recent Order Activities */}
      <div className="bg-white rounded-3xl shadow border border-gray-200">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Recent Order Activities</h2>
              <p className="text-xs text-gray-500">Real-time order updates from your restaurant</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Updates</span>
              </div>
              <Link
                href="/restaurant/orders"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Orders →
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No orders yet</p>
            <p className="text-gray-400 text-sm">Orders will appear here when customers place them</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="px-6 py-3 border-b bg-gray-50">
              <div className="grid grid-cols-7 gap-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Order ID</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Customer</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Table/Address</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Date & Time</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Amount</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Invoice</span>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="max-h-96 overflow-y-auto">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-6 py-4 border-b last:border-b-0 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push('/restaurant/orders')}
                >
                  <div className="grid grid-cols-7 gap-4 items-center">
                    <div>
                      <span className="text-sm font-mono font-medium text-blue-600">
                        #{order.unique_order_id}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{order.customer_phone}</p>
                    </div>
                    <div>
                      {order.order_type === 'online' ? (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Bike className="w-3 h-3 text-purple-600" />
                            <span className="text-xs font-medium text-purple-600">Online Order</span>
                          </div>
                          <span className="text-sm text-gray-900 line-clamp-2" title={order.customer_address}>
                            {order.customer_address}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Utensils className="w-3 h-3 text-blue-600" />
                            <span className="text-xs font-medium text-blue-600">Dine In</span>
                          </div>
                          <span className="text-sm text-gray-900">Table {order.table_number}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">{formatDateTime(order.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                    <div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div>
                      {order.payment_status === 'completed' ? (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadInvoice(order)
                          }}
                          size="sm"
                          variant="outline"
                          disabled={downloadingInvoice === order.id}
                          className="text-xs"
                        >
                          {downloadingInvoice === order.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600"></div>
                          ) : (
                            <Download className="w-3 h-3" />
                          )}
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}