"use client";

import { useState, useEffect } from 'react';
import { crossPlatformNotificationManager } from '@/utils/crossPlatformNotifications';

export default function NotificationDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    updateDiagnostics();
  }, []);

  const updateDiagnostics = () => {
    const info = crossPlatformNotificationManager.getDiagnosticInfo();
    setDiagnostics(info);
  };

  const testNotification = async () => {
    setIsTestingNotification(true);
    setTestResults(prev => [...prev, '🧪 Testing notification...']);
    
    try {
      await crossPlatformNotificationManager.showTestNotification();
      setTestResults(prev => [...prev, '✅ Test notification sent successfully']);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Test notification failed: ${error}`]);
    } finally {
      setIsTestingNotification(false);
      setTimeout(updateDiagnostics, 1000);
    }
  };

  const requestPermission = async () => {
    setTestResults(prev => [...prev, '🔐 Requesting notification permission...']);
    
    try {
      const permission = await crossPlatformNotificationManager.requestPermission();
      setTestResults(prev => [...prev, `🔔 Permission result: ${permission}`]);
      updateDiagnostics();
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Permission request failed: ${error}`]);
    }
  };

  const testAudio = async () => {
    setIsTestingAudio(true);
    setTestResults(prev => [...prev, '🔊 Testing audio...']);
    
    try {
      // Test audio by calling the private method through a test notification
      await crossPlatformNotificationManager.showTestNotification();
      setTestResults(prev => [...prev, '✅ Audio test completed (check if you heard sound)']);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Audio test failed: ${error}`]);
    } finally {
      setIsTestingAudio(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!diagnostics) {
    return <div className="p-4">Loading diagnostics...</div>;
  }

  const getStatusColor = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? 'text-green-400' : 'text-red-400';
    }
    if (status === 'granted') return 'text-green-400';
    if (status === 'denied') return 'text-red-400';
    return 'text-yellow-400';
  };

  const getStatusIcon = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? '✅' : '❌';
    }
    if (status === 'granted') return '✅';
    if (status === 'denied') return '❌';
    return '⚠️';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-6">🔧 Notification Diagnostics</h2>
      
      {/* Device Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">📱 Device Information</h3>
        <div className="bg-gray-700 rounded-lg p-4 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-300">Platform:</span>
              <span className="ml-2 text-white font-mono">{diagnostics.platform}</span>
            </div>
            <div>
              <span className="text-gray-300">Mobile:</span>
              <span className={`ml-2 ${getStatusColor(diagnostics.deviceInfo?.isMobile)}`}>
                {getStatusIcon(diagnostics.deviceInfo?.isMobile)} {diagnostics.deviceInfo?.isMobile ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-gray-300">Android:</span>
              <span className={`ml-2 ${getStatusColor(diagnostics.deviceInfo?.isAndroid)}`}>
                {getStatusIcon(diagnostics.deviceInfo?.isAndroid)} {diagnostics.deviceInfo?.isAndroid ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-gray-300">iOS:</span>
              <span className={`ml-2 ${getStatusColor(diagnostics.deviceInfo?.isIOS)}`}>
                {getStatusIcon(diagnostics.deviceInfo?.isIOS)} {diagnostics.deviceInfo?.isIOS ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-gray-300">Windows:</span>
              <span className={`ml-2 ${getStatusColor(diagnostics.deviceInfo?.isWindows)}`}>
                {getStatusIcon(diagnostics.deviceInfo?.isWindows)} {diagnostics.deviceInfo?.isWindows ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-gray-300">Mac:</span>
              <span className={`ml-2 ${getStatusColor(diagnostics.deviceInfo?.isMac)}`}>
                {getStatusIcon(diagnostics.deviceInfo?.isMac)} {diagnostics.deviceInfo?.isMac ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-gray-300">Safari:</span>
              <span className={`ml-2 ${getStatusColor(diagnostics.deviceInfo?.isSafari)}`}>
                {getStatusIcon(diagnostics.deviceInfo?.isSafari)} {diagnostics.deviceInfo?.isSafari ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-gray-300">Chrome:</span>
              <span className={`ml-2 ${getStatusColor(diagnostics.deviceInfo?.isChrome)}`}>
                {getStatusIcon(diagnostics.deviceInfo?.isChrome)} {diagnostics.deviceInfo?.isChrome ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">🔔 Notification Status</h3>
        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">API Supported:</span>
            <span className={`${getStatusColor(diagnostics.notificationSupported)}`}>
              {getStatusIcon(diagnostics.notificationSupported)} {diagnostics.notificationSupported ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Permission:</span>
            <span className={`${getStatusColor(diagnostics.notificationPermission)}`}>
              {getStatusIcon(diagnostics.notificationPermission)} {diagnostics.notificationPermission}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Queue Length:</span>
            <span className="text-white">{diagnostics.queueLength}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Processing Queue:</span>
            <span className={`${getStatusColor(diagnostics.isProcessingQueue)}`}>
              {diagnostics.isProcessingQueue ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Audio Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">🔊 Audio Status</h3>
        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Audio Initialized:</span>
            <span className={`${getStatusColor(diagnostics.audioInitialized)}`}>
              {getStatusIcon(diagnostics.audioInitialized)} {diagnostics.audioInitialized ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Audio Context State:</span>
            <span className="text-white font-mono">{diagnostics.audioContextState}</span>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">🧪 Test Controls</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={requestPermission}
            disabled={diagnostics.notificationPermission === 'granted'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Request Permission
          </button>
          
          <button
            onClick={testNotification}
            disabled={isTestingNotification || diagnostics.notificationPermission !== 'granted'}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isTestingNotification ? 'Testing...' : 'Test Notification'}
          </button>
          
          <button
            onClick={testAudio}
            disabled={isTestingAudio}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isTestingAudio ? 'Testing...' : 'Test Audio'}
          </button>
          
          <button
            onClick={updateDiagnostics}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Refresh
          </button>
          
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">📋 Test Results</h3>
          <div className="bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm text-gray-300 mb-1 font-mono">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Agent */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">🌐 User Agent</h3>
        <div className="bg-gray-700 rounded-lg p-4">
          <code className="text-xs text-gray-300 break-all">
            {diagnostics.userAgent}
          </code>
        </div>
      </div>

      {/* Troubleshooting Tips */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">💡 Troubleshooting Tips</h3>
        <div className="bg-gray-700 rounded-lg p-4 space-y-2 text-sm text-gray-300">
          {diagnostics.deviceInfo?.isIOS && (
            <div className="p-3 bg-blue-900/50 rounded border-l-4 border-blue-400">
              <strong className="text-blue-300">iOS Safari:</strong> Make sure you're using HTTPS and request permission from a user gesture (button click).
            </div>
          )}
          {diagnostics.deviceInfo?.isAndroid && (
            <div className="p-3 bg-green-900/50 rounded border-l-4 border-green-400">
              <strong className="text-green-300">Android Chrome:</strong> Notifications should work well. Check if site notifications are blocked in browser settings.
            </div>
          )}
          {diagnostics.deviceInfo?.isMac && (
            <div className="p-3 bg-purple-900/50 rounded border-l-4 border-purple-400">
              <strong className="text-purple-300">Mac:</strong> Check System Preferences → Notifications to ensure browser notifications are allowed.
            </div>
          )}
          {diagnostics.notificationPermission === 'denied' && (
            <div className="p-3 bg-red-900/50 rounded border-l-4 border-red-400">
              <strong className="text-red-300">Permission Denied:</strong> You need to reset notification permissions in your browser settings and reload the page.
            </div>
          )}
          {!diagnostics.notificationSupported && (
            <div className="p-3 bg-yellow-900/50 rounded border-l-4 border-yellow-400">
              <strong className="text-yellow-300">Not Supported:</strong> Your browser doesn't support notifications. Try updating your browser or using a different one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}