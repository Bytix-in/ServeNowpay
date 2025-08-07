// Production hook for paid order notifications
// Triggers only when payment_status = 'completed'

import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface PaidOrderNotificationHookProps {
  restaurantId: string;
  enabled?: boolean;
}

interface PaidOrder {
  id: string;
  unique_order_id: string;
  customer_name: string;
  customer_phone: string;
  table_number: string;
  total_amount: number;
  payment_status: string;
  status: string;
  created_at: string;
}

export function usePaidOrderNotifications({ 
  restaurantId, 
  enabled = true 
}: PaidOrderNotificationHookProps) {
  
  // Show browser notification with sound
  const showPaidOrderNotification = useCallback(async (order: PaidOrder) => {
    try {
      // Request permission if needed
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      // Show notification only if permission granted
      if (Notification.permission === 'granted') {
        const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
        
        const notification = new Notification('💰 NEW PAID ORDER!', {
          body: `Order #${order.unique_order_id}\n${order.customer_name} - Table ${order.table_number}\n${formatCurrency(order.total_amount)}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `paid-order-${order.id}`,
          requireInteraction: true,
          silent: false,
          vibrate: [200, 100, 200, 100, 400]
        });

        // Handle click - focus window
        notification.onclick = () => {
          window.focus();
          notification.close();
          if (window.location.pathname !== '/restaurant/orders') {
            window.location.href = '/restaurant/orders';
          }
        };

        // Auto close after 15 seconds
        setTimeout(() => notification.close(), 15000);
      }

      // Play notification sound
      await playNotificationSound();

    } catch (error) {
      console.error('Notification error:', error);
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(async () => {
    try {
      // Create audio context for better sound
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        // Create urgent chime sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const now = audioContext.currentTime;
        oscillator.frequency.setValueAtTime(1000, now);
        oscillator.frequency.setValueAtTime(1200, now + 0.1);
        oscillator.frequency.setValueAtTime(800, now + 0.2);
        oscillator.frequency.setValueAtTime(1000, now + 0.3);
        
        gainNode.gain.setValueAtTime(0.6, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        
        oscillator.start(now);
        oscillator.stop(now + 0.8);
        
        // Cleanup
        setTimeout(() => audioContext.close().catch(() => {}), 1000);
      } else {
        // Fallback to HTML audio
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.volume = 0.8;
        await audio.play();
      }
    } catch (error) {
      console.log('Audio failed, trying vibration');
      // Fallback to vibration on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
    }
  }, []);

  // Set up real-time listener for paid orders
  useEffect(() => {
    if (!restaurantId || !enabled) return;

    console.log('Setting up paid order notifications for restaurant:', restaurantId);

    // Listen specifically for payment_status = 'completed'
    const subscription = supabase
      .channel(`paid-orders-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        async (payload) => {
          console.log('Order change detected:', payload);

          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as PaidOrder;
            console.log('New order:', newOrder.unique_order_id, 'Payment status:', newOrder.payment_status);
            
            // Show notification only for paid orders
            if (newOrder.payment_status === 'completed') {
              console.log('🔔 Showing notification for paid order:', newOrder.unique_order_id);
              await showPaidOrderNotification(newOrder);
            }
            
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as PaidOrder;
            const oldOrder = payload.old as PaidOrder;
            
            console.log('Order updated:', updatedOrder.unique_order_id, 
              'Old payment status:', oldOrder.payment_status, 
              'New payment status:', updatedOrder.payment_status);
            
            // Show notification if payment status changed to completed
            if (oldOrder.payment_status !== 'completed' && updatedOrder.payment_status === 'completed') {
              console.log('🔔 Payment completed! Showing notification for:', updatedOrder.unique_order_id);
              await showPaidOrderNotification(updatedOrder);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up paid order notifications');
      subscription.unsubscribe();
    };
  }, [restaurantId, enabled, showPaidOrderNotification]);

  return {
    showTestNotification: async () => {
      const testOrder: PaidOrder = {
        id: 'test',
        unique_order_id: 'TEST123',
        customer_name: 'Test Customer',
        customer_phone: '9999999999',
        table_number: '1',
        total_amount: 299.99,
        payment_status: 'completed',
        status: 'pending',
        created_at: new Date().toISOString()
      };
      await showPaidOrderNotification(testOrder);
    }
  };
}