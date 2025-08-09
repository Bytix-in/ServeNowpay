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
      await mobileNotificationService.showPaidOrderNotification({
        id: order.id,
        unique_order_id: order.unique_order_id,
        customer_name: order.customer_name,
        table_number: order.table_number,
        total_amount: order.total_amount
      });
    } catch (error) {
      // Silently handle notification errors in production
    }
  }, []);

  // Set up real-time listener for paid orders
  useEffect(() => {
    if (!restaurantId || !enabled) return;



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
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as PaidOrder;
            
            // Show notification only for paid orders
            if (newOrder.payment_status === 'completed') {
              await showPaidOrderNotification(newOrder);
            }
            
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as PaidOrder;
            const oldOrder = payload.old as PaidOrder;
            
            // Show notification if payment status changed to completed
            if (oldOrder.payment_status !== 'completed' && updatedOrder.payment_status === 'completed') {
              await showPaidOrderNotification(updatedOrder);
            }
          }
        }
      )
      .subscribe();

    return () => {
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