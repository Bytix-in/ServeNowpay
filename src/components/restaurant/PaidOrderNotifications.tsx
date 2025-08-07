"use client";

import { useState, useEffect } from 'react';
import { usePaidOrderNotifications } from '@/hooks/usePaidOrderNotifications';

interface PaidOrderNotificationsProps {
  restaurantId: string;
}

export default function PaidOrderNotifications({ restaurantId }: PaidOrderNotificationsProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Initialize the paid order notifications hook
  const { showTestNotification } = usePaidOrderNotifications({
    restaurantId,
    enabled: isEnabled && permission === 'granted'
  });

  useEffect(() => {
    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setIsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleEnableNotifications = async () => {
    try {
      if ('Notification' in window) {
        const newPermission = await Notification.requestPermission();
        setPermission(newPermission);
        
        if (newPermission === 'granted') {
          setIsEnabled(true);
          // Show test notification
          setIsTesting(true);
          await showTestNotification();
          setTimeout(() => setIsTesting(false), 2000);
        } else {
          alert('Please enable notifications in your browser settings to receive paid order alerts.');
        }
      } else {
        alert('Your browser does not support notifications.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setIsTesting(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      setIsTesting(true);
      await showTestNotification();
      setTimeout(() => setIsTesting(false), 2000);
    } catch (error) {
      console.error('Error testing notification:', error);
      setIsTesting(false);
    }
  };

  const handleTestRealOrder = async () => {
    try {
      setIsTesting(true);
      
      // Create a real test order in the database
      const response = await fetch('/api/test-paid-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ restaurantId })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Test paid order created:', result.order);
        // The notification will be triggered automatically by the real-time listener
      } else {
        console.error('Failed to create test order:', result.error);
        alert('Failed to create test order: ' + result.error);
      }
      
      setTimeout(() => setIsTesting(false), 3000);
    } catch (error) {
      console.error('Error creating test order:', error);
      alert('Error creating test order');
      setIsTesting(false);
    }
  };

  const getStatusDisplay = () => {
    if (permission === 'granted' && isEnabled) {
      return {
        text: '🔔 Paid Order Alerts: ON',
        color: 'text-green-700 bg-green-100 border-green-200',
        description: 'You will receive instant notifications with sound when orders are paid'
      };
    } else if (permission === 'denied') {
      return {
        text: '🔕 Notifications Blocked',
        color: 'text-red-700 bg-red-100 border-red-200',
        description: 'Please enable notifications in browser settings'
      };
    } else {
      return {
        text: '⚠️ Notifications Not Enabled',
        color: 'text-yellow-700 bg-yellow-100 border-yellow-200',
        description: 'Enable notifications to get alerts for paid orders'
      };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`px-3 py-2 rounded-lg border font-medium ${status.color}`}>
            {status.text}
          </div>
          <div className="text-sm text-gray-600">
            {status.description}
          </div>
        </div>
        
        <div className="flex gap-2">
          {permission !== 'granted' && (
            <button
              onClick={handleEnableNotifications}
              disabled={isTesting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isTesting ? 'Enabling...' : 'Enable Notifications'}
            </button>
          )}
          
          {permission === 'granted' && (
            <>
              <button
                onClick={handleTestNotification}
                disabled={isTesting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {isTesting ? 'Testing...' : 'Test Alert'}
              </button>
              <button
                onClick={handleTestRealOrder}
                disabled={isTesting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
              >
                {isTesting ? 'Creating...' : 'Test Real Order'}
              </button>
            </>
          )}
        </div>
      </div>
      
      {permission === 'granted' && isEnabled && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-green-800">
            <strong>✅ Ready!</strong> You will automatically receive notifications with sound when:
            <ul className="mt-1 ml-4 list-disc">
              <li>New orders are placed with completed payment</li>
              <li>Existing orders get paid (payment_status changes to 'completed')</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}