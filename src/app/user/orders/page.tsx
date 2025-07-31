'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ShoppingBag, Clock, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function UserOrdersPage() {
  const router = useRouter()

  const orders = [
    {
      id: '1',
      restaurant: 'Spice Garden',
      items: ['Chicken Biryani', 'Raita', 'Papad'],
      amount: 450,
      date: '2024-01-15',
      time: '2:30 PM',
      status: 'Delivered',
      address: '123 Main Street, City',
      phone: '+91 9876543210'
    },
    {
      id: '2',
      restaurant: 'Pizza Corner',
      items: ['Margherita Pizza', 'Coke', 'Garlic Bread'],
      amount: 320,
      date: '2024-01-14',
      time: '7:45 PM',
      status: 'Delivered',
      address: '123 Main Street, City',
      phone: '+91 9876543210'
    },
    {
      id: '3',
      restaurant: 'Burger Hub',
      items: ['Cheese Burger', 'Fries', 'Shake'],
      amount: 280,
      date: '2024-01-12',
      time: '1:15 PM',
      status: 'Delivered',
      address: '123 Main Street, City',
      phone: '+91 9876543210'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-700'
      case 'preparing':
        return 'bg-yellow-100 text-yellow-700'
      case 'on the way':
        return 'bg-blue-100 text-blue-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">Start ordering from your favorite restaurants</p>
            <Button
              onClick={() => router.push('/')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Browse Restaurants
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{order.restaurant}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{order.date} at {order.time}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Items:</span> {order.items.join(', ')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{order.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{order.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-lg font-bold text-green-600">₹{order.amount}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/user/orders/${order.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      Reorder
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}