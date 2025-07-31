"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  Clock,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  Star,
  Activity,
  RefreshCw,
  Sun,
  Moon,
  Coffee,
  Utensils
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  Cell,
  PieChart,
  Legend
} from "recharts";

interface HourlyData {
  hour: number;
  displayHour: string;
  orders: number;
  revenue: number;
  avgOrderValue: number;
  customers: number;
  period: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
}

interface DayOfWeekData {
  day: string;
  dayIndex: number;
  orders: number;
  revenue: number;
  avgOrders: number;
}

interface PeakInsights {
  peakHour: { hour: string; orders: number; revenue: number };
  quietHour: { hour: string; orders: number; revenue: number };
  peakDay: { day: string; orders: number; revenue: number };
  quietDay: { day: string; orders: number; revenue: number };
  rushPeriods: Array<{ period: string; hours: string; orders: number }>;
  recommendations: string[];
}

const HOUR_PERIODS = {
  Morning: { start: 6, end: 11, icon: Sun, color: '#f59e0b' },
  Afternoon: { start: 12, end: 17, icon: Coffee, color: '#10b981' },
  Evening: { start: 18, end: 22, icon: Utensils, color: '#3b82f6' },
  Night: { start: 23, end: 5, icon: Moon, color: '#6366f1' }
};

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function PeakHoursAnalysis() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7days' | '30days' | '90days'>('30days');
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [weeklyData, setWeeklyData] = useState<DayOfWeekData[]>([]);
  const [insights, setInsights] = useState<PeakInsights>({
    peakHour: { hour: '', orders: 0, revenue: 0 },
    quietHour: { hour: '', orders: 0, revenue: 0 },
    peakDay: { day: '', orders: 0, revenue: 0 },
    quietDay: { day: '', orders: 0, revenue: 0 },
    rushPeriods: [],
    recommendations: []
  });
  const [selectedView, setSelectedView] = useState<'hourly' | 'daily' | 'insights'>('hourly');

  // Fetch peak hours data
  const fetchPeakHoursData = async () => {
    if (!user?.restaurantId) return;

    setLoading(true);
    try {
      const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', user.restaurantId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process hourly data
      const hourlyAnalysis = processHourlyData(orders || []);
      setHourlyData(hourlyAnalysis);

      // Process weekly data
      const weeklyAnalysis = processWeeklyData(orders || []);
      setWeeklyData(weeklyAnalysis);

      // Generate insights
      const generatedInsights = generateInsights(hourlyAnalysis, weeklyAnalysis);
      setInsights(generatedInsights);

    } catch (error) {
      console.error('Error fetching peak hours data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process hourly data
  const processHourlyData = (orders: any[]): HourlyData[] => {
    const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      displayHour: formatHour(hour),
      orders: 0,
      revenue: 0,
      avgOrderValue: 0,
      customers: new Set<string>(),
      period: getTimePeriod(hour)
    }));

    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const hour = orderDate.getHours();
      
      hourlyStats[hour].orders += 1;
      if (order.payment_status === 'completed') {
        hourlyStats[hour].revenue += order.total_amount;
      }
      hourlyStats[hour].customers.add(order.customer_phone);
    });

    return hourlyStats.map(stat => ({
      ...stat,
      customers: stat.customers.size,
      avgOrderValue: stat.orders > 0 ? stat.revenue / stat.orders : 0
    }));
  };

  // Process weekly data
  const processWeeklyData = (orders: any[]): DayOfWeekData[] => {
    const weeklyStats = DAYS_OF_WEEK.map((day, index) => ({
      day,
      dayIndex: index,
      orders: 0,
      revenue: 0,
      avgOrders: 0
    }));

    const dayCount = Array(7).fill(0);

    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const dayIndex = orderDate.getDay();
      
      weeklyStats[dayIndex].orders += 1;
      if (order.payment_status === 'completed') {
        weeklyStats[dayIndex].revenue += order.total_amount;
      }
      dayCount[dayIndex] += 1;
    });

    // Calculate average orders per occurrence of each day
    const totalWeeks = Math.ceil(orders.length > 0 ? 
      (Date.now() - new Date(orders[0].created_at).getTime()) / (7 * 24 * 60 * 60 * 1000) : 1);

    return weeklyStats.map((stat, index) => ({
      ...stat,
      avgOrders: totalWeeks > 0 ? stat.orders / totalWeeks : 0
    }));
  };

  // Generate insights and recommendations
  const generateInsights = (hourlyData: HourlyData[], weeklyData: DayOfWeekData[]): PeakInsights => {
    // Find peak and quiet hours
    const sortedHours = [...hourlyData].sort((a, b) => b.orders - a.orders);
    const peakHour = sortedHours[0];
    const quietHour = sortedHours[sortedHours.length - 1];

    // Find peak and quiet days
    const sortedDays = [...weeklyData].sort((a, b) => b.orders - a.orders);
    const peakDay = sortedDays[0];
    const quietDay = sortedDays[sortedDays.length - 1];

    // Identify rush periods
    const rushPeriods = Object.entries(HOUR_PERIODS).map(([period, config]) => {
      const periodOrders = hourlyData
        .filter(h => {
          if (period === 'Night') {
            return h.hour >= config.start || h.hour <= config.end;
          }
          return h.hour >= config.start && h.hour <= config.end;
        })
        .reduce((sum, h) => sum + h.orders, 0);

      const hours = period === 'Night' 
        ? `${config.start}:00 - ${config.end + 1}:00`
        : `${config.start}:00 - ${config.end}:00`;

      return { period, hours, orders: periodOrders };
    }).sort((a, b) => b.orders - a.orders);

    // Generate recommendations
    const recommendations = [];
    
    if (peakHour.orders > 0) {
      recommendations.push(`Peak hour is ${peakHour.displayHour} with ${peakHour.orders} orders. Consider increasing staff during this time.`);
    }
    
    if (peakDay.orders > 0) {
      recommendations.push(`${peakDay.day} is your busiest day with ${peakDay.orders} orders. Plan inventory and staffing accordingly.`);
    }

    const topRushPeriod = rushPeriods[0];
    if (topRushPeriod.orders > 0) {
      recommendations.push(`${topRushPeriod.period} (${topRushPeriod.hours}) is your busiest period with ${topRushPeriod.orders} orders.`);
    }

    if (quietHour.orders === 0) {
      recommendations.push(`Consider promotional offers during ${quietHour.displayHour} to increase orders.`);
    }

    return {
      peakHour: {
        hour: peakHour.displayHour,
        orders: peakHour.orders,
        revenue: peakHour.revenue
      },
      quietHour: {
        hour: quietHour.displayHour,
        orders: quietHour.orders,
        revenue: quietHour.revenue
      },
      peakDay: {
        day: peakDay.day,
        orders: peakDay.orders,
        revenue: peakDay.revenue
      },
      quietDay: {
        day: quietDay.day,
        orders: quietDay.orders,
        revenue: quietDay.revenue
      },
      rushPeriods,
      recommendations
    };
  };

  // Helper functions
  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getTimePeriod = (hour: number): 'Morning' | 'Afternoon' | 'Evening' | 'Night' => {
    if (hour >= 6 && hour <= 11) return 'Morning';
    if (hour >= 12 && hour <= 17) return 'Afternoon';
    if (hour >= 18 && hour <= 22) return 'Evening';
    return 'Night';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Custom tooltip
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

  useEffect(() => {
    fetchPeakHoursData();
  }, [user?.restaurantId, period]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Peak Hours Analysis</h2>
          <p className="text-gray-600">Identify busy periods and optimize operations</p>
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
            onClick={fetchPeakHoursData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setSelectedView('hourly')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            selectedView === 'hourly'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Hourly Analysis
        </button>
        <button
          onClick={() => setSelectedView('daily')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            selectedView === 'daily'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Daily Patterns
        </button>
        <button
          onClick={() => setSelectedView('insights')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            selectedView === 'insights'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Insights & Tips
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="bg-white p-6 rounded-xl shadow border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Peak Hour</h3>
          <p className="text-xl font-bold text-gray-900">
            {loading ? '...' : insights.peakHour.hour}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {insights.peakHour.orders} orders
          </p>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Busiest Day</h3>
          <p className="text-xl font-bold text-gray-900">
            {loading ? '...' : insights.peakDay.day}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {insights.peakDay.orders} orders
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
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Rush Period</h3>
          <p className="text-xl font-bold text-gray-900">
            {loading ? '...' : insights.rushPeriods[0]?.period || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {insights.rushPeriods[0]?.orders || 0} orders
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
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Quiet Hour</h3>
          <p className="text-xl font-bold text-gray-900">
            {loading ? '...' : insights.quietHour.hour}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {insights.quietHour.orders} orders
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      {selectedView === 'hourly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Orders Chart */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Hour</h3>
            <div className="h-64">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="displayHour" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={10}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Hourly Revenue Chart */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Hour</h3>
            <div className="h-64">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="displayHour" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={10}
                    />
                    <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
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
      )}

      {selectedView === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Orders Chart */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Day of Week</h3>
            <div className="h-64">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="orders" fill="#8b5cf6" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Time Period Distribution */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rush Periods</h3>
            <div className="space-y-4">
              {insights.rushPeriods.map((period, index) => {
                const config = HOUR_PERIODS[period.period as keyof typeof HOUR_PERIODS];
                const Icon = config.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{period.period}</p>
                        <p className="text-sm text-gray-500">{period.hours}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{period.orders}</p>
                      <p className="text-sm text-gray-500">orders</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Insights */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Peak Performance</span>
                </div>
                <p className="text-sm text-green-700 mb-1">
                  <strong>{insights.peakHour.hour}</strong> - Your busiest hour
                </p>
                <p className="text-sm text-green-700 mb-1">
                  <strong>{insights.peakDay.day}</strong> - Your busiest day
                </p>
                <p className="text-sm text-green-700">
                  Revenue: {formatCurrency(insights.peakHour.revenue + insights.peakDay.revenue)}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Opportunity Areas</span>
                </div>
                <p className="text-sm text-blue-700 mb-1">
                  <strong>{insights.quietHour.hour}</strong> - Quietest hour
                </p>
                <p className="text-sm text-blue-700 mb-1">
                  <strong>{insights.quietDay.day}</strong> - Quietest day
                </p>
                <p className="text-sm text-blue-700">
                  Consider promotions during these times
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Recommendations</h3>
            <div className="space-y-3">
              {insights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
              
              {insights.recommendations.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recommendations available yet.</p>
                  <p className="text-sm text-gray-400">More data needed for insights.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}