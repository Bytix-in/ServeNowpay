import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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

interface UseRealTimeOrdersProps {
  restaurantId: string;
  notificationPermission?: NotificationPermission;
  onNewOrder?: (order: Order) => void;
  onOrderUpdate?: (order: Order, oldOrder: Order) => void;
  onOrderDelete?: (orderId: string) => void;
}

export function useRealTimeOrders({ 
  restaurantId, 
  notificationPermission,
  onNewOrder, 
  onOrderUpdate, 
  onOrderDelete 
}: UseRealTimeOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from database
  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setOrders(data || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  // Show notification for new orders
  const showOrderNotification = useCallback((order: Order) => {
    console.log('🔔 showOrderNotification called:', {
      orderId: order.unique_order_id,
      customerName: order.customer_name,
      paymentStatus: order.payment_status,
      notificationPermission
    });

    // Only show notification if permission is granted
    if (notificationPermission !== 'granted') {
      console.log('❌ Notification permission not granted:', notificationPermission);
      return;
    }

    console.log('✅ Attempting to show notification...');
    const notification = notificationManager.showOrderNotification({
      id: order.id,
      unique_order_id: order.unique_order_id,
      customer_name: order.customer_name,
      table_number: order.table_number,
      total_amount: order.total_amount
    });

    if (notification) {
      console.log('✅ Notification created successfully');
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
    } else {
      console.log('❌ Failed to create notification');
    }

    // Play notification sound
    console.log('🔊 Playing notification sound...');
    notificationManager.playNotificationSound();
  }, [notificationPermission]);

  // Reset new orders count
  const resetNewOrdersCount = useCallback(() => {
    setNewOrdersCount(0);
  }, []);

  // Manual refresh
  const refreshOrders = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Set up real-time subscription
  useEffect(() => {
    if (!restaurantId) return;

    // Initial fetch
    fetchOrders();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`restaurant-orders-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        (payload) => {
          setLastUpdate(new Date());
          
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            setOrders(prev => [newOrder, ...prev]);
            setNewOrdersCount(prev => prev + 1);
            
            // Call custom handler
            onNewOrder?.(newOrder);
            
            // Show notification for all new orders with completed payment
            console.log('📥 New order received:', {
              orderId: newOrder.unique_order_id,
              paymentStatus: newOrder.payment_status,
              customerName: newOrder.customer_name
            });
            
            if (newOrder.payment_status === 'completed') {
              console.log('💰 Payment completed - showing notification');
              showOrderNotification(newOrder);
            } else {
              console.log('⏳ Payment not completed yet:', newOrder.payment_status);
            }
            
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order;
            const oldOrder = payload.old as Order;
            
            setOrders(prev => prev.map(order => 
              order.id === payload.new.id ? updatedOrder : order
            ));
            
            // Call custom handler
            onOrderUpdate?.(updatedOrder, oldOrder);
            
            // Show notification if payment status changed to completed
            console.log('🔄 Order updated:', {
              orderId: updatedOrder.unique_order_id,
              oldPaymentStatus: oldOrder.payment_status,
              newPaymentStatus: updatedOrder.payment_status
            });
            
            if (oldOrder.payment_status !== 'completed' && updatedOrder.payment_status === 'completed') {
              console.log('💰 Payment status changed to completed - showing notification');
              showOrderNotification(updatedOrder);
              setNewOrdersCount(prev => prev + 1);
            }
            
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(order => order.id !== payload.old.id));
            onOrderDelete?.(payload.old.id);
          }
        }
      )
      .on('system', {}, (payload) => {
        if (payload.type === 'connected') {
          setIsConnected(true);
        } else if (payload.type === 'disconnected') {
          setIsConnected(false);
        }
      })
      .subscribe();

    // Auto-refresh every 30 seconds as backup
    const refreshInterval = setInterval(() => {
      fetchOrders();
    }, 30000);

    // Reset new orders count when user interacts
    const resetCount = () => setNewOrdersCount(0);
    document.addEventListener('click', resetCount);
    document.addEventListener('keydown', resetCount);

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
      document.removeEventListener('click', resetCount);
      document.removeEventListener('keydown', resetCount);
    };
  }, [restaurantId, fetchOrders, onNewOrder, onOrderUpdate, onOrderDelete, showOrderNotification]);

  // Calculate status counts
  const statusCounts = {
    pending: orders.filter(order => order.status === 'pending').length,
    in_progress: orders.filter(order => order.status === 'in_progress').length,
    completed: orders.filter(order => order.status === 'completed').length,
    served: orders.filter(order => order.status === 'served').length,
    cancelled: orders.filter(order => order.status === 'cancelled').length,
  };

  // Optimistic update function
  const updateOrderOptimistically = useCallback((orderId: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    ));
  }, []);

  return {
    orders,
    loading,
    isConnected,
    lastUpdate,
    newOrdersCount,
    error,
    statusCounts,
    refreshOrders,
    resetNewOrdersCount,
    fetchOrders,
    updateOrderOptimistically
  };
}