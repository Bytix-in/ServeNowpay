'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { mobileNotificationService } from '@/utils/mobileNotificationService';
import NotificationDebug from '@/components/restaurant/NotificationDebug';
import { Bell, Volume2, Smartphone, TestTube } from 'lucide-react';

export default function TestNotificationsPage() {
  const [isEnabling, setIsEnabling] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [state, setState] = useState(mobileNotificationService.getState());

  const handleEnableNotifications = async () => {
    setIsEnabling(true);
    try {
      const enabled = await mobileNotificationService.requestPermissions();
      setState(mobileNotificationService.getState());
      
      if (enabled) {
        alert('Notifications enabled successfully!');
      } else {
        alert('Failed to enable notifications. Check browser settings.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('Error enabling notifications');
    } finally {
      setIsEnabling(false);
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      await mobileNotificationService.showTestNotification();
    } catch (error) {
      console.error('Error testing notification:', error);
      alert('Error testing notification');
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestPaidOrder = async () => {
    setIsTesting(true);
    try {
      await mobileNotificationService.showPaidOrderNotification({
        id: 'test-paid-order',
        unique_order_id: 'ORD123',
        customer_name: 'John Doe',
        table_number: '5',
        total_amount: 599.99
      });
    } catch (error) {
      console.error('Error testing paid order notification:', error);
      alert('Error testing paid order notification');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification System Test</h1>
        <p className="text-gray-600">
          Test the mobile-compatible notification system across different devices and browsers.
        </p>
      </div>

      {/* Debug Panel */}
      <NotificationDebug />

      {/* Current State */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Current State</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Volume2 className={`w-5 h-5 ${state.audioEnabled ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <p className="font-medium">Audio</p>
              <p className="text-sm text-gray-600">
                {state.audioEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Bell className={`w-5 h-5 ${state.notificationPermission === 'granted' ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <p className="font-medium">Notifications</p>
              <p className="text-sm text-gray-600">
                {state.notificationPermission}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Smartphone className={`w-5 h-5 ${state.fullyEnabled ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <p className="font-medium">System</p>
              <p className="text-sm text-gray-600">
                {state.fullyEnabled ? 'Ready' : 'Setup needed'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleEnableNotifications}
            disabled={isEnabling}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isEnabling ? 'Enabling...' : 'Enable Notifications'}
          </Button>
          
          <Button
            onClick={handleTestNotification}
            disabled={isTesting || !state.fullyEnabled}
            variant="outline"
          >
            {isTesting ? 'Testing...' : 'Test Basic Notification'}
          </Button>
          
          <Button
            onClick={handleTestPaidOrder}
            disabled={isTesting || !state.fullyEnabled}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isTesting ? 'Testing...' : 'Test Paid Order Alert'}
          </Button>
        </div>
      </div>

      {/* Device Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Device Information</h2>
        <div className="space-y-2 text-sm">
          <p><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
          <p><strong>Platform:</strong> {typeof navigator !== 'undefined' ? navigator.platform : 'N/A'}</p>
          <p><strong>Notification Support:</strong> {typeof window !== 'undefined' && 'Notification' in window ? 'Yes' : 'No'}</p>
          <p><strong>Audio Context Support:</strong> {typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext) ? 'Yes' : 'No'}</p>
          <p><strong>Vibration Support:</strong> {typeof navigator !== 'undefined' && 'vibrate' in navigator ? 'Yes' : 'No'}</p>
          <p><strong>Online:</strong> {typeof navigator !== 'undefined' ? (navigator.onLine ? 'Yes' : 'No') : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}