// Enhanced mobile-compatible paid order notifications
// Triggers only when payment_status = 'completed'

import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { mobileNotificationService } from '@/utils/mobileNotificationService';

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
  
  // Show paid order notification with mobile compatibility
  const showPaidOrderNotification = useCallback(async (order: PaidOrder) => {
    try {
      console.log('🔔 Showing paid order notification for:', order.unique_order_id);
      console.log('Order details:', {
        id: order.id,
        unique_order_id: order.unique_order_id,
        customer_name: order.customer_name,
        table_number: order.table_number,
        total_amount: order.total_amount,
        payment_status: order.payment_status
      });
      
      await mobileNotificationService.showPaidOrderNotification({
        id: order.id,
        unique_order_id: order.unique_order_id,
        customer_name: order.customer_name,
        table_number: order.table_number,
        total_amount: order.total_amount
      });
      
      console.log('✅ Paid order notification completed');
    } catch (error) {
      console.error('❌ Notification error:', error);
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
      await mobileNotificationService.showTestNotification();
    },
    isNotificationEnabled: () => mobileNotificationService.isFullyEnabled(),
    requestPermissions: () => mobileNotificationService.requestPermissions()
  };
}