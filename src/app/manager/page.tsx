'use client'

import { motion } from 'framer-motion'
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
import { useState } from 'react'

export default function ManagerDashboard() {
  const [selectedMonth, setSelectedMonth] = useState('Month')
  
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

  // Custom tooltip for the Order Analytics chart
  const OrderAnalyticsTooltip = ({ active, payload, label }) => {
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
  const RevenueProfileTooltip = ({ active, payload, label }) => {
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

  // Secondary tooltip for the Order Analytics chart
  const SecondaryTooltip = ({ x, y }) => {
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-[175px] bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <span className="font-bold text-green-600">WeEats</span>
          </div>
        </div>
        
        {/* User Profile */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="text-xs text-gray-600">KM</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Kazi Mahbub</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
            <Settings className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-4">
          <div className="space-y-1 px-2">
            <a href="#" className="flex items-center gap-3 px-2 py-2 rounded-md bg-gray-100">
              <Home className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Dashboard</span>
            </a>
            
            <div className="flex items-center justify-between gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" />
                <span className="text-sm font-medium">Orders</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </div>
            
            <Link href="/manager/menu" className="flex items-center gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
              <Utensils className="w-5 h-5" />
              <span className="text-sm font-medium">Food Menu</span>
            </Link>
            
            <a href="#" className="flex items-center gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
              <Bike className="w-5 h-5" />
              <span className="text-sm font-medium">Riders</span>
            </a>
            
            <div className="flex items-center justify-between gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5" />
                <span className="text-sm font-medium">Restaurant</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </div>
            
            <a href="#" className="flex items-center gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">Report</span>
            </a>
            
            <a href="#" className="flex items-center gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">Message</span>
            </a>
          </div>
          
          <div className="mt-6 px-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Others</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
                <div className="flex items-center gap-3">
                  <Megaphone className="w-5 h-5" />
                  <span className="text-sm font-medium">Marketing</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
              
              <a href="#" className="flex items-center gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
                <HelpCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Support</span>
              </a>
              
              <a href="#" className="flex items-center gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100">
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">Settings</span>
              </a>
            </div>
          </div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white p-4 border-b flex items-center justify-between">
          <h1 className="text-xl font-medium">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search in here" 
                className="pl-9 pr-4 py-1.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 w-64"
              />
            </div>
            <button className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Restaurant</h3>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">10,000</p>
                <div className="flex items-center text-xs text-green-500">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  <span>+17% /Month</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">$87,363</p>
                <div className="flex items-center text-xs text-green-500">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  <span>+11% /Month</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">New Customers</h3>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">120</p>
                <div className="flex items-center text-xs text-red-500">
                  <ArrowDown className="w-3 h-3 mr-1" />
                  <span>-15% /Month</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Performance */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-medium">Order Performance</h2>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
              <div className="flex items-center gap-2 border rounded px-2 py-1">
                <span className="text-sm">{selectedMonth}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex justify-between">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="relative inline-block w-24 h-24">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <circle 
                        cx="18" cy="18" r="16" 
                        fill="none" 
                        stroke="#e6e6e6" 
                        strokeWidth="3"
                      />
                      {/* Progress circle */}
                      <circle 
                        cx="18" cy="18" r="16" 
                        fill="none" 
                        stroke={metric.strokeColor}
                        strokeWidth="3"
                        strokeDasharray={`${metric.percentage} 100`}
                        strokeDashoffset="25"
                        transform="rotate(-90 18 18)"
                        className="drop-shadow-md"
                      />
                      {/* Percentage text */}
                      <text 
                        x="18" y="18" 
                        dominantBaseline="middle" 
                        textAnchor="middle"
                        className="text-xl font-bold"
                        style={{ fill: metric.strokeColor }}
                      >
                        {metric.percentage}%
                      </text>
                    </svg>
                  </div>
                  <p className="text-sm mt-2">{metric.title}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Order Analytics */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-medium">Order Analytics</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Vendor:</span>
                    <div className="flex items-center gap-1 border rounded px-2 py-1">
                      <span className="text-sm">All Vendor</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Status:</span>
                    <div className="flex items-center gap-1 border rounded px-2 py-1">
                      <span className="text-sm">Completed</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 border rounded px-2 py-1">
                    <span className="text-sm">Monthly</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold">12,120.00</h3>
                <div className="flex items-center text-xs text-green-500 bg-green-50 px-2 py-1 rounded">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  <span>+15% /Month</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">Excellent job on your order 👍</p>
              
              {/* Order Analytics Chart */}
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
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-medium">Revenue Profile</h2>
                <div className="flex items-center gap-1 border rounded px-2 py-1">
                  <span className="text-sm">Monthly</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold">$25,843.45</h3>
                <div className="flex items-center text-xs text-green-500 bg-green-50 px-2 py-1 rounded">
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
              
              {/* Revenue Profile Chart */}
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
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-5 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium">Order Activities</h2>
                  <p className="text-xs text-gray-500">Keep track of recent order activities</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Status:</span>
                    <div className="flex items-center gap-1 text-sm border rounded px-2 py-1">
                      <span>Delivered</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Days:</span>
                    <div className="flex items-center gap-1 text-sm border rounded px-2 py-1">
                      <span>Today</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 border rounded hover:bg-gray-50">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 7H7V17H17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 3H21V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 17H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 17H17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 7H7V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="p-1.5 border rounded hover:bg-gray-50">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                    <button className="p-1.5 border rounded hover:bg-gray-50">
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
            <div className="px-5 py-3 border-b bg-gray-50">
              <div className="grid grid-cols-7 gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
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
                <div key={index} className="px-5 py-4 border-b last:border-b-0">
                  <div className="grid grid-cols-7 gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300" />
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
      </div>
    </div>
  )
}