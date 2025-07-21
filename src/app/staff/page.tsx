'use client'

import { motion } from 'framer-motion'
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Bell,
  Calendar,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function StaffDashboard() {
  const todayStats = [
    {
      title: 'Orders Completed',
      value: '12',
      target: '15',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Active Orders',
      value: '3',
      change: 'In progress',
      icon: ClipboardList,
      color: 'text-blue-600'
    },
    {
      title: 'Hours Worked',
      value: '6.5',
      target: '8',
      icon: Clock,
      color: 'text-purple-600'
    },
    {
      title: 'Customer Rating',
      value: '4.8',
      change: '⭐ Excellent',
      icon: User,
      color: 'text-yellow-600'
    }
  ]

  const activeOrders = [
    {
      id: '#1234',
      customer: 'John Doe',
      items: ['Burger', 'Fries', 'Coke'],
      priority: 'High',
      time: '5 min ago',
      table: 'Table 12'
    },
    {
      id: '#1235',
      customer: 'Jane Smith',
      items: ['Pizza', 'Salad'],
      priority: 'Medium',
      time: '12 min ago',
      table: 'Table 8'
    },
    {
      id: '#1236',
      customer: 'Bob Johnson',
      items: ['Pasta', 'Garlic Bread'],
      priority: 'Low',
      time: '18 min ago',
      table: 'Table 5'
    }
  ]

  const notifications = [
    {
      type: 'order',
      message: 'New order assigned to you - Table 15',
      time: '2 min ago'
    },
    {
      type: 'break',
      message: 'Break time reminder - You can take a 15 min break',
      time: '30 min ago'
    },
    {
      type: 'shift',
      message: 'Shift ends in 1.5 hours',
      time: '1 hour ago'
    }
  ]

  const quickActions = [
    {
      title: 'Take Order',
      description: 'Create new customer order',
      icon: ClipboardList,
      href: '#'
    },
    {
      title: 'My Schedule',
      description: 'View your work schedule',
      icon: Calendar,
      href: '#'
    },
    {
      title: 'Messages',
      description: 'Team communication',
      icon: MessageSquare,
      href: '#'
    },
    {
      title: 'Break Time',
      description: 'Start your break',
      icon: Clock,
      href: '#'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Staff Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, Sarah! Ready for your shift?</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button>New Order</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {todayStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-card p-6 rounded-lg border"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                {stat.target && (
                  <span className="text-sm text-muted-foreground">
                    Goal: {stat.target}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-muted-foreground text-sm mb-1">{stat.title}</p>
              {stat.change && (
                <p className="text-xs text-green-600">{stat.change}</p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Orders */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Active Orders</h2>
              <Button variant="outline" size="sm">Refresh</Button>
            </div>
            <div className="space-y-4">
              {activeOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-card p-6 rounded-lg border"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold">{order.id}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.priority === 'High' ? 'bg-red-100 text-red-800' :
                        order.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.priority} Priority
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{order.time}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Customer</p>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Location</p>
                      <p className="text-sm text-muted-foreground">{order.table}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Items</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm">Mark Complete</Button>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Quick Actions */}
            <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {quickActions.map((action, index) => (
                <motion.a
                  key={action.title}
                  href={action.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-card p-4 rounded-lg border hover:shadow-md transition-shadow block text-center"
                >
                  <action.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <h4 className="font-medium text-sm mb-1">{action.title}</h4>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </motion.a>
              ))}
            </div>

            {/* Notifications */}
            <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-card p-4 rounded-lg border"
                >
                  <div className="flex items-start space-x-3">
                    <AlertCircle className={`h-5 w-5 mt-0.5 ${
                      notification.type === 'order' ? 'text-blue-500' :
                      notification.type === 'break' ? 'text-green-500' :
                      'text-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}