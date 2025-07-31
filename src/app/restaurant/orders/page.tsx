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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { user } = useAuth();

  // Check notification permission status
  useEffect(() => {
    setNotificationPermission(notificationManager.getPermission());
    
    // Load Cashfree SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    document.head.appendChild(script);
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
      // Silently handle order fetch errors
    } finally {
      setLoading(false);
    }
  };

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
      // Silently handle menu fetch errors
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

  // Create manual order
  const createManualOrder = async (orderData: {
    customer_name: string;
    customer_phone: string;
    table_number: string;
    items: { dish_name: string; quantity: number; price: number; total: number }[];
    total_amount: number;
    payment_method: 'cash' | 'online';
  }) => {
    if (!user?.restaurantId) return;

    setIsCreatingOrder(true);
    try {
      if (orderData.payment_method === 'online') {
        // For online payment, use the create-payment API
        const response = await fetch('/api/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            restaurant_id: user.restaurantId,
            customer_name: orderData.customer_name,
            customer_phone: orderData.customer_phone,
            table_number: orderData.table_number,
            items: orderData.items,
            total_amount: orderData.total_amount
          })
        });

        const result = await response.json();

        if (response.ok) {
          // Close modal
          setShowAddOrderModal(false);
          
          if (result.payment_session_id) {
            // Open payment page in new tab with Cashfree
            const cashfree = (window as any).Cashfree({
              mode: result.environment || 'sandbox'
            });
            
            cashfree.checkout({
              paymentSessionId: result.payment_session_id,
              redirectTarget: '_blank'  // Open in new tab
            });
            
            // Show success message to restaurant staff
            alert(`Order created successfully! Payment page opened in new tab for customer.`);
          } else {
            // Fallback: open success page in new tab for manual payment
            window.open(`/payment/success?order_id=${result.order_id}&no_payment=true`, '_blank');
            alert('Order created successfully! Payment page opened in new tab.');
          }
        } else {
          throw new Error(result.error || 'Failed to create payment');
        }
      } else {
        // For cash payment, create order directly
        const newOrderData = {
          restaurant_id: user.restaurantId,
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          table_number: orderData.table_number,
          items: orderData.items,
          total_amount: orderData.total_amount,
          status: 'pending' as const,
          payment_status: 'completed' as const
        };

        const { data, error } = await supabase
          .from('orders')
          .insert([newOrderData])
          .select()
          .single();

        if (error) throw error;

        // Close modal and show success
        setShowAddOrderModal(false);
        
        // Show notification for cash payment
        showOrderNotification(data as Order);
        playNotificationSound();
      }

    } catch (error) {
      alert('Failed to create order. Please try again.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.restaurantId) return;

    // Initial fetch
    fetchOrders();
    fetchMenuItems();

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
      // Silently handle order update errors
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
      
      <button 
        onClick={() => setShowAddOrderModal(true)}
        className="mb-6 bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-900 transition shadow"
      >
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

      {/* Add Order Modal */}
      {showAddOrderModal && (
        <AddOrderModal
          isOpen={showAddOrderModal}
          onClose={() => setShowAddOrderModal(false)}
          onSubmit={createManualOrder}
          isLoading={isCreatingOrder}
          menuItems={menuItems}
        />
      )}
    </div>
  );
}

// Add Order Modal Component
interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: any) => void;
  isLoading: boolean;
  menuItems: MenuItem[];
}

function AddOrderModal({ isOpen, onClose, onSubmit, isLoading, menuItems }: AddOrderModalProps) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    table_number: '',
    payment_method: 'cash' as 'cash' | 'online'
  });

  const [items, setItems] = useState([
    { menu_item_id: '', dish_name: '', quantity: 1, price: 0, total: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { menu_item_id: '', dish_name: '', quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    
    if (field === 'menu_item_id') {
      // When menu item is selected, auto-fill name and price
      const selectedMenuItem = menuItems.find(item => item.id === value);
      if (selectedMenuItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          menu_item_id: value,
          dish_name: selectedMenuItem.name,
          price: selectedMenuItem.price,
          total: updatedItems[index].quantity * selectedMenuItem.price
        };
      }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      
      // Auto-calculate total when quantity changes
      if (field === 'quantity') {
        updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].price;
      }
    }
    
    setItems(updatedItems);
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customer_name || !formData.customer_phone || !formData.table_number) {
      alert('Please fill in all required fields');
      return;
    }

    if (items.some(item => !item.menu_item_id || !item.dish_name || item.quantity <= 0 || item.price <= 0)) {
      alert('Please select menu items and fill in all details correctly');
      return;
    }

    const orderData = {
      ...formData,
      items,
      total_amount: getTotalAmount()
    };

    onSubmit(orderData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Add Manual Order</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Table Number *</label>
                <input
                  type="text"
                  value={formData.table_number}
                  onChange={(e) => setFormData({...formData, table_number: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Table 1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method *</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value as any})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Order Items *</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                  disabled={menuItems.length === 0}
                >
                  + Add Item
                </button>
              </div>
              
              {menuItems.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-yellow-800">
                    📋 No menu items found. Please add items to your menu first before creating manual orders.
                  </p>
                </div>
              )}
              
              {items.map((item, index) => (
                <div key={index} className="border rounded-lg p-3 mb-3">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-6">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Select Dish</label>
                      <select
                        value={item.menu_item_id}
                        onChange={(e) => updateItem(index, 'menu_item_id', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Choose a dish...</option>
                        {menuItems.map((menuItem) => (
                          <option key={menuItem.id} value={menuItem.id}>
                            {menuItem.name} - ₹{menuItem.price}
                            {menuItem.dish_type && ` (${menuItem.dish_type})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Qty"
                        min="1"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Price</label>
                      <div className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700">
                        ₹{item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Total</label>
                      <div className="text-sm font-medium text-gray-700 px-3 py-2">
                        ₹{item.total.toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800 text-lg font-bold w-full h-8 flex items-center justify-center"
                          title="Remove item"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  {item.menu_item_id && menuItems.find(m => m.id === item.menu_item_id)?.description && (
                    <div className="mt-2 text-xs text-gray-500">
                      {menuItems.find(m => m.id === item.menu_item_id)?.description}
                    </div>
                  )}
                </div>
              ))}
            </div>



            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span>₹{getTotalAmount().toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
                disabled={isLoading || menuItems.length === 0}
              >
                {isLoading ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 