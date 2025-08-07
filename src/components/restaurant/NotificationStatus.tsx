"use client";

import { useState, useEffect } from 'react';
import { productionNotificationService } from '@/utils/productionNotifications';

export default function NotificationStatus() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  useEffect(() => {
    setPermission(productionNotificationService.getPermission());
  }, []);

  const handleEnableNotifications = async () => {
    try {
      const newPermission = await productionNotificationService.requestPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted') {
        setIsTestingNotification(true);
        await productionNotificationService.showTestNotification();
        setTimeout(() => setIsTestingNotification(false), 2000);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    }
  };

  const handleTestNotification = async () => {
    if (permission !== 'granted') {
      await handleEnableNotifications();
      return;
    }

    try {
      setIsTestingNotification(true);
      await productionNotificationService.showTestNotification();
      setTimeout(() => setIsTestingNotification(false), 2000);
    } catch (error) {
      console.error('Error testing notification:', error);
      setIsTestingNotification(false);
    }
  };

  const getStatusColor = () => {
    switch (permission) {
      case 'granted': return 'text-green-600 bg-green-50';
      case 'denied': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusText = () => {
    switch (permission) {
      case 'granted': return '✅ Notifications Enabled';
      case 'denied': return '❌ Notifications Blocked';
      default: return '⚠️ Notifications Not Set';
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-white">
      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </div>
      
      {permission !== 'granted' && (
        <button
          onClick={handleEnableNotifications}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Enable Notifications
        </button>
      )}
      
      {permission === 'granted' && (
        <button
          onClick={handleTestNotification}
          disabled={isTestingNotification}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {isTestingNotification ? 'Testing...' : 'Test Notification'}
        </button>
      )}
      
      <div className="text-xs text-gray-500">
        {permission === 'granted' 
          ? 'You will receive alerts for paid orders with sound'
          : 'Enable notifications to get instant alerts for paid orders'
        }
      </div>
    </div>
  );
}