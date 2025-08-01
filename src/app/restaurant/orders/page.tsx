"use client";

import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { notificationManager } from '@/utils/notifications';
import { useRealTimeOrders } from '@/hooks/useRealTimeOrders';
import OrderDetailsModal from '@/components/restaurant/OrderDetailsModal';


interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  table_number: string;
  items: any[];
  total_amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'served';
  payment_status: 'pending' | 'verifying' | 'completed' | 'failed' | 'not_configured';
  unique_order_id: string;
  created_at: string;
  updated_at: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  dish_type: string;
  description?: string;
  is_available?: boolean;
  preparation_time?: number;
  ingredients?: string;
  tags?: string;
}

export default function OrdersManagementPage() {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  // Use the real-time orders hook with activity feed integration
  const {
    orders,
    loading,
    isConnected,
    lastUpdate,
    newOrdersCount,
    error,
    statusCounts,
    refreshOrders,
    resetNewOrdersCount,
    updateOrderOptimistically
  } = useRealTimeOrders({
    restaurantId: user?.restaurantId || '', 
   onNewOrder: (order) => {
      console.log('New order received:', order);
      // Add to activity feed
      if ((window as any).addOrderActivity) {
        (window as any).addOrderActivity({
          type: 'new_order',
          message: `New order received from ${order.customer_name}`,
          orderId: order.unique_order_id,
          customerName: order.customer_name
        });
      }
    },
    onOrderUpdate: (updatedOrder, oldOrder) => {
      console.log('Order updated:', updatedOrder);
      // Add to activity feed if status changed
      if (oldOrder.status !== updatedOrder.status) {
        if ((window as any).addOrderActivity) {
          (window as any).addOrderActivity({
            type: 'status_change',
            message: `Order status changed to ${updatedOrder.status}`,
            orderId: updatedOrder.unique_order_id,
            customerName: updatedOrder.customer_name,
            status: updatedOrder.status
          });
        }
      }
      // Add to activity feed if payment completed
      if (oldOrder.payment_status !== 'completed' && updatedOrder.payment_status === 'completed') {
        if ((window as any).addOrderActivity) {
          (window as any).addOrderActivity({
            type: 'payment_completed',
            message: `Payment completed for order from ${updatedOrder.customer_name}`,
            orderId: updatedOrder.unique_order_id,
            customerName: updatedOrder.customer_name
          });
        }
      }
    },
    onOrderDelete: (orderId) => {
      console.log('Order deleted:', orderId);
    }
  });

  // Check notification permission status
  useEffect(() => {
    setNotificationPermission(notificationManager.getPermission());
    
    // Load Cashfree SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Calculate status cards from real-time data
  const statusCards = [
    {
      label: "New Orders",
      count: statusCounts.pending,
      color: "text-orange-500",
      bg: "bg-orange-50",
      icon: "🔔",
    },    {

      label: "Preparing",
      count: statusCounts.in_progress,
      color: "text-blue-500",
      bg: "bg-blue-50",
      icon: "👨‍🍳",
    },
    {
      label: "Ready",
      count: statusCounts.completed,
      color: "text-green-500",
      bg: "bg-green-50",
      icon: "✅",
    },
    {
      label: "Served",
      count: statusCounts.served,
      color: "text-gray-500",
      bg: "bg-gray-100",
      icon: "🍽️",
    },
  ];

  // Fetch menu items for the current restaurant
  const fetchMenuItems = async () => {
    if (!user?.restaurantId) return;

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', user.restaurantId)
        .order('dish_type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  // Fetch menu items when component mounts
  useEffect(() => {
    if (user?.restaurantId) {
      fetchMenuItems();
    }
  }, [user?.restaurantId]);

  // Function to request notification permission
  const requestNotificationPermission = async () => {
    const permission = await notificationManager.requestPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      notificationManager.showTestNotification();
    }
  };

  // Update order status with optimistic updates and state tracking
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    // Prevent multiple simultaneous updates for the same order
    if (updatingOrders.has(orderId)) return;
    
    // Find the order
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Add to updating set
    setUpdatingOrders(prev => new Set(prev).add(orderId));

    // Optimistic update - immediately update the UI
    updateOrderOptimistically(orderId, { 
      status: newStatus, 
      updated_at: new Date().toISOString() 
    });

    try {
      // Make the database update
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Add to activity feed
      if ((window as any).addOrderActivity) {
        (window as any).addOrderActivity({
          type: 'status_change',
          message: `Order status updated to ${newStatus}`,
          orderId: order.unique_order_id,
          customerName: order.customer_name,
          status: newStatus
        });
      }

    } catch (error) {
      console.error('Error updating order status:', error);
      
      // Revert optimistic update on error
      updateOrderOptimistically(orderId, { 
        status: order.status, 
        updated_at: order.updated_at 
      });
      
      alert('Failed to update order status. Please try again.');
    } finally {
      // Remove from updating set after a short delay to show success state
      setTimeout(() => {
        setUpdatingOrders(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
      }, 500);
    }
  };

  // Print invoice function
  const printInvoice = async (order: Order) => {
    try {
      // Show loading state
      const button = document.querySelector(`[data-order-id="${order.id}"] button:last-child`) as HTMLButtonElement;
      const originalText = button?.textContent;
      if (button) {
        button.textContent = 'Printing...';
        button.disabled = true;
      }

      // Generate invoice for printing
      const response = await fetch('/api/download-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          customerPhone: order.customer_phone
        })
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        // Always get the content as HTML for better printing compatibility
        const htmlContent = await response.text();
        
        // Open HTML in new window for printing
        const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        if (printWindow) {
          // Write the HTML content
          printWindow.document.open();
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          
          // Wait for content and images to load, then print
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 500);
          };
          
          // Fallback print trigger for older browsers
          setTimeout(() => {
            if (printWindow && !printWindow.closed) {
              printWindow.print();
            }
          }, 2000);
        } else {
          alert('Please allow popups to print the invoice.');
        }
        
        // Add to activity feed
        if ((window as any).addOrderActivity) {
          (window as any).addOrderActivity({
            type: 'status_change',
            message: `Invoice printed for ${order.customer_name}`,
            orderId: order.unique_order_id,
            customerName: order.customer_name
          });
        }
        
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to generate invoice: ${errorText}`);
      }

    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('❌ Failed to print invoice. Please try again.');
    } finally {
      // Reset button state
      const button = document.querySelector(`[data-order-id="${order.id}"] button:last-child`) as HTMLButtonElement;
      if (button && originalText) {
        button.textContent = originalText;
        button.disabled = false;
      }
    }
  };

  // Utility functions
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toFixed(2)}`;
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
      {/* Header with Real-time Status */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <span className="text-3xl">📋</span> Orders Management
            {newOrdersCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                {newOrdersCount} new
              </span>
            )}
          </h1>
          <p className="text-gray-500 flex items-center gap-2">
            Track and manage customer orders from your menu
            <span className="text-xs text-gray-400">
              • Last updated: {formatTime(lastUpdate.toISOString())}
            </span>
          </p>
        </div> 
       
        {/* Real-time Status & Controls */}
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
            isConnected 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'Live Updates' : 'Disconnected'}
            </span>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={() => {
              refreshOrders();
              resetNewOrdersCount();
            }}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition disabled:opacity-50"
          >
            <span className={`text-sm ${loading ? 'animate-spin' : ''}`}>🔄</span>
            <span className="text-sm font-medium">Refresh</span>
          </button>

          {/* Notification Status */}
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
  
      {/* Real-time Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statusCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-xl shadow p-6 flex flex-col items-center border transition hover:scale-105 hover:shadow-lg ${card.bg} relative`}
          >
            {/* Real-time indicator for new orders */}
            {card.label === "New Orders" && card.count > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            )}
            
            <span className={`text-3xl mb-2 ${card.color}`}>{card.icon}</span>
            <span className="text-gray-700 font-semibold">{card.label}</span>
            <motion.span 
              key={card.count}
              initial={{ scale: 1.2, color: '#ef4444' }}
              animate={{ scale: 1, color: 'inherit' }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold mt-2"
            >
              {card.count}
            </motion.span>
            
            {/* Live update indicator */}
            <div className="flex items-center gap-1 mt-2">
              <div className={`w-1 h-1 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-gray-500">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>


      
      <button 
        onClick={() => setShowAddOrderModal(true)}
        className="mb-6 bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-900 transition shadow"
      >
        + Add Order
      </button>     
 {/* Orders List with Real-time Updates */}
      <div className="max-w-4xl bg-white rounded-xl shadow p-8 border mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            All Orders ({orders.length})
            {isConnected && (
              <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Real-time
              </span>
            )}
          </h2>
          
          <div className="flex items-center gap-4">
            {/* Auto-refresh indicator */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Auto-refresh:</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>30s</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-6xl mb-4">⚠️</span>
            <p className="text-red-600 font-semibold mb-2">Error Loading Orders</p>
            <p className="text-gray-600 text-center">{error}</p>
            <button
              onClick={refreshOrders}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-6xl mb-4">🗒️</span>
            <p className="text-lg font-semibold mb-2">No orders yet</p>
            <p className="text-gray-500 mb-6">
              Orders will appear here when customers place them through your menu
            </p>
            <div className="bg-gray-50 rounded-lg p-6 w-full max-w-xl">
              <h3 className="font-semibold mb-2">Real-time Order Management Features:</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>✔️ Live order notifications with sound alerts</li>
                <li>✔️ Real-time status tracking and updates</li>
                <li>✔️ Activity feed showing recent order events</li>
                <li>✔️ Auto-refresh every 30 seconds as backup</li>
                <li>✔️ Connection status monitoring</li>
              </ul>
            </div>
          </div>        )
 : (
          <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
            {orders.map((order, index) => {
              const isNewOrder = order.status === 'pending' && order.payment_status === 'completed';
              const orderAge = Date.now() - new Date(order.created_at).getTime();
              const isRecentOrder = orderAge < 60000; // Less than 1 minute old
              
              return (
                <motion.div
                  key={order.id}
                  data-order-id={order.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    borderColor: isNewOrder ? '#f59e0b' : '#e5e7eb'
                  }}
                  transition={{ delay: index * 0.05 }}
                  className={`border rounded-lg p-4 hover:shadow-md transition-all duration-300 relative ${
                    isNewOrder ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                  } ${isRecentOrder ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}`}
                >
                  {/* New order indicator */}
                  {isNewOrder && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                      NEW!
                    </div>
                  )}
                  
                  {/* Recent order pulse */}
                  {isRecentOrder && (
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="font-mono font-bold text-blue-600 cursor-pointer hover:text-blue-800 transition"
                           onClick={() => {
                             setSelectedOrderId(order.id);
                             setShowOrderDetails(true);
                           }}
                           title="Click to view details">
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
                    <div className="flex items-center space-x-2">
                      {/* View Details Button */}
                      <button
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setShowOrderDetails(true);
                        }}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100 transition border border-blue-200 flex items-center gap-1"
                      >
                        <span>👁️</span>
                        View Details
                      </button>

                      {/* Print Invoice Button - Only for completed payments */}
                      {order.payment_status === 'completed' && (
                        <button
                          onClick={() => printInvoice(order)}
                          className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded hover:bg-green-100 transition border border-green-200 flex items-center gap-1"
                        >
                          <span>🖨️</span>
                          Print Invoice
                        </button>
                      )}
                      
                      {/* Only show status buttons if payment is completed */}
                      {order.payment_status === 'completed' && (
                        <>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'in_progress')}
                              disabled={updatingOrders.has(order.id)}
                              className={`px-3 py-1 text-xs rounded transition flex items-center gap-1 ${
                                updatingOrders.has(order.id)
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {updatingOrders.has(order.id) ? (
                                <>
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                  Updating...
                                </>
                              ) : (
                                'Accept Order'
                              )}
                            </button>
                          )}
                          {order.status === 'in_progress' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              disabled={updatingOrders.has(order.id)}
                              className={`px-3 py-1 text-xs rounded transition flex items-center gap-1 ${
                                updatingOrders.has(order.id)
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {updatingOrders.has(order.id) ? (
                                <>
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                  Updating...
                                </>
                              ) : (
                                'Mark Ready'
                              )}
                            </button>
                          )}
                          {order.status === 'completed' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'served')}
                              disabled={updatingOrders.has(order.id)}
                              className={`px-3 py-1 text-xs rounded transition flex items-center gap-1 ${
                                updatingOrders.has(order.id)
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-gray-600 text-white hover:bg-gray-700'
                              }`}
                            >
                              {updatingOrders.has(order.id) ? (
                                <>
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                  Updating...
                                </>
                              ) : (
                                'Mark Served'
                              )}
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
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrderId && (
        <OrderDetailsModal
          isOpen={showOrderDetails}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
        />
      )}
    </div>
  );
}