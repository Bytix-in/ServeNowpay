'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PaymentDisabledBanner } from '@/components/restaurant/PaymentSetupBanner'
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
  Menu
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

export default function RestaurantDashboard() {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState('Month')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is authenticated and has restaurant role
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth/restaurant-login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'restaurant') {
        router.push('/auth/restaurant-login')
        return
      }
      setUser(parsedUser)
    } catch (error) {
      router.push('/auth/restaurant-login')
      return
    }
  }, [router])
  
  // Mock data for the dashboard
  const performanceMetrics = [
    { title: 'Total Order Completed', percentage: 82, color: 'text-emerald-500', strokeColor: '#10b981' },
    { title: 'Total Delivery Return', percentage: 10, color: 'text-amber-500', strokeColor: '#f59e0b' },
    { title: 'Total Delivery Cancel', percentage: 10, color: 'text-rose-500', strokeColor: '#f43f5e' }
  ]

  const orderActivities = [
    { 
      id: '#28839626288', 
      restaurant: 'Al Bak Fast Food Shop', 
      customer: 'Muhammed Fatah', 
      dateTime: '22 Dec 2024 at 11:20', 
      totalItem: '200', 
      amount: '$5,576.90', 
      status: 'Delivered' 
    },
    { 
      id: '#28839626288', 
      restaurant: 'Taza Bukari House', 
      customer: 'Mukarram Kazi', 
      dateTime: '22 Dec 2024 at 11:30', 
      totalItem: '1050', 
      amount: '$5,576.90', 
      status: 'Delivered' 
    }
  ]

  // Chart data for Order Analytics
  const orderAnalyticsData = [
    { day: '01', value: 1000, secondValue: 500 },
    { day: '03', value: 1200, secondValue: 600 },
    { day: '06', value: 1500, secondValue: 700 },
    { day: '09', value: 1300, secondValue: 550 },
    { day: '12', value: 1800, secondValue: 800 },
    { day: '15', value: 2000, secondValue: 900 },
    { day: '18', value: 1700, secondValue: 750 },
    { day: '21', value: 2200, secondValue: 1000 },
    { day: '24', value: 2500, secondValue: 1200, highlight: true, highlightValue: '2,500.00', highlightDate: 'Feb 20, 2018 12:00' },
    { day: '27', value: 2300, secondValue: 1100 },
    { day: '30', value: 2700, secondValue: 1300 },
  ]

  // Chart data for Revenue Profile
  const revenueProfileData = [
    { date: 'Jan 01', value: 0 },
    { date: 'Jan 07', value: 5000 },
    { date: 'Jan 14', value: 10000 },
    { date: 'Jan 21', value: 15000 },
    { date: 'Jan 28', value: 25000 },
  ]

  // Define tooltip props interface
  interface TooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
  }

  // Custom tooltip for the Order Analytics chart
  const OrderAnalyticsTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      if (data.highlight) {
        return (
          <div className="bg-black text-white p-2 rounded text-xs">
            <p className="font-medium mb-1">{data.highlightDate}</p>
            <p className="font-bold">{data.highlightValue}</p>
          </div>
        );
      }
      
      return (
        <div className="bg-black bg-opacity-80 text-white p-2 rounded text-xs">
          <p className="font-medium">{`Day ${label}`}</p>
          <p>{`${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for the Revenue Profile chart
  const RevenueProfileTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black bg-opacity-80 text-white p-2 rounded text-xs">
          <p className="font-medium">{label}</p>
          <p>{`$${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  // Secondary tooltip props interface
  interface SecondaryTooltipProps {
    x?: number;
    y?: number;
  }

  // Secondary tooltip for the Order Analytics chart
  const SecondaryTooltip = ({ x = 0, y = 0 }: SecondaryTooltipProps) => {
    return (
      <div 
        className="absolute bg-gray-600 text-white p-2 rounded text-xs"
        style={{ 
          left: x - 30, 
          top: y - 45,
          transform: 'translateX(-50%)'
        }}
      >
        <p className="font-medium">1,200.00</p>
      </div>
    );
  };

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Welcome Header */}
      <div className="bg-white p-6 rounded-3xl shadow border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600">
          Here's your restaurant dashboard overview for today.
        </p>
      </div>

      {/* Payment Setup Banners */}
      <PaymentDisabledBanner />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Restaurant</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900">10,000</p>
            <div className="flex items-center text-xs text-green-500">
              <ArrowUp className="w-3 h-3 mr-1" />
              <span>+17% /Month</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900">$87,363</p>
            <div className="flex items-center text-xs text-green-500">
              <ArrowUp className="w-3 h-3 mr-1" />
              <span>+11% /Month</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">New Customers</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900">120</p>
            <div className="flex items-center text-xs text-red-500">
              <ArrowDown className="w-3 h-3 mr-1" />
              <span>-15% /Month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Analytics */}
        <div className="bg-white p-6 rounded-3xl shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">Order Analytics</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Vendor:</span>
                <div className="flex items-center gap-1 border rounded-xl px-2 py-1 cursor-pointer hover:bg-gray-50">
                  <span className="text-sm">All Vendor</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
                <div className="flex items-center gap-1 border rounded-xl px-2 py-1 cursor-pointer hover:bg-gray-50">
                  <span className="text-sm">Completed</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center gap-1 border rounded-xl px-2 py-1 cursor-pointer hover:bg-gray-50">
                <span className="text-sm">Monthly</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold text-gray-900">12,120.00</h3>
            <div className="flex items-center text-xs text-green-500 bg-green-50 px-2 py-1 rounded-xl">
              <ArrowUp className="w-3 h-3 mr-1" />
              <span>+15% /Month</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">Excellent job on your order 👍</p>
          <div className="h-64 relative">
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
                
                {/* Secondary line (dashed) */}
                <Line 
                  type="monotone" 
                  dataKey="secondValue" 
                  stroke="#ccc" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: '#ccc', stroke: '#fff', strokeWidth: 2 }}
                  name="Secondary"
                />
                
                {/* Main line */}
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#333" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: '#333', stroke: '#fff', strokeWidth: 2 }}
                  name="Main"
                />
                
                {/* Highlight point */}
                <ReferenceDot 
                  x="24" 
                  y={2500} 
                  r={4} 
                  fill="#333" 
                  stroke="#fff" 
                  strokeWidth={2} 
                />
                
                {/* Secondary highlight point */}
                <ReferenceDot 
                  x="24" 
                  y={1200} 
                  r={4} 
                  fill="#ccc" 
                  stroke="#fff" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
            
            {/* Fixed tooltip for the highlighted point */}
            <div className="absolute top-[30%] right-[20%] bg-black text-white p-2 rounded text-xs z-10">
              <p className="font-medium mb-1">Feb 20, 2018 12:00</p>
              <p className="font-bold">2,500.00</p>
            </div>
            
            {/* Fixed tooltip for the secondary point */}
            <div className="absolute top-[60%] right-[20%] bg-gray-600 text-white p-2 rounded text-xs z-10">
              <p className="font-bold">1,200.00</p>
            </div>
          </div>
        </div>
        {/* Revenue Profile */}
        <div className="bg-white p-6 rounded-3xl shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">Revenue Profile</h2>
            <div className="flex items-center gap-1 border rounded-xl px-2 py-1 cursor-pointer hover:bg-gray-50">
              <span className="text-sm">Monthly</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold text-gray-900">$25,843.45</h3>
            <div className="flex items-center text-xs text-green-500 bg-green-50 px-2 py-1 rounded-xl">
              <ArrowUp className="w-3 h-3 mr-1" />
              <span>+11% /Month</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">Your performance is excellent 👍</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span className="text-xs">January</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs">February</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueProfileData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
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
                />
                <Tooltip content={<RevenueProfileTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Order Activities */}
      <div className="bg-white rounded-3xl shadow border border-gray-200">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Order Activities</h2>
              <p className="text-xs text-gray-500">Keep track of recent order activities</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
                <div className="flex items-center gap-1 text-sm border rounded-xl px-2 py-1 cursor-pointer hover:bg-gray-50">
                  <span>Delivered</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Days:</span>
                <div className="flex items-center gap-1 text-sm border rounded-xl px-2 py-1 cursor-pointer hover:bg-gray-50">
                  <span>Today</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 border rounded-xl hover:bg-gray-50 cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 7H7V17H17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 3H21V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 17H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 17H17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 7H7V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="p-1.5 border rounded-xl hover:bg-gray-50 cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                <button className="p-1.5 border rounded-xl hover:bg-gray-50 cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Table Header */}
        <div className="px-6 py-3 border-b bg-gray-50 rounded-t-3xl">
          <div className="grid grid-cols-7 gap-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
              <span className="text-sm font-medium">Order ID</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium">Restaurant Name</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium">Customer Name</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium">Date & Time</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium">Total Item</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium">Amount</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium">Status</span>
            </div>
          </div>
        </div>
        {/* Table Body */}
        <div>
          {orderActivities.map((order, index) => (
            <div key={index} className="px-6 py-4 border-b last:border-b-0 hover:bg-gray-50 transition cursor-pointer">
              <div className="grid grid-cols-7 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
                  <span className="text-sm">{order.id}</span>
                </div>
                <div>
                  <span className="text-sm">{order.restaurant}</span>
                </div>
                <div>
                  <span className="text-sm">{order.customer}</span>
                </div>
                <div>
                  <span className="text-sm">{order.dateTime}</span>
                </div>
                <div>
                  <span className="text-sm">{order.totalItem}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">{order.amount}</span>
                </div>
                <div>
                  <span className="text-sm text-green-500">{order.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}