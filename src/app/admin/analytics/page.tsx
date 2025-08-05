'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Users,
  Activity,
  Calendar,
  Filter,
  Clock,
  Target,
  UserCheck,
  ChefHat,
  PieChart
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalRestaurants: number
    activeRestaurants: number
    totalOrders: number
    completedOrders: number
    pendingOrders: number
    successfulTransactions: number
    totalTransactions: number
    uniqueCustomers: number
    repeatCustomers: number
    averageOrdersPerCustomer: number
  }
  trends: {
    dailyOrderTrend: Array<{
      date: string
      totalOrders: number
      completedOrders: number
    }>
    orderStatusDistribution: Record<string, number>
    paymentStatusDistribution: Record<string, number>
    restaurantGrowth: Array<{
      month: string
      count: number
    }>
    hourlyOrderDistribution: Array<{
      hour: number
      orderCount: number
    }>
  }
  restaurants: {
    performance: Array<{
      id: string
      name: string
      status: string
      totalOrders: number
      completedOrders: number
      menuItemsCount: number
      seatingCapacity: number
      cuisineTags: string
      createdAt: string
    }>
    topPerforming: Array<{
      id: string
      name: string
      totalOrders: number
      completedOrders: number
    }>
    completionRates: Array<{
      name: string
      completionRate: number
      totalOrders: number
    }>
    statusDistribution: Record<string, number>
    avgPrepTimes: Array<{
      name: string
      avgPrepTime: number
      menuItemsCount: number
    }>
  }
  insights: {
    cuisinePopularity: Array<{
      cuisine: string
      restaurantCount: number
      totalOrders: number
    }>
    dishTypePopularity: Array<{
      dishType: string
      itemCount: number
      restaurantCount: number
    }>
    customerInsights: {
      uniqueCustomers: number
      repeatCustomers: number
      averageOrdersPerCustomer: number
      repeatCustomerRate: number
    }
  }
  recentActivity: Array<{
    id: string
    customerName: string
    restaurantName: string
    status: string
    createdAt: string
  }>
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch analytics data')
      }
      
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Overview of all restaurant performance and metrics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Restaurants</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalRestaurants}</p>
              <p className="text-sm text-green-600">
                {data.overview.activeRestaurants} active
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalOrders}</p>
              <p className="text-sm text-green-600">
                {data.overview.completedOrders} completed
              </p>
            </div>
            <ShoppingCart className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Customers</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.uniqueCustomers}</p>
              <p className="text-sm text-blue-600">
                {data.overview.repeatCustomers} repeat customers
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Orders/Customer</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.averageOrdersPerCustomer}</p>
              <p className="text-sm text-purple-600">
                Customer engagement
              </p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Secondary Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.pendingOrders}</p>
              <p className="text-sm text-yellow-600">Awaiting completion</p>
            </div>
            <Activity className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalTransactions}</p>
              <p className="text-sm text-green-600">
                {data.overview.successfulTransactions} successful
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Repeat Customer Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.insights.customerInsights.repeatCustomerRate}%</p>
              <p className="text-sm text-indigo-600">Customer loyalty</p>
            </div>
            <PieChart className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Order Trend */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Daily Order Trend
          </h3>
          <div className="space-y-3">
            {data.trends.dailyOrderTrend.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{formatDate(day.date)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-green-600">{day.completedOrders} completed</span>
                  <span className="font-medium">{day.totalOrders} total</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Order Status Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(data.trends.orderStatusDistribution).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm capitalize text-gray-600">{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Restaurant Growth */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Restaurant Growth (6 Months)
          </h3>
          <div className="space-y-3">
            {data.trends.restaurantGrowth.map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {new Date(month.month + '-01').toLocaleDateString('en-IN', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </span>
                <span className="font-medium">{month.count} new restaurants</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Peak Order Hours
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.trends.hourlyOrderDistribution
              .filter(hour => hour.orderCount > 0)
              .sort((a, b) => b.orderCount - a.orderCount)
              .slice(0, 8)
              .map((hour) => (
                <div key={hour.hour} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {hour.hour.toString().padStart(2, '0')}:00 - {(hour.hour + 1).toString().padStart(2, '0')}:00
                  </span>
                  <span className="font-medium">{hour.orderCount} orders</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Restaurant Performance */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Restaurant Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Menu Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Capacity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.restaurants.performance.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{restaurant.name}</div>
                      <div className="text-sm text-gray-500">{restaurant.cuisineTags}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      restaurant.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {restaurant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {restaurant.totalOrders}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    {restaurant.completedOrders}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {restaurant.menuItemsCount}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {restaurant.seatingCapacity || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restaurant Completion Rates */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Restaurant Completion Rates
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Completion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Orders
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.restaurants.completionRates.map((restaurant) => (
                <tr key={restaurant.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {restaurant.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className={`h-2 rounded-full ${
                            restaurant.completionRate >= 80 ? 'bg-green-500' :
                            restaurant.completionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${restaurant.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{restaurant.completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {restaurant.totalOrders}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Cuisines */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Popular Cuisines</h3>
          <div className="space-y-3">
            {data.insights.cuisinePopularity.slice(0, 6).map((cuisine) => (
              <div key={cuisine.cuisine} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{cuisine.cuisine}</span>
                <div className="text-right">
                  <div className="font-medium">{cuisine.totalOrders} orders</div>
                  <div className="text-xs text-gray-500">{cuisine.restaurantCount} restaurants</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dish Type Popularity */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Popular Dish Types
          </h3>
          <div className="space-y-3">
            {data.insights.dishTypePopularity.slice(0, 6).map((dishType) => (
              <div key={dishType.dishType} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{dishType.dishType}</span>
                <div className="text-right">
                  <div className="font-medium">{dishType.itemCount} items</div>
                  <div className="text-xs text-gray-500">{dishType.restaurantCount} restaurants</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Orders
          </h3>
          <div className="space-y-3">
            {data.recentActivity.slice(0, 6).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{activity.customerName}</div>
                  <div className="text-xs text-gray-500">{activity.restaurantName}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    activity.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {activity.status}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(activity.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Average Preparation Times */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Average Preparation Times
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.restaurants.avgPrepTimes.map((restaurant) => (
              <div key={restaurant.name} className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium text-gray-900">{restaurant.name}</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {restaurant.avgPrepTime} min
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {restaurant.menuItemsCount} menu items
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}