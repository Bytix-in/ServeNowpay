'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import {
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  CreditCard,
  Banknote,
  Clock,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Filter,
  ChevronDown,
  Eye,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  uniqueCustomers: number
  paymentMethods: {
    online: number
    cash: number
  }
  topDishes: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  dailyData: Array<{
    date: string
    revenue: number
    orders: number
    customers: number
  }>
  orders: Array<{
    id: string
    unique_order_id: string
    customer_name: string
    customer_phone: string
    created_at: string
    payment_status: string
    total_amount: number
    items: any[]
    table_number: string
  }>
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function RestaurantAnalytics() {
  const { user } = useAuth()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null)

  // Initialize dates based on selected period
  useEffect(() => {
    const today = new Date()
    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    switch (selectedPeriod) {
      case 'today':
        setStartDate(formatDate(today))
        setEndDate(formatDate(today))
        break
      case 'yesterday':
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        setStartDate(formatDate(yesterday))
        setEndDate(formatDate(yesterday))
        break
      case 'last7days':
        const week = new Date(today)
        week.setDate(week.getDate() - 7)
        setStartDate(formatDate(week))
        setEndDate(formatDate(today))
        break
      case 'last30days':
        const month = new Date(today)
        month.setDate(month.getDate() - 30)
        setStartDate(formatDate(month))
        setEndDate(formatDate(today))
        break
      case 'thisMonth':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        setStartDate(formatDate(monthStart))
        setEndDate(formatDate(today))
        break
      case 'custom':
        // Keep existing dates for custom selection
        break
    }
  }, [selectedPeriod])

  // Fetch analytics data using API endpoint
  const fetchAnalyticsData = async () => {
    if (!user?.restaurantId || !startDate || !endDate) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/restaurant/analytics?restaurantId=${user.restaurantId}&startDate=${startDate}&endDate=${endDate}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const data = await response.json()
      setAnalyticsData(data)

    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Fallback to empty data
      setAnalyticsData({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        uniqueCustomers: 0,
        paymentMethods: { online: 0, cash: 0 },
        topDishes: [],
        dailyData: [],
        orders: []
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalyticsData()
    }
  }, [startDate, endDate, user?.restaurantId])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Format datetime
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Export data to CSV using API endpoint
  const exportToCSV = async () => {
    if (!user?.restaurantId || !startDate || !endDate) return

    try {
      const response = await fetch('/api/restaurant/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: user.restaurantId,
          startDate,
          endDate,
          exportFormat: 'csv'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      // Download the CSV file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-${startDate}-to-${endDate}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  // Print invoice for a specific order
  const printInvoice = async (order: any) => {
    try {
      setDownloadingInvoice(order.id)
      
      // Generate invoice HTML using the existing GET API
      const response = await fetch(
        `/api/dynamic-invoice?orderId=${order.id}&customerPhone=${order.customer_phone}&format=html`
      )

      if (!response.ok) {
        throw new Error('Failed to generate invoice')
      }

      // Get the HTML content
      const htmlContent = await response.text()
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      
      if (!printWindow) {
        alert('Please allow popups to print invoices')
        return
      }

      // Write the invoice HTML to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - ${order.unique_order_id || order.id.slice(-8)}</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: Arial, sans-serif; 
              background: white;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
            }
            .print-button {
              position: fixed;
              top: 10px;
              right: 10px;
              background: #3b82f6;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              z-index: 1000;
            }
            .print-button:hover {
              background: #2563eb;
            }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">Print Invoice</button>
          ${htmlContent}
          <script>
            // Auto-focus and print
            window.onload = function() {
              window.focus();
              setTimeout(function() {
                window.print();
              }, 500);
            }
            
            // Close window after printing
            window.onafterprint = function() {
              setTimeout(function() {
                window.close();
              }, 1000);
            }
          </script>
        </body>
        </html>
      `)
      
      printWindow.document.close()
      
    } catch (error) {
      console.error('Error printing invoice:', error)
      alert('Failed to generate invoice. Please try again.')
    } finally {
      setDownloadingInvoice(null)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Revenue Analytics</h1>
            <p className="text-gray-600">Detailed insights into your restaurant's performance</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Period Selection */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Date Range Inputs */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setSelectedPeriod('custom')
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setSelectedPeriod('custom')
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={fetchAnalyticsData}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              {analyticsData && (
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {analyticsData && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl shadow border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analyticsData.totalRevenue)}
                  </p>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-3xl shadow border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.totalOrders}
                  </p>
                  <p className="text-sm text-gray-500">Total Orders</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-3xl shadow border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analyticsData.averageOrderValue)}
                  </p>
                  <p className="text-sm text-gray-500">Avg Order Value</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-3xl shadow border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.uniqueCustomers}
                  </p>
                  <p className="text-sm text-gray-500">Unique Customers</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <div className="bg-white p-6 rounded-3xl shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.dailyData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => formatDate(value)}
                    />
                    <YAxis tickFormatter={(value) => `₹${value}`} />
                    <Tooltip 
                      labelFormatter={(value) => formatDate(value)}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Orders Trend */}
            <div className="bg-white p-6 rounded-3xl shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => formatDate(value)}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => formatDate(value)}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Payment Methods & Top Dishes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods */}
            <div className="bg-white p-6 rounded-3xl shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <span className="font-medium text-gray-900">Online Payments</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">
                      {analyticsData.paymentMethods.online}
                    </p>
                    <p className="text-sm text-gray-500">orders</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Banknote className="w-6 h-6 text-green-600" />
                    <span className="font-medium text-gray-900">Cash Payments</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      {analyticsData.paymentMethods.cash}
                    </p>
                    <p className="text-sm text-gray-500">orders</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Dishes */}
            <div className="bg-white p-6 rounded-3xl shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Ordered Dishes</h3>
              <div className="space-y-3">
                {analyticsData.topDishes.slice(0, 5).map((dish, index) => (
                  <div key={dish.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{dish.name}</p>
                        <p className="text-sm text-gray-500">{dish.quantity} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(dish.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Orders List */}
          <div className="bg-white rounded-3xl shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detailed Orders ({analyticsData.orders.length})
                </h3>
                <Button
                  onClick={() => setShowOrderDetails(!showOrderDetails)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showOrderDetails ? 'Hide' : 'Show'} Details
                </Button>
              </div>
            </div>
            
            {showOrderDetails && (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Order ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date & Time</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Table</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Items</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm text-blue-600">
                              {order.unique_order_id || order.id.slice(-8)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {order.customer_name || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.customer_phone || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-900">
                              {formatDateTime(order.created_at)}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-green-600">
                              {formatCurrency(order.total_amount)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.payment_status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : order.payment_status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {order.payment_status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-900">
                              {order.table_number || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="max-w-xs">
                              <p className="text-sm text-gray-900 truncate">
                                {order.items?.map((item: any) => 
                                  `${item.dish_name || item.name} (${item.quantity})`
                                ).join(', ') || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {order.payment_status === 'completed' ? (
                                <Button
                                  onClick={() => printInvoice(order)}
                                  disabled={downloadingInvoice === order.id}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                >
                                  {downloadingInvoice === order.id ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Download className="w-3 h-3" />
                                  )}
                                  <span className="text-xs">
                                    {downloadingInvoice === order.id ? 'Loading...' : 'Print Invoice'}
                                  </span>
                                </Button>
                              ) : (
                                <span className="text-xs text-gray-400 px-2 py-1">
                                  Payment pending
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}