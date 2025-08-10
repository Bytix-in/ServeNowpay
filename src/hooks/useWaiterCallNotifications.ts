import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { notificationManager } from '@/utils/notifications';

interface WaiterCall {
  id: string;
  restaurant_id: string;
  customer_name: string;
  table_number: string;
  customer_phone?: string;
  message: string;
  status: 'pending' | 'acknowledged' | 'completed';
  created_at: string;
  updated_at: string;
}

interface UseWaiterCallNotificationsProps {
  restaurantId: string;
  enabled?: boolean;
  onNewCall?: (call: WaiterCall) => void;
}

export function useWaiterCallNotifications({
  restaurantId,
  enabled = true,
  onNewCall
}: UseWaiterCallNotificationsProps) {
  const [calls, setCalls] = useState<WaiterCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch initial waiter calls
  const fetchCalls = async () => {
    if (!restaurantId || !enabled) {
      console.log('🚫 Waiter calls fetch skipped:', { restaurantId, enabled });
      return;
    }

    console.log('🔍 Fetching waiter calls for restaurant:', restaurantId);

    try {
      const { data, error } = await supabase
        .from('waiter_calls')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching waiter calls:', error);
        return;
      }

      console.log('✅ Waiter calls fetched:', data);
      setCalls(data || []);
    } catch (error) {
      console.error('❌ Error fetching waiter calls:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show waiter call notification
  const showWaiterCallNotification = async (call: WaiterCall) => {
    try {
      console.log('🔔 Playing waiter call notification sound...');
      
      // Play notification sound (same as order notifications)
      await notificationManager.playNotificationSound();
      
      console.log('🔔 Showing waiter call notification popup...');
      
      // Show notification popup
      await notificationManager.showNotification({
        title: '🙋‍♂️ WAITER CALL!',
        body: `${call.customer_name} at Table ${call.table_number} needs assistance: ${call.message}`,
        tag: `waiter-call-${call.id}`,
        requireInteraction: true,
        silent: false,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
      
      console.log('✅ Waiter call notification completed');
    } catch (error) {
      console.error('❌ Error showing waiter call notification:', error);
      
      // Fallback: try to play sound even if notification fails
      try {
        await notificationManager.playNotificationSound();
      } catch (soundError) {
        console.error('❌ Even sound fallback failed:', soundError);
      }
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!restaurantId || !enabled) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchCalls();

    // Set up real-time subscription
    console.log('🔗 Setting up real-time subscription for restaurant:', restaurantId);
    
    const channel = supabase
      .channel(`waiter_calls_${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'waiter_calls',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        async (payload) => {
          console.log('🔔 REAL-TIME WAITER CALL RECEIVED:', payload);
          const newCall = payload.new as WaiterCall;
          
          // IMMEDIATELY play sound - don't wait for anything
          console.log('🔊 PLAYING SOUND IMMEDIATELY...');
          try {
            notificationManager.playNotificationSound().catch(e => console.error('Sound failed:', e));
          } catch (e) {
            console.error('Sound error:', e);
          }
          
          // Add to calls list FIRST
          setCalls(prev => {
            console.log('📝 Adding new call to list:', newCall);
            return [newCall, ...prev];
          });
          
          // Show notification (don't await - run in parallel)
          showWaiterCallNotification(newCall).catch(e => console.error('Notification failed:', e));
          
          // Show visual toast notification immediately
          try {
            const toast = document.createElement('div');
            toast.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: linear-gradient(135deg, #f97316, #ea580c);
              color: white;
              padding: 16px 20px;
              border-radius: 12px;
              box-shadow: 0 8px 25px rgba(249, 115, 22, 0.3);
              z-index: 10000;
              font-family: system-ui, -apple-system, sans-serif;
              font-weight: 600;
              animation: slideInRight 0.3s ease-out;
              max-width: 350px;
            `;
            
            toast.innerHTML = `
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">🙋‍♂️</span>
                <div>
                  <div style="font-size: 16px; margin-bottom: 4px;">WAITER CALL!</div>
                  <div style="font-size: 14px; opacity: 0.9;">${newCall.customer_name} at Table ${newCall.table_number}</div>
                </div>
              </div>
            `;
            
            // Add animation keyframes if not already added
            if (!document.querySelector('#waiter-toast-styles')) {
              const style = document.createElement('style');
              style.id = 'waiter-toast-styles';
              style.textContent = `
                @keyframes slideInRight {
                  from { transform: translateX(100%); opacity: 0; }
                  to { transform: translateX(0); opacity: 1; }
                }
              `;
              document.head.appendChild(style);
            }
            
            document.body.appendChild(toast);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
              if (toast.parentElement) {
                toast.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => toast.remove(), 300);
              }
            }, 5000);
          } catch (toastError) {
            console.error('Toast error:', toastError);
          }
          
          // Call callback if provided
          if (onNewCall) {
            try {
              onNewCall(newCall);
            } catch (callbackError) {
              console.error('Callback error:', callbackError);
            }
          }
          
          console.log('✅ WAITER CALL PROCESSING COMPLETE');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'waiter_calls',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        (payload) => {
          const updatedCall = payload.new as WaiterCall;
          
          // Update calls list
          setCalls(prev => 
            prev.map(call => 
              call.id === updatedCall.id ? updatedCall : call
            ).filter(call => call.status === 'pending') // Only show pending calls
          );
        }
      )
      .subscribe((status) => {
        console.log('📡 Waiter calls subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [restaurantId, enabled]);

  // Update call status
  const updateCallStatus = async (callId: string, status: 'acknowledged' | 'completed') => {
    try {
      const response = await fetch('/api/call-waiter', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_id: callId,
          status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update call status');
      }

      // Optimistically update local state
      setCalls(prev => 
        prev.map(call => 
          call.id === callId ? { ...call, status } : call
        ).filter(call => call.status === 'pending') // Only show pending calls
      );

      return true;
    } catch (error) {
      console.error('Error updating call status:', error);
      return false;
    }
  };

  return {
    calls,
    loading,
    isConnected,
    updateCallStatus,
    refreshCalls: fetchCalls
  };
}