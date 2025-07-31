"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  Star,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Award,
  AlertTriangle,
  BarChart3,
  PieChart,
  RefreshCw,
  Filter,
  Search,
  Eye,
  EyeOff
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter
} from "recharts";

interface MenuItemPerformance {
  id: string;
  name: string;
  category: string;
  price: number;
  totalOrders: number;
  totalRevenue: number;
  avgOrdersPerDay: number;
  popularityRank: number;
  revenueRank: number;
  profitabilityScore: number;
  trendDirection: 'up' | 'down' | 'stable';
  lastOrderDate: string;
  performance: 'star' | 'good' | 'average' | 'poor' | 'problem';
}

interface CategoryPerformance {
  category: string;
  items: number;
  totalOrders: number;
  totalRevenue: number;
  avgPrice: number;
  color: string;
}

interface MenuInsights {
  topPerformer: MenuItemPerformance | null;
  worstPerformer: MenuItemPerformance | null;
  mostProfitable: MenuItemPerformance | null;
  recommendations: string[];
  categoryLeader: CategoryPerformance | null;
}

const PERFORMANCE_COLORS = {
  star: '#10b981',      // Green
  good: '#3b82f6',      // Blue  
  average: '#f59e0b',   // Yellow
  poor: '#f97316',      // Orange
  problem: '#ef4444'    // Red
};

const CATEGORY_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
];

export default function MenuPerformanceRanking() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7days' | '30days' | '90days'>('30days');
  const [menuItems, setMenuItems] = useState<MenuItemPerformance[]>([]);
  const [categories, setCategories] = useState<CategoryPerformance[]>([]);
  const [insights, setInsights] = useState<MenuInsights>({
    topPerformer: null,
    worstPerformer: null,
    mostProfitable: null,
    recommendations: [],
    categoryLeader: null
  });
  const [selectedView, setSelectedView] = useState<'ranking' | 'categories' | 'insights'>('ranking');
  const [sortBy, setSortBy] = useState<'popularity' | 'revenue' | 'profitability'>('popularity');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPoorPerformers, setShowPoorPerformers] = useState(true);

  // Fetch menu performance data
  const fetchMenuPerformance = async () => {
    if (!user?.restaurantId) return;

    setLoading(true);
    try {
      const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get menu items
      const { data: menuItemsData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', user.restaurantId);

      if (menuError) throw menuError;

      // Get orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', user.restaurantId)
        .gte('created_at', startDate.toISOString())
        .eq('payment_status', 'completed');

      if (ordersError) throw ordersError;

      // Process menu performance
      const performance = processMenuPerformance(menuItemsData || [], orders || [], days);
      setMenuItems(performance.items);
      setCategories(performance.categories);

      // Generate insights
      const generatedInsights = generateInsights(performance.items, performance.categories);
      setInsights(generatedInsights);

    } catch (error) {
      console.error('Error fetching menu performance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process menu performance data
  const processMenuPerformance = (menuItems: any[], orders: any[], days: number) => {
    // Create item performance map
    const itemPerformance = new Map<string, {
      orders: number;
      revenue: number;
      lastOrderDate: string;
    }>();

    // Process all order items
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const itemName = item.dish_name || item.name;
          if (!itemName) return;

          const existing = itemPerformance.get(itemName) || {
            orders: 0,
            revenue: 0,
            lastOrderDate: order.created_at
          };

          existing.orders += item.quantity || 1;
          existing.revenue += item.total || (item.price * (item.quantity || 1));
          
          // Update last order date if more recent
          if (new Date(order.created_at) > new Date(existing.lastOrderDate)) {
            existing.lastOrderDate = order.created_at;
          }

          itemPerformance.set(itemName, existing);
        });
      }
    });

    // Create performance objects for menu items
    const performanceItems: MenuItemPerformance[] = menuItems.map((item, index) => {
      const performance = itemPerformance.get(item.name) || {
        orders: 0,
        revenue: 0,
        lastOrderDate: new Date().toISOString()
      };

      const avgOrdersPerDay = days > 0 ? performance.orders / days : 0;
      const profitabilityScore = calculateProfitabilityScore(
        performance.orders,
        performance.revenue,
        item.price
      );

      return {
        id: item.id,
        name: item.name,
        category: item.dish_type || 'Other',
        price: item.price,
        totalOrders: performance.orders,
        totalRevenue: performance.revenue,
        avgOrdersPerDay,
        popularityRank: 0, // Will be set after sorting
        revenueRank: 0,    // Will be set after sorting
        profitabilityScore,
        trendDirection: getTrendDirection(performance.orders, avgOrdersPerDay),
        lastOrderDate: performance.lastOrderDate,
        performance: getPerformanceCategory(performance.orders, profitabilityScore)
      };
    });

    // Set rankings
    const sortedByPopularity = [...performanceItems].sort((a, b) => b.totalOrders - a.totalOrders);
    const sortedByRevenue = [...performanceItems].sort((a, b) => b.totalRevenue - a.totalRevenue);

    sortedByPopularity.forEach((item, index) => {
      const originalItem = performanceItems.find(p => p.id === item.id);
      if (originalItem) originalItem.popularityRank = index + 1;
    });

    sortedByRevenue.forEach((item, index) => {
      const originalItem = performanceItems.find(p => p.id === item.id);
      if (originalItem) originalItem.revenueRank = index + 1;
    });

    // Process category performance
    const categoryMap = new Map<string, {
      items: number;
      orders: number;
      revenue: number;
      totalPrice: number;
    }>();

    performanceItems.forEach(item => {
      const existing = categoryMap.get(item.category) || {
        items: 0,
        orders: 0,
        revenue: 0,
        totalPrice: 0
      };

      existing.items += 1;
      existing.orders += item.totalOrders;
      existing.revenue += item.totalRevenue;
      existing.totalPrice += item.price;

      categoryMap.set(item.category, existing);
    });

    const categoryPerformance: CategoryPerformance[] = Array.from(categoryMap.entries()).map(
      ([category, data], index) => ({
        category,
        items: data.items,
        totalOrders: data.orders,
        totalRevenue: data.revenue,
        avgPrice: data.items > 0 ? data.totalPrice / data.items : 0,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      })
    ).sort((a, b) => b.totalRevenue - a.totalRevenue);

    return {
      items: performanceItems,
      categories: categoryPerformance
    };
  };

  // Helper functions
  const calculateProfitabilityScore = (orders: number, revenue: number, price: number): number => {
    if (orders === 0) return 0;
    const avgOrderValue = revenue / orders;
    const priceEfficiency = avgOrderValue / price;
    return Math.min(100, (orders * 0.3 + priceEfficiency * 70));
  };

  const getTrendDirection = (orders: number, avgPerDay: number): 'up' | 'down' | 'stable' => {
    if (orders === 0) return 'stable';
    if (avgPerDay > 1) return 'up';
    if (avgPerDay < 0.5) return 'down';
    return 'stable';
  };

  const getPerformanceCategory = (orders: number, profitability: number): 'star' | 'good' | 'average' | 'poor' | 'problem' => {
    if (orders >= 20 && profitability >= 80) return 'star';
    if (orders >= 10 && profitability >= 60) return 'good';
    if (orders >= 5 && profitability >= 40) return 'average';
    if (orders >= 1 && profitability >= 20) return 'poor';
    return 'problem';
  };

  // Generate insights and recommendations
  const generateInsights = (items: MenuItemPerformance[], categories: CategoryPerformance[]): MenuInsights => {
    const sortedByOrders = [...items].sort((a, b) => b.totalOrders - a.totalOrders);
    const sortedByProfitability = [...items].sort((a, b) => b.profitabilityScore - a.profitabilityScore);
    
    const topPerformer = sortedByOrders[0] || null;
    const worstPerformer = sortedByOrders[sortedByOrders.length - 1] || null;
    const mostProfitable = sortedByProfitability[0] || null;
    const categoryLeader = categories[0] || null;

    const recommendations = [];
    
    if (topPerformer) {
      recommendations.push(`"${topPerformer.name}" is your star item with ${topPerformer.totalOrders} orders. Consider featuring it prominently.`);
    }

    const poorPerformers = items.filter(item => item.performance === 'poor' || item.performance === 'problem');
    if (poorPerformers.length > 0) {
      recommendations.push(`${poorPerformers.length} items are underperforming. Consider removing or improving them.`);
    }

    const starItems = items.filter(item => item.performance === 'star');
    if (starItems.length > 0) {
      recommendations.push(`You have ${starItems.length} star items. Consider creating combo deals with these.`);
    }

    if (categoryLeader) {
      recommendations.push(`"${categoryLeader.category}" is your top category with ₹${categoryLeader.totalRevenue.toFixed(0)} revenue.`);
    }

    const noOrderItems = items.filter(item => item.totalOrders === 0);
    if (noOrderItems.length > 0) {
      recommendations.push(`${noOrderItems.length} items haven't been ordered. Consider promotional pricing or removal.`);
    }

    return {
      topPerformer,
      worstPerformer,
      mostProfitable,
      categoryLeader,
      recommendations
    };
  };

  // Filter and sort items
  const getFilteredAndSortedItems = () => {
    let filtered = menuItems;

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter poor performers if hidden
    if (!showPoorPerformers) {
      filtered = filtered.filter(item => 
        item.performance !== 'poor' && item.performance !== 'problem'
      );
    }

    // Sort items
    switch (sortBy) {
      case 'popularity':
        return filtered.sort((a, b) => b.totalOrders - a.totalOrders);
      case 'revenue':
        return filtered.sort((a, b) => b.totalRevenue - a.totalRevenue);
      case 'profitability':
        return filtered.sort((a, b) => b.profitabilityScore - a.profitabilityScore);
      default:
        return filtered;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'star': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'good': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'average': return <BarChart3 className="w-4 h-4 text-blue-500" />;
      case 'poor': return <TrendingDown className="w-4 h-4 text-orange-500" />;
      case 'problem': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-500" />;
      default: return <BarChart3 className="w-3 h-3 text-gray-500" />;
    }
  };

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

  useEffect(() => {
    fetchMenuPerformance();
  }, [user?.restaurantId, period]);

  const filteredItems = getFilteredAndSortedItems();
  const uniqueCategories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Performance Ranking</h2>
          <p className="text-gray-600">Analyze your menu items and optimize performance</p>
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
            onClick={fetchMenuPerformance}
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
          onClick={() => setSelectedView('ranking')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            selectedView === 'ranking'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Item Ranking
        </button>
        <button
          onClick={() => setSelectedView('categories')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            selectedView === 'categories'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setSelectedView('insights')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            selectedView === 'insights'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Insights
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
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Top Performer</h3>
          <p className="text-lg font-bold text-gray-900">
            {loading ? '...' : insights.topPerformer?.name || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {insights.topPerformer?.totalOrders || 0} orders
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
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Most Profitable</h3>
          <p className="text-lg font-bold text-gray-900">
            {loading ? '...' : insights.mostProfitable?.name || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {insights.mostProfitable?.profitabilityScore.toFixed(0) || 0}% score
          </p>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Top Category</h3>
          <p className="text-lg font-bold text-gray-900">
            {loading ? '...' : insights.categoryLeader?.category || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {insights.categoryLeader?.totalOrders || 0} orders
          </p>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Items</h3>
          <p className="text-lg font-bold text-gray-900">
            {loading ? '...' : menuItems.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {menuItems.filter(item => item.performance === 'star').length} star items
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      {selectedView === 'ranking' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm w-48"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="revenue">Sort by Revenue</option>
                <option value="profitability">Sort by Profitability</option>
              </select>

              <button
                onClick={() => setShowPoorPerformers(!showPoorPerformers)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  showPoorPerformers 
                    ? 'bg-gray-100 text-gray-700' 
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {showPoorPerformers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showPoorPerformers ? 'Hide' : 'Show'} Poor Performers
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-xl shadow border border-gray-200">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Menu Items Performance ({filteredItems.length} items)
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No items found matching your criteria</p>
                </div>
              ) : (
                filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                          {getPerformanceIcon(item.performance)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-500">{item.category}</span>
                            <span className="text-sm font-medium text-gray-700">
                              {formatCurrency(item.price)}
                            </span>
                            <div className="flex items-center gap-1">
                              {getTrendIcon(item.trendDirection)}
                              <span className="text-xs text-gray-500">
                                {item.avgOrdersPerDay.toFixed(1)}/day
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{item.totalOrders}</p>
                          <p className="text-xs text-gray-500">Orders</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(item.totalRevenue)}
                          </p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">
                            {item.profitabilityScore.toFixed(0)}%
                          </p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: PERFORMANCE_COLORS[item.performance] }}
                          title={`Performance: ${item.performance}`}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Performance Chart */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Revenue</h3>
            <div className="h-64">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="totalRevenue" fill="#3b82f6" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
            <div className="space-y-4">
              {categories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">{category.category}</p>
                      <p className="text-sm text-gray-500">{category.items} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{category.totalOrders}</p>
                    <p className="text-sm text-gray-500">orders</p>
                  </div>
                </div>
              ))}
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
              {insights.topPerformer && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Top Performer</span>
                  </div>
                  <p className="text-sm text-green-700">
                    <strong>{insights.topPerformer.name}</strong> leads with {insights.topPerformer.totalOrders} orders
                    and {formatCurrency(insights.topPerformer.totalRevenue)} revenue
                  </p>
                </div>
              )}

              {insights.worstPerformer && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Needs Attention</span>
                  </div>
                  <p className="text-sm text-red-700">
                    <strong>{insights.worstPerformer.name}</strong> has only {insights.worstPerformer.totalOrders} orders.
                    Consider promotion or removal.
                  </p>
                </div>
              )}

              {insights.categoryLeader && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Category Leader</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    <strong>{insights.categoryLeader.category}</strong> category generates the most revenue
                    with {formatCurrency(insights.categoryLeader.totalRevenue)}
                  </p>
                </div>
              )}
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
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recommendations available yet.</p>
                  <p className="text-sm text-gray-400">More order data needed for insights.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}