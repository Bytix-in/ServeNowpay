"use client";

import { useState, useEffect } from 'react';
import { crossPlatformNotificationManager } from '@/utils/crossPlatformNotifications';

export default function NotificationSetupGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  useEffect(() => {
    const info = crossPlatformNotificationManager.getDiagnosticInfo();
    setDeviceInfo(info.deviceInfo);
    setPermission(crossPlatformNotificationManager.getPermission());
  }, []);

  const requestPermission = async () => {
    try {
      const newPermission = await crossPlatformNotificationManager.requestPermission();
      setPermission(newPermission);
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  const testNotification = async () => {
    setIsTestingNotification(true);
    try {
      await crossPlatformNotificationManager.showTestNotification();
    } catch (error) {
      console.error('Test notification failed:', error);
    } finally {
      setIsTestingNotification(false);
    }
  };

  const getDeviceSpecificInstructions = () => {
    if (!deviceInfo) return null;

    if (deviceInfo.isIOS) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">📱 iOS/iPhone Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
            <li>Make sure you're using Safari (Chrome notifications may not work)</li>
            <li>Ensure the website is loaded over HTTPS</li>
            <li>Click "Allow" when prompted for notification permission</li>
            <li>If blocked, go to Settings → Safari → Notifications and enable for this site</li>
            <li>Keep Safari open in the background to receive notifications</li>
          </ol>
        </div>
      );
    }

    if (deviceInfo.isAndroid) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">🤖 Android Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-green-700">
            <li>Use Chrome browser for best notification support</li>
            <li>Click "Allow" when prompted for notification permission</li>
            <li>If blocked, tap the lock icon in address bar → Notifications → Allow</li>
            <li>Or go to Chrome Settings → Site Settings → Notifications</li>
            <li>Make sure "Do Not Disturb" mode isn't blocking notifications</li>
          </ol>
        </div>
      );
    }

    if (deviceInfo.isMac) {
      return (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 mb-2">🖥️ Mac Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-purple-700">
            <li>Works best with Chrome, Firefox, or Safari</li>
            <li>Click "Allow" when prompted for notification permission</li>
            <li>Check System Preferences → Notifications → [Browser] → Allow Notifications</li>
            <li>Make sure "Do Not Disturb" is not enabled</li>
            <li>Keep the browser tab open or pinned</li>
          </ol>
        </div>
      );
    }

    if (deviceInfo.isWindows) {
      return (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="font-semibold text-indigo-800 mb-2">🪟 Windows Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-indigo-700">
            <li>Works with Chrome, Edge, Firefox</li>
            <li>Click "Allow" when prompted for notification permission</li>
            <li>Check Windows Settings → System → Notifications → [Browser] is enabled</li>
            <li>Make sure Focus Assist is not blocking notifications</li>
            <li>Keep the browser running in the background</li>
          </ol>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">💻 General Instructions:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Use a modern browser (Chrome, Firefox, Safari, Edge)</li>
          <li>Make sure the website is loaded over HTTPS</li>
          <li>Click "Allow" when prompted for notification permission</li>
          <li>Check your browser's notification settings if blocked</li>
          <li>Keep the browser tab open to receive notifications</li>
        </ol>
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 underline"
      >
        🔧 Notification Setup Help
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">🔔 Notification Setup Guide</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Current Status */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Current Status</h3>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                permission === 'granted' 
                  ? 'bg-green-100 text-green-800' 
                  : permission === 'denied'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {permission === 'granted' ? '✅ Enabled' : permission === 'denied' ? '❌ Blocked' : '⚠️ Not Set'}
              </div>
              
              {deviceInfo && (
                <div className="text-sm text-gray-600">
                  Device: {deviceInfo.isIOS ? 'iOS' : deviceInfo.isAndroid ? 'Android' : deviceInfo.isMac ? 'Mac' : deviceInfo.isWindows ? 'Windows' : 'Unknown'} • 
                  Browser: {deviceInfo.isChrome ? 'Chrome' : deviceInfo.isSafari ? 'Safari' : deviceInfo.isFirefox ? 'Firefox' : deviceInfo.isEdge ? 'Edge' : 'Other'}
                </div>
              )}
            </div>
          </div>

          {/* Device-specific instructions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Setup Instructions for Your Device</h3>
            {getDeviceSpecificInstructions()}
          </div>

          {/* Action buttons */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Test Notifications</h3>
            <div className="flex gap-3">
              {permission !== 'granted' && (
                <button
                  onClick={requestPermission}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Request Permission
                </button>
              )}
              
              {permission === 'granted' && (
                <button
                  onClick={testNotification}
                  disabled={isTestingNotification}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isTestingNotification ? 'Testing...' : 'Test Notification'}
                </button>
              )}
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Still Not Working?</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <strong>Permission Denied:</strong> Clear your browser data for this site and reload the page, then try requesting permission again.
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <strong>No Sound:</strong> Make sure your device volume is up and not in silent mode. Some browsers require user interaction before playing audio.
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <strong>Mobile Issues:</strong> Try adding this website to your home screen as a web app for better notification support.
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                <strong>Browser Issues:</strong> Try a different browser or update your current browser to the latest version.
              </div>
            </div>
          </div>

          {/* Close button */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}