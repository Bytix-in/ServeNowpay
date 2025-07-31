"use client";

import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { notificationManager } from '@/utils/notifications';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  table_number: string;
  items: any[];
  total_amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'verifying' | 'completed' | 'failed' | 'not_configured';
  unique_order_id: string;
  created_at: string;
  updated_at: string;
}

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { user } = useAuth();

  // Check notification permission status
  useEffect(() => {
    setNotificationPermission(notificationManager.getPermission());
  }, []);

  // Calculate status counts from real data
  const statusCards = [
    {
      label: "New Orders",
      count: orders.filter(order => order.status === 'pending').length,
      color: "text-orange-500",
      bg: "bg-orange-50",
      icon: "🔔",
    },
    {
      label: "Preparing",
      count: orders.filter(order => order.status === 'in_progress').length,
      color: "text-blue-500",
      bg: "bg-blue-50",
      icon: "👨‍🍳",
    },
    {
      label: "Ready",
      count: orders.filter(order => order.status === 'completed').length,
      color: "text-green-500",
      bg: "bg-green-50",
      icon: "✅",
    },
    {
      label: "Served",
      count: orders.filter(order => order.status === 'served').length,
      color: "text-gray-500",
      bg: "bg-gray-100",
      icon: "🍽️",
    },
  ];

  // Fetch orders for the current restaurant
  const fetchOrders = async () => {
    if (!user?.restaurantId) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', user.restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to request notification permission
  const requestNotificationPermission = async () => {
    const permission = await notificationManager.requestPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      // Show a test notification
      notificationManager.showTestNotification();
    }
  };

  // Function to show browser notification
  const showOrderNotification = (order: Order) => {
    const notification = notificationManager.showOrderNotification({
      id: order.id,
      unique_order_id: order.unique_order_id,
      customer_name: order.customer_name,
      table_number: order.table_number,
      total_amount: order.total_amount
    });

    if (notification) {
      // Auto close notification after 15 seconds
      setTimeout(() => {
        notification.close();
      }, 15000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
        // Scroll to the new order in the list
        const orderElement = document.querySelector(`[data-order-id="${order.id}"]`);
        if (orderElement) {
          orderElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    notificationManager.playNotificationSound();
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.restaurantId) return;

    // Initial fetch
    fetchOrders();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`restaurant-orders-${user.restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${user.restaurantId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            setOrders(prev => [newOrder, ...prev]);
            
            // Show notification only if payment is completed
            if (newOrder.payment_status === 'completed') {
              showOrderNotification(newOrder);
              playNotificationSound();
            }
            
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order;
            const oldOrder = payload.old as Order;
            
            setOrders(prev => prev.map(order => 
              order.id === payload.new.id ? updatedOrder : order
            ));
            
            // Show notification if payment status changed to completed
            if (oldOrder.payment_status !== 'completed' && updatedOrder.payment_status === 'completed') {
              showOrderNotification(updatedOrder);
              playNotificationSound();
            }
            
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(order => order.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.restaurantId]);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'served': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'NEW ORDER';
      case 'in_progress': return 'PREPARING';
      case 'completed': return 'READY';
      case 'served': return 'SERVED';
      case 'cancelled': return 'CANCELLED';
      default: return status.toUpperCase();
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verifying': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <span className="text-3xl">📋</span> Orders Management
          </h1>
          <p className="text-gray-500">
            Track and manage customer orders from your menu
          </p>
        </div>
        
        {/* Notification Status */}
        <div className="flex items-center gap-4">
          {notificationPermission === 'granted' ? (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Notifications ON</span>
            </div>
          ) : notificationPermission === 'denied' ? (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg border border-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium">Notifications Blocked</span>
            </div>
          ) : (
            <button
              onClick={requestNotificationPermission}
              className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition"
            >
              <span className="text-sm font-medium">🔔 Enable Notifications</span>
            </button>
          )}
        </div>
      </div>
      
      <button className="mb-6 bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-900 transition shadow">
        + Add Order
      </button>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statusCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl shadow p-6 flex flex-col items-center border transition hover:scale-105 hover:shadow-lg ${card.bg}`}
          >
            <span className={`text-3xl mb-2 ${card.color}`}>{card.icon}</span>
            <span className="text-gray-700 font-semibold">{card.label}</span>
            <span className="text-2xl font-bold mt-2">{card.count}</span>
          </div>
        ))}
      </div>
      <div className="max-w-4xl bg-white rounded-xl shadow p-8 border mx-auto">
        <h2 className="text-lg font-semibold mb-6">All Orders ({orders.length})</h2>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-6xl mb-4">🗒️</span>
            <p className="text-lg font-semibold mb-2">No orders yet</p>
            <p className="text-gray-500 mb-6">
              Orders will appear here when customers place them through your menu
            </p>
            <div className="bg-gray-50 rounded-lg p-6 w-full max-w-xl">
              <h3 className="font-semibold mb-2">Order Management Features:</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>✔️ Real-time order notifications</li>
                <li>✔️ Order status tracking</li>
                <li>✔️ Customer details and preferences</li>
                <li>✔️ Payment processing simulation</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                data-order-id={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="font-mono font-bold text-blue-600">
                      #{order.unique_order_id}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(order.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status === 'completed' ? 'PAID' : order.payment_status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-sm text-gray-500">{order.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Table</p>
                    <p className="font-medium">Table {order.table_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-bold text-green-600">{formatCurrency(order.total_amount)}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Items</p>
                  <div className="space-y-1">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.dish_name} x{item.quantity}</span>
                        <span>{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Order ID: #{order.unique_order_id}
                  </div>
                  <div className="flex space-x-2">
                    {/* Only show status buttons if payment is completed */}
                    {order.payment_status === 'completed' && (
                      <>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'in_progress')}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                          >
                            Accept Order
                          </button>
                        )}
                        {order.status === 'in_progress' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'served')}
                            className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition"
                          >
                            Mark Served
                          </button>
                        )}
                      </>
                    )}
                    
                    {/* Show payment status message for unpaid orders */}
                    {(order.payment_status === 'pending' || order.payment_status === 'verifying') && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-yellow-700 font-medium">
                          {order.payment_status === 'pending' ? 'Awaiting Payment' : 'Verifying Payment'}
                        </span>
                      </div>
                    )}
                    
                    {order.payment_status === 'failed' && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-red-700 font-medium">Payment Failed</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 