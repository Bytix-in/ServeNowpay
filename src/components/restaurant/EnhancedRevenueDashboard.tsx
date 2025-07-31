"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell
} from "recharts";

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

interface RevenueMetrics {
  totalRevenue: number;
  monthlyGrowth: number;
  avgOrderValue: number;
  revenuePerDay: number;
  bestDay: { date: string; revenue: number };
  worstDay: { date: string; revenue: number };
  totalOrders: number;
  conversionRate: number;
}

interface PaymentMethodData {
  method: string;
  amount: number;
  percentage: number;
  color: string;
}

export default function EnhancedRevenueDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7days' | '30days' | '90days'>('30days');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    monthlyGrowth: 0,
    avgOrderValue: 0,
    revenuePerDay: 0,
    bestDay: { date: '', revenue: 0 },
    worstDay: { date: '', revenue: 0 },
    totalOrders: 0,
    conversionRate: 0
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);

  // Fetch revenue analytics data
  const fetchRevenueAnalytics = async () => {
    if (!user?.restaurantId) return;

    setLoading(true);
    try {
      const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get orders data
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', user.restaurantId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process daily revenue data
      const dailyRevenue = processRevenueData(orders || [], days);
      setRevenueData(dailyRevenue);

      // Calculate metrics
      const calculatedMetrics = calculateMetrics(orders || [], dailyRevenue);
      setMetrics(calculatedMetrics);

      // Process payment methods
      const paymentData = processPaymentMethods(orders || []);
      setPaymentMethods(paymentData);

      // Process hourly data
      const hourlyRevenue = processHourlyData(orders || []);
      setHourlyData(hourlyRevenue);

    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process revenue data by day
  const processRevenueData = (orders: any[], days: number): RevenueData[] => {
    const data: RevenueData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= date && orderDate < nextDate && order.payment_status === 'completed';
      });
      
      const revenue = dayOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const avgOrderValue = dayOrders.length > 0 ? revenue / dayOrders.length : 0;
      
      data.push({
        date: date.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' }),
        revenue,
        orders: dayOrders.length,
        avgOrderValue
      });
    }
    
    return data;
  };

  // Calculate revenue metrics
  const calculateMetrics = (orders: any[], dailyData: RevenueData[]): RevenueMetrics => {
    const completedOrders = orders.filter(order => order.payment_status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalOrders = completedOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const revenuePerDay = dailyData.length > 0 ? totalRevenue / dailyData.length : 0;

    // Find best and worst days
    const sortedDays = [...dailyData].sort((a, b) => b.revenue - a.revenue);
    const bestDay = sortedDays[0] || { date: '', revenue: 0 };
    const worstDay = sortedDays[sortedDays.length - 1] || { date: '', revenue: 0 };

    // Calculate growth (compare first half vs second half of period)
    const midPoint = Math.floor(dailyData.length / 2);
    const firstHalf = dailyData.slice(0, midPoint);
    const secondHalf = dailyData.slice(midPoint);
    
    const firstHalfRevenue = firstHalf.reduce((sum, day) => sum + day.revenue, 0);
    const secondHalfRevenue = secondHalf.reduce((sum, day) => sum + day.revenue, 0);
    
    const monthlyGrowth = firstHalfRevenue > 0 
      ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 
      : 0;

    // Calculate conversion rate (completed vs total orders)
    const allOrders = orders.length;
    const conversionRate = allOrders > 0 ? (totalOrders / allOrders) * 100 : 0;

    return {
      totalRevenue,
      monthlyGrowth,
      avgOrderValue,
      revenuePerDay,
      bestDay,
      worstDay,
      totalOrders,
      conversionRate
    };
  };

  // Process payment methods data
  const processPaymentMethods = (orders: any[]): PaymentMethodData[] => {
    const completedOrders = orders.filter(order => order.payment_status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total_amount, 0);
    
    // For now, we'll simulate payment methods since we don't have this data
    // In a real implementation, you'd track this in your orders table
    const methods = [
      { method: 'Online Payment', amount: totalRevenue * 0.7, color: '#3b82f6' },
      { method: 'Cash', amount: totalRevenue * 0.25, color: '#10b981' },
      { method: 'Card', amount: totalRevenue * 0.05, color: '#f59e0b' }
    ];

    return methods.map(method => ({
      ...method,
      percentage: totalRevenue > 0 ? (method.amount / totalRevenue) * 100 : 0
    }));
  };

  // Process hourly revenue data
  const processHourlyData = (orders: any[]) => {
    const hourlyRevenue = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      revenue: 0,
      orders: 0
    }));

    orders
      .filter(order => order.payment_status === 'completed')
      .forEach(order => {
        const hour = new Date(order.created_at).getHours();
        hourlyRevenue[hour].revenue += order.total_amount;
        hourlyRevenue[hour].orders += 1;
      });

    return hourlyRevenue.filter(data => data.revenue > 0);
  };

  useEffect(() => {
    fetchRevenueAnalytics();
  }, [user?.restaurantId, period]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Get growth indicator
  const getGrowthIndicator = (growth: number) => {
    if (growth > 0) return { icon: ArrowUp, color: 'text-green-500', bg: 'bg-green-50' };
    if (growth < 0) return { icon: ArrowDown, color: 'text-red-500', bg: 'bg-red-50' };
    return { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-50' };
  };

  const growthIndicator = getGrowthIndicator(metrics.monthlyGrowth);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black text-white p-3 rounded-lg text-sm shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="flex justify-between gap-4">
              <span>{entry.name}:</span>
              <span className="font-bold">
                {entry.name === 'Revenue' ? formatCurrency(entry.value) : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Revenue Dashboard</h2>
          <p className="text-gray-600">Comprehensive revenue analytics and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          <button
            onClick={fetchRevenueAnalytics}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="bg-white p-6 rounded-xl shadow border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${growthIndicator.bg}`}>
              <growthIndicator.icon className={`w-3 h-3 ${growthIndicator.color}`} />
              <span className={growthIndicator.color}>
                {Math.abs(metrics.monthlyGrowth).toFixed(1)}%
              </span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : formatCurrency(metrics.totalRevenue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {period === '7days' ? 'Last 7 days' : period === '30days' ? 'Last 30 days' : 'Last 90 days'}
          </p>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Avg Order Value</h3>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : formatCurrency(metrics.avgOrderValue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Per completed order
          </p>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Daily Average</h3>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : formatCurrency(metrics.revenuePerDay)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Revenue per day
          </p>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Conversion Rate</h3>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : `${metrics.conversionRate.toFixed(1)}%`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Orders completed
          </p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Average Order Value Chart */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Order Value</h3>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `₹${value.toFixed(0)}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="avgOrderValue"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name="Avg Order Value"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best & Worst Days */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Days</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Best Day</span>
              </div>
              <p className="text-lg font-bold text-green-900">{metrics.bestDay.date}</p>
              <p className="text-sm text-green-700">{formatCurrency(metrics.bestDay.revenue)}</p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Lowest Day</span>
              </div>
              <p className="text-lg font-bold text-red-900">{metrics.worstDay.date}</p>
              <p className="text-sm text-red-700">{formatCurrency(metrics.worstDay.revenue)}</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: method.color }}
                  ></div>
                  <span className="text-sm text-gray-700">{method.method}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(method.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {method.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Orders</span>
              <span className="text-lg font-bold text-gray-900">{metrics.totalOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Growth Rate</span>
              <span className={`text-lg font-bold ${growthIndicator.color}`}>
                {metrics.monthlyGrowth > 0 ? '+' : ''}{metrics.monthlyGrowth.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-lg font-bold text-green-600">
                {metrics.conversionRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Revenue Pattern */}
      {hourlyData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Revenue Pattern</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}