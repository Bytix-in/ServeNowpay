import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!restaurantId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: restaurantId, startDate, endDate' },
        { status: 400 }
      )
    }

    // Create date range for filtering
    const startDateTime = new Date(startDate + 'T00:00:00.000Z')
    const endDateTime = new Date(endDate + 'T23:59:59.999Z')

    // Fetch orders within date range with optimized query
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        unique_order_id,
        customer_name,
        customer_phone,
        created_at,
        payment_status,
        payment_method,
        total_amount,
        items,
        table_number,
        status
      `)
      .eq('restaurant_id', restaurantId)
      .gte('created_at', startDateTime.toISOString())
      .lte('created_at', endDateTime.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        uniqueCustomers: 0,
        paymentMethods: { online: 0, cash: 0 },
        topDishes: [],
        dailyData: [],
        orders: []
      })
    }

    // Calculate analytics
    const completedOrders = orders.filter(order => order.payment_status === 'completed')
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const uniqueCustomers = new Set(orders.map(order => order.customer_phone)).size

    // Payment method breakdown
    const onlinePayments = completedOrders.filter(order => 
      ['online', 'card', 'upi', 'digital', 'razorpay', 'cashfree'].includes(order.payment_method?.toLowerCase() || '')
    ).length
    const cashPayments = completedOrders.length - onlinePayments

    // Top dishes analysis
    const dishMap = new Map()
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const dishName = item.dish_name || item.name || 'Unknown Dish'
          const quantity = parseInt(item.quantity) || 1
          const price = parseFloat(item.price) || parseFloat(item.total) || 0
          
          if (dishMap.has(dishName)) {
            const existing = dishMap.get(dishName)
            dishMap.set(dishName, {
              quantity: existing.quantity + quantity,
              revenue: existing.revenue + (price * quantity)
            })
          } else {
            dishMap.set(dishName, {
              quantity,
              revenue: price * quantity
            })
          }
        })
      }
    })

    const topDishes = Array.from(dishMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    // Daily data for charts - optimized grouping
    const dailyMap = new Map()
    orders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0]
      const revenue = order.payment_status === 'completed' ? (order.total_amount || 0) : 0
      
      if (dailyMap.has(date)) {
        const existing = dailyMap.get(date)
        existing.revenue += revenue
        existing.orders += 1
        existing.customers.add(order.customer_phone)
      } else {
        dailyMap.set(date, {
          revenue,
          orders: 1,
          customers: new Set([order.customer_phone])
        })
      }
    })

    // Convert to array and calculate unique customers per day
    const dailyData = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
        customers: data.customers.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Return analytics data
    return NextResponse.json({
      totalRevenue,
      totalOrders: orders.length,
      averageOrderValue: totalRevenue / (completedOrders.length || 1),
      uniqueCustomers,
      paymentMethods: {
        online: onlinePayments,
        cash: cashPayments
      },
      topDishes,
      dailyData,
      orders: orders.map(order => ({
        id: order.id,
        unique_order_id: order.unique_order_id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        created_at: order.created_at,
        payment_status: order.payment_status,
        total_amount: order.total_amount,
        items: order.items,
        table_number: order.table_number
      }))
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, startDate, endDate, exportFormat } = body

    if (!restaurantId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Create date range for filtering
    const startDateTime = new Date(startDate + 'T00:00:00.000Z')
    const endDateTime = new Date(endDate + 'T23:59:59.999Z')

    // Fetch detailed orders for export
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', startDateTime.toISOString())
      .lte('created_at', endDateTime.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch orders for export' },
        { status: 500 }
      )
    }

    if (exportFormat === 'csv') {
      // Generate CSV data
      const csvHeaders = [
        'Order ID',
        'Customer Name',
        'Phone',
        'Date',
        'Time',
        'Amount',
        'Payment Status',
        'Payment Method',
        'Table',
        'Items',
        'Status'
      ]

      const csvRows = orders?.map(order => [
        order.unique_order_id || order.id,
        order.customer_name || 'N/A',
        order.customer_phone || 'N/A',
        new Date(order.created_at).toLocaleDateString('en-IN'),
        new Date(order.created_at).toLocaleTimeString('en-IN'),
        order.total_amount || 0,
        order.payment_status || 'N/A',
        order.payment_method || 'N/A',
        order.table_number || 'N/A',
        order.items?.map((item: any) => `${item.dish_name || item.name} (${item.quantity})`).join('; ') || 'N/A',
        order.status || 'N/A'
      ]) || []

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${startDate}-to-${endDate}.csv"`
        }
      })
    }

    return NextResponse.json({ orders })

  } catch (error) {
    console.error('Analytics export error:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}