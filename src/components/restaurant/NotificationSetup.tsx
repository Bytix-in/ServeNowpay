'use client';

import { useState, useEffect } from 'react';
import { Bell, Volume2, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { mobileNotificationService } from '@/utils/mobileNotificationService';

interface NotificationSetupProps {
  onSetupComplete?: (enabled: boolean) => void;
}

export default function NotificationSetup({ onSetupComplete }: NotificationSetupProps) {
  const [isEnabling, setIsEnabling] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [notificationState, setNotificationState] = useState(mobileNotificationService.getState());

  // Check if setup is needed
  useEffect(() => {
    const state = mobileNotificationService.getState();
    setNotificationState(state);
    const needsSetup = 'Notification' in window && !state.fullyEnabled;
    setShowSetup(needsSetup);
  }, []);

  const handleEnableNotifications = async () => {
    setIsEnabling(true);
    
    try {
      const enabled = await mobileNotificationService.requestPermissions();
      
      if (enabled) {
        // Test notification
        await mobileNotificationService.showTestNotification();
        
        const newState = mobileNotificationService.getState();
        setNotificationState(newState);
        setShowSetup(false);
        onSetupComplete?.(true);
      } else {
        alert('Failed to enable notifications. Please check your browser settings.');
        onSetupComplete?.(false);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('Failed to enable notifications. Please try again.');
      onSetupComplete?.(false);
    } finally {
      setIsEnabling(false);
    }
  };

  const handleTestNotification = async () => {
    await mobileNotificationService.showTestNotification();
  };

  if (!('Notification' in window)) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="font-medium text-yellow-800">Notifications Not Supported</h3>
            <p className="text-sm text-yellow-700">
              Your browser doesn't support notifications. You'll need to manually check for new orders.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!showSetup && notificationState.fullyEnabled) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-medium text-green-800">Notifications Active</h3>
              <p className="text-sm text-green-700">
                You'll receive sound and popup alerts for paid orders
              </p>
            </div>
          </div>
          <Button
            onClick={handleTestNotification}
            variant="outline"
            size="sm"
            className="text-green-700 border-green-300 hover:bg-green-100"
          >
            Test Alert
          </Button>
        </div>
      </div>
    );
  }

  if (!showSetup) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-2">
            Enable Order Notifications
          </h3>
          <p className="text-blue-800 mb-4">
            Get instant alerts with sound when customers complete payments. 
            Works on all devices including mobile phones and tablets.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Volume2 className="w-4 h-4" />
              <span>Sound alerts</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Bell className="w-4 h-4" />
              <span>Push notifications</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Smartphone className="w-4 h-4" />
              <span>Mobile compatible</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleEnableNotifications}
              disabled={isEnabling}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isEnabling ? 'Enabling...' : 'Enable Notifications'}
            </Button>
            
            <Button
              onClick={() => setShowSetup(false)}
              variant="outline"
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              Skip for now
            </Button>
          </div>
          
          {notificationState.notificationPermission === 'denied' && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <strong>Notifications blocked:</strong> Please enable notifications in your browser settings, 
              then refresh the page and try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}