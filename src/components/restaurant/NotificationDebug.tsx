'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { mobileNotificationService } from '@/utils/mobileNotificationService';

export default function NotificationDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  const updateDebugInfo = () => {
    if (typeof window === 'undefined') return;
    
    const info = {
      notificationSupported: 'Notification' in window,
      currentPermission: 'Notification' in window ? Notification.permission : 'N/A',
      serviceState: mobileNotificationService.getState(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    setDebugInfo(info);
    console.log('Debug info:', info);
  };

  useEffect(() => {
    updateDebugInfo();
  }, []);

  const testBrowserNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Notifications not supported');
      return;
    }

    console.log('Testing browser notification directly...');
    
    try {
      // Request permission if needed
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        console.log('Permission result:', permission);
        updateDebugInfo();
      }

      if (Notification.permission === 'granted') {
        // Try service worker notification first (more reliable)
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification('🧪 Service Worker Test', {
              body: 'This is a service worker notification test',
              icon: '/favicon.ico',
              requireInteraction: false,
              tag: 'test-sw-notification'
            });
            console.log('Service worker notification created');
            alert('Service worker notification sent successfully!');
            return;
          } catch (swError) {
            console.log('Service worker notification failed, trying direct:', swError);
          }
        }

        // Fallback to direct notification
        const notification = new Notification('🧪 Direct Test Notification', {
          body: 'This is a direct browser notification test',
          icon: '/favicon.ico',
          requireInteraction: false
        });

        notification.onclick = () => {
          console.log('Direct notification clicked');
          notification.close();
        };

        setTimeout(() => notification.close(), 5000);
        console.log('Direct notification created');
        alert('Direct notification sent successfully!');
      } else {
        alert('Notification permission not granted: ' + Notification.permission);
      }
    } catch (error) {
      console.error('Direct notification test failed:', error);
      alert('Direct notification test failed: ' + error.message);
    }
  };

  const testServiceNotification = async () => {
    console.log('Testing service notification...');
    await mobileNotificationService.showTestNotification();
    updateDebugInfo();
  };

  const requestPermissions = async () => {
    console.log('Requesting permissions via service...');
    const result = await mobileNotificationService.requestPermissions();
    console.log('Permission request result:', result);
    updateDebugInfo();
    alert('Permission request result: ' + result);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-yellow-800 mb-3">🔧 Notification Debug Panel</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2 text-sm">
          <p><strong>Notification Support:</strong> {debugInfo.notificationSupported ? 'Yes' : 'No'}</p>
          <p><strong>Browser Permission:</strong> {debugInfo.currentPermission}</p>
          <p><strong>Service Audio:</strong> {debugInfo.serviceState?.audioEnabled ? 'Yes' : 'No'}</p>
          <p><strong>Service Permission:</strong> {debugInfo.serviceState?.notificationPermission}</p>
          <p><strong>Fully Enabled:</strong> {debugInfo.serviceState?.fullyEnabled ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="space-y-2">
          <Button onClick={updateDebugInfo} size="sm" variant="outline">
            Refresh Info
          </Button>
          <Button onClick={requestPermissions} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            Request Permissions
          </Button>
          <Button onClick={testBrowserNotification} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            Test Direct Notification
          </Button>
          <Button onClick={testServiceNotification} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
            Test Service Notification
          </Button>
        </div>
      </div>
      
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-yellow-800">
          Show Raw Debug Data
        </summary>
        <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>
    </div>
  );
}