import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

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
  onNewOrder?: (order: Order) => void;
  onOrderUpdate?: (order: Order, oldOrder: Order) => void;
  onOrderDelete?: (orderId: string) => void;
}

export function useRealTimeOrders({ 
  restaurantId, 
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
  
  // Connection management for mobile
  const subscriptionRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

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
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  // Mobile-friendly connection management
  const setupRealtimeConnection = useCallback(() => {
    if (!restaurantId || subscriptionRef.current) return;

    console.log('Setting up real-time connection for restaurant:', restaurantId);

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
          setReconnectAttempts(0); // Reset on successful message
          
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            setOrders(prev => [newOrder, ...prev]);
            onNewOrder?.(newOrder);
            
            // Increment count for all new orders
            setNewOrdersCount(prev => prev + 1);
            
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order;
            const oldOrder = payload.old as Order;
            
            setOrders(prev => prev.map(order => 
              order.id === payload.new.id ? updatedOrder : order
            ));
            
            onOrderUpdate?.(updatedOrder, oldOrder);
            
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(order => order.id !== payload.old.id));
            onOrderDelete?.(payload.old.id);
          }
        }
      )
      .on('system', {}, (payload) => {
        console.log('Subscription status:', payload);
        if (payload.type === 'connected') {
          setIsConnected(true);
          setError(null);
        } else if (payload.type === 'disconnected') {
          setIsConnected(false);
          // Attempt reconnection on mobile network issues
          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            reconnectTimeoutRef.current = setTimeout(() => {
              setReconnectAttempts(prev => prev + 1);
              subscription.unsubscribe();
              subscriptionRef.current = null;
              setupRealtimeConnection();
            }, delay);
          } else {
            setError('Connection lost. Please refresh the page.');
          }
        }
      })
      .subscribe((status) => {
        console.log('Subscription result:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setError('Connection error. Retrying...');
        }
      });

    subscriptionRef.current = subscription;
  }, [restaurantId, onNewOrder, onOrderUpdate, onOrderDelete, reconnectAttempts]);

  // Cleanup connection
  const cleanupConnection = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Reset new orders count
  const resetNewOrdersCount = useCallback(() => {
    setNewOrdersCount(0);
  }, []);

  // Manual refresh
  const refreshOrders = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Set up real-time subscription with mobile-friendly reconnection
  useEffect(() => {
    if (!restaurantId) return;

    // Initial fetch
    fetchOrders();

    // Set up real-time connection
    setupRealtimeConnection();

    // Auto-refresh every 30 seconds as backup (more frequent on mobile)
    const refreshInterval = setInterval(() => {
      fetchOrders();
    }, 30000);

    // Reset new orders count when user interacts
    const resetCount = () => setNewOrdersCount(0);
    document.addEventListener('click', resetCount);
    document.addEventListener('keydown', resetCount);
    document.addEventListener('touchstart', resetCount);

    // Handle page visibility changes (mobile background/foreground)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page became visible, refresh data and reconnect if needed
        fetchOrders();
        if (!isConnected) {
          cleanupConnection();
          setupRealtimeConnection();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle online/offline events
    const handleOnline = () => {
      console.log('Network back online, reconnecting...');
      cleanupConnection();
      setupRealtimeConnection();
      fetchOrders();
    };
    const handleOffline = () => {
      console.log('Network offline');
      setIsConnected(false);
      setError('Network offline');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      cleanupConnection();
      clearInterval(refreshInterval);
      document.removeEventListener('click', resetCount);
      document.removeEventListener('keydown', resetCount);
      document.removeEventListener('touchstart', resetCount);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [restaurantId, fetchOrders, setupRealtimeConnection, cleanupConnection, isConnected]);

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