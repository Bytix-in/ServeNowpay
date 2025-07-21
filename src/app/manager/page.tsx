'use client'

import { motion } from 'framer-motion'
import { 
  Users, 
  ClipboardList, 
  BarChart3, 
  Calendar, 
  Package,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function ManagerDashboard() {
  const stats = [
    {
      title: 'Team Members',
      value: '24',
      change: '+2 this week',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Active Orders',
      value: '156',
      change: '+18% today',
      icon: ClipboardList,
      color: 'text-green-600'
    },
    {
      title: 'Revenue Today',
      value: '$3,247',
      change: '+12% vs yesterday',
      icon: TrendingUp,
      color: 'text-emerald-600'
    },
    {
      title: 'Completion Rate',
      value: '94%',
      change: '+3% this week',
      icon: CheckCircle,
      color: 'text-purple-600'
    }
  ]

  const recentOrders = [
    { id: '#1234', customer: 'John Doe', status: 'In Progress', time: '10 min ago', amount: '$45.99' },
    { id: '#1235', customer: 'Jane Smith', status: 'Completed', time: '25 min ago', amount: '$32.50' },
    { id: '#1236', customer: 'Bob Johnson', status: 'Pending', time: '1 hour ago', amount: '$78.25' },
    { id: '#1237', customer: 'Alice Brown', status: 'In Progress', time: '2 hours ago', amount: '$56.75' }
  ]

  const teamMembers = [
    { name: 'Sarah Wilson', role: 'Senior Staff', status: 'Online', orders: 12 },
    { name: 'Mike Chen', role: 'Staff', status: 'Online', orders: 8 },
    { name: 'Emma Davis', role: 'Staff', status: 'Break', orders: 6 },
    { name: 'Tom Rodriguez', role: 'Staff', status: 'Online', orders: 10 }
  ]

  const quickActions = [
    {
      title: 'Schedule Staff',
      description: 'Manage team schedules and shifts',
      icon: Calendar,
      href: '#'
    },
    {
      title: 'Inventory',
      description: 'Check and manage inventory levels',
      icon: Package,
      href: '#'
    },
    {
      title: 'Reports',
      description: 'View performance and analytics',
      icon: BarChart3,
      href: '#'
    },
    {
      title: 'Team Performance',
      description: 'Monitor team metrics and KPIs',
      icon: Users,
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
              <h1 className="text-2xl font-bold">Manager Dashboard</h1>
              <p className="text-muted-foreground">Team and operations management</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">Schedule</Button>
              <Button>New Order</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-card p-6 rounded-lg border"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-muted-foreground text-sm mb-1">{stat.title}</p>
              <p className="text-xs text-green-600">{stat.change}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground">
                  <span>Order ID</span>
                  <span>Customer</span>
                  <span>Status</span>
                  <span>Time</span>
                  <span>Amount</span>
                </div>
              </div>
              <div className="divide-y">
                {recentOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="p-4 grid grid-cols-5 gap-4 items-center"
                  >
                    <span className="font-medium">{order.id}</span>
                    <span>{order.customer}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-muted-foreground">{order.time}</span>
                    <span className="font-medium">{order.amount}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Status */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Team Status</h2>
            <div className="space-y-4 mb-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-card p-4 rounded-lg border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{member.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      member.status === 'Online' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{member.role}</p>
                  <p className="text-sm">{member.orders} orders today</p>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
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
          </div>
        </div>
      </div>
    </div>
  )
}