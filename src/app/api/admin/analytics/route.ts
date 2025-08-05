import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: NextRequest) {
  try {

    // Get query parameters for date filtering
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Fetch all data using admin client
    const [restaurantsResult, ordersResult, transactionsResult, menuItemsResult] = await Promise.all([
      supabaseAdmin.from('restaurants').select('*'),
      supabaseAdmin.from('orders').select('*').gte('created_at', startDate.toISOString()),
      supabaseAdmin.from('transactions').select('*').gte('created_at', startDate.toISOString()),
      supabaseAdmin.from('menu_items').select('*')
    ])

    if (restaurantsResult.error) throw restaurantsResult.error
    if (ordersResult.error) throw ordersResult.error
    if (transactionsResult.error) throw transactionsResult.error
    if (menuItemsResult.error) throw menuItemsResult.error

    const restaurants = restaurantsResult.data || []
    const orders = ordersResult.data || []
    const transactions = transactionsResult.data || []
    const menuItems = menuItemsResult.data || []
    
    // Get recent orders separately
    const recentOrdersResult = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    const recentOrders = recentOrdersResult.data || []

    // Calculate analytics (no revenue/amounts)
    const totalRestaurants = restaurants.length
    const activeRestaurants = restaurants.filter(r => r.status === 'active').length
    const totalOrders = orders.length
    const completedOrders = orders.filter(o => o.status === 'completed').length
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    
    const successfulTransactions = transactions.filter(t => t.status === 'success').length
    const totalTransactions = transactions.length

    // Create a restaurant lookup map
    const restaurantMap = new Map(restaurants.map(r => [r.id, r]))

    // Restaurant performance (no revenue)
    const restaurantPerformance = restaurants.map(restaurant => {
      const restaurantOrders = orders.filter(o => o.restaurant_id === restaurant.id)
      const completedRestaurantOrders = restaurantOrders.filter(o => o.status === 'completed')
      const restaurantMenuItems = menuItems.filter(m => m.restaurant_id === restaurant.id)
      
      return {
        id: restaurant.id,
        name: restaurant.name,
        status: restaurant.status,
        totalOrders: restaurantOrders.length,
        completedOrders: completedRestaurantOrders.length,
        menuItemsCount: restaurantMenuItems.length,
        seatingCapacity: restaurant.seating_capacity,
        cuisineTags: restaurant.cuisine_tags || '',
        createdAt: restaurant.created_at
      }
    })

    // Daily order trend (last 7 days)
    const dailyOrderTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.created_at)
        return orderDate >= dayStart && orderDate <= dayEnd
      })
      
      const dayCompletedOrders = dayOrders.filter(o => o.status === 'completed')
      
      dailyOrderTrend.push({
        date: dayStart.toISOString().split('T')[0],
        totalOrders: dayOrders.length,
        completedOrders: dayCompletedOrders.length
      })
    }

    // Order status distribution
    const orderStatusDistribution = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Payment status distribution
    const paymentStatusDistribution = orders.reduce((acc, order) => {
      acc[order.payment_status] = (acc[order.payment_status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Top performing restaurants (by order count)
    const topRestaurants = restaurantPerformance
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 5)

    // Cuisine popularity (by restaurant count and orders)
    const cuisinePopularity = restaurants.reduce((acc, restaurant) => {
      if (restaurant.cuisine_tags) {
        const cuisines = restaurant.cuisine_tags.split(',').map(c => c.trim())
        cuisines.forEach(cuisine => {
          if (!acc[cuisine]) acc[cuisine] = { restaurantCount: 0, totalOrders: 0 }
          acc[cuisine].restaurantCount += 1
          
          const restaurantOrders = orders.filter(o => o.restaurant_id === restaurant.id)
          acc[cuisine].totalOrders += restaurantOrders.length
        })
      }
      return acc
    }, {} as Record<string, { restaurantCount: number; totalOrders: number }>)

    // Restaurant growth (new restaurants per month)
    const restaurantGrowth = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthRestaurants = restaurants.filter(r => {
        const createdDate = new Date(r.created_at)
        return createdDate >= monthStart && createdDate <= monthEnd
      })
      
      restaurantGrowth.push({
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
        count: monthRestaurants.length
      })
    }

    // Order completion rate by restaurant
    const restaurantCompletionRates = restaurantPerformance.map(restaurant => ({
      name: restaurant.name,
      completionRate: restaurant.totalOrders > 0 
        ? Math.round((restaurant.completedOrders / restaurant.totalOrders) * 100)
        : 0,
      totalOrders: restaurant.totalOrders
    })).sort((a, b) => b.completionRate - a.completionRate)

    // Peak hours analysis (orders by hour)
    const hourlyOrderDistribution = Array.from({ length: 24 }, (_, hour) => {
      const hourOrders = orders.filter(order => {
        const orderHour = new Date(order.created_at).getHours()
        return orderHour === hour
      })
      return {
        hour,
        orderCount: hourOrders.length
      }
    })

    // Customer activity patterns
    const customerInsights = {
      uniqueCustomers: new Set(orders.map(o => o.customer_phone)).size,
      repeatCustomers: orders.reduce((acc, order) => {
        const phone = order.customer_phone
        acc[phone] = (acc[phone] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      averageOrdersPerCustomer: orders.length > 0 
        ? Math.round(orders.length / new Set(orders.map(o => o.customer_phone)).size * 100) / 100
        : 0
    }

    const repeatCustomerCount = Object.values(customerInsights.repeatCustomers)
      .filter(count => count > 1).length

    // Menu item popularity across all restaurants
    const menuItemStats = menuItems.reduce((acc, item) => {
      const dishType = item.dish_type || 'Other'
      if (!acc[dishType]) acc[dishType] = { count: 0, restaurants: new Set() }
      acc[dishType].count += 1
      acc[dishType].restaurants.add(item.restaurant_id)
      return acc
    }, {} as Record<string, { count: number; restaurants: Set<string> }>)

    const dishTypePopularity = Object.entries(menuItemStats).map(([dishType, data]) => ({
      dishType,
      itemCount: data.count,
      restaurantCount: data.restaurants.size
    })).sort((a, b) => b.itemCount - a.itemCount)

    // Restaurant status distribution
    const restaurantStatusDistribution = restaurants.reduce((acc, restaurant) => {
      acc[restaurant.status] = (acc[restaurant.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Average preparation time by restaurant
    const avgPrepTimeByRestaurant = restaurants.map(restaurant => {
      const restaurantMenuItems = menuItems.filter(m => m.restaurant_id === restaurant.id)
      const avgPrepTime = restaurantMenuItems.length > 0
        ? Math.round(restaurantMenuItems.reduce((sum, item) => sum + (item.preparation_time || 0), 0) / restaurantMenuItems.length)
        : 0
      
      return {
        name: restaurant.name,
        avgPrepTime,
        menuItemsCount: restaurantMenuItems.length
      }
    }).filter(r => r.menuItemsCount > 0).sort((a, b) => a.avgPrepTime - b.avgPrepTime)

    return NextResponse.json({
      overview: {
        totalRestaurants,
        activeRestaurants,
        totalOrders,
        completedOrders,
        pendingOrders,
        successfulTransactions,
        totalTransactions,
        uniqueCustomers: customerInsights.uniqueCustomers,
        repeatCustomers: repeatCustomerCount,
        averageOrdersPerCustomer: customerInsights.averageOrdersPerCustomer
      },
      trends: {
        dailyOrderTrend,
        orderStatusDistribution,
        paymentStatusDistribution,
        restaurantGrowth,
        hourlyOrderDistribution
      },
      restaurants: {
        performance: restaurantPerformance,
        topPerforming: topRestaurants,
        completionRates: restaurantCompletionRates.slice(0, 10),
        statusDistribution: restaurantStatusDistribution,
        avgPrepTimes: avgPrepTimeByRestaurant.slice(0, 10)
      },
      insights: {
        cuisinePopularity: Object.entries(cuisinePopularity)
          .map(([cuisine, data]) => ({ cuisine, ...data }))
          .sort((a, b) => b.totalOrders - a.totalOrders)
          .slice(0, 10),
        dishTypePopularity: dishTypePopularity.slice(0, 8),
        customerInsights: {
          uniqueCustomers: customerInsights.uniqueCustomers,
          repeatCustomers: repeatCustomerCount,
          averageOrdersPerCustomer: customerInsights.averageOrdersPerCustomer,
          repeatCustomerRate: customerInsights.uniqueCustomers > 0 
            ? Math.round((repeatCustomerCount / customerInsights.uniqueCustomers) * 100)
            : 0
        }
      },
      recentActivity: recentOrders.map(order => ({
        id: order.id,
        customerName: order.customer_name,
        restaurantName: restaurantMap.get(order.restaurant_id)?.name || 'Unknown',
        status: order.status,
        createdAt: order.created_at
      }))
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}