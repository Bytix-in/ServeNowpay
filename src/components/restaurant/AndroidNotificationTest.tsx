"use client";

import { useState, useEffect } from 'react';
import { androidNotificationManager } from '@/utils/androidNotificationFix';

export default function AndroidNotificationTest() {
  const [isAndroid, setIsAndroid] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [isTestingSound, setIsTestingSound] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Detect if this is an Android device
    const userAgent = navigator.userAgent.toLowerCase();
    const androidDevice = /android/i.test(userAgent);
    setIsAndroid(androidDevice);

    // Get current notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    setTestResults(prev => [...prev, '🔐 Requesting notification permission...']);
    
    try {
      const newPermission = await Notification.requestPermission();
      setPermission(newPermission);
      setTestResults(prev => [...prev, `🔔 Permission result: ${newPermission}`]);
      
      if (newPermission === 'granted') {
        setTestResults(prev => [...prev, '✅ Permission granted! You can now test notifications.']);
      } else {
        setTestResults(prev => [...prev, '❌ Permission denied. Please enable notifications in browser settings.']);
      }
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Permission request failed: ${error}`]);
    }
  };

  const testNotification = async () => {
    setIsTestingNotification(true);
    setTestResults(prev => [...prev, '🧪 Testing Android notification...']);
    
    try {
      await androidNotificationManager.testAndroidNotification();
      setTestResults(prev => [...prev, '✅ Android notification test completed!']);
      setTestResults(prev => [...prev, '👀 Check if you saw a notification and heard sound/felt vibration']);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Android notification test failed: ${error}`]);
    } finally {
      setIsTestingNotification(false);
    }
  };

  const testBrowserNotification = async () => {
    setIsTestingNotification(true);
    setTestResults(prev => [...prev, '🌐 Testing standard browser notification...']);
    
    try {
      if (permission !== 'granted') {
        setTestResults(prev => [...prev, '⚠️ Permission not granted, requesting...']);
        await requestPermission();
        return;
      }

      const notification = new Notification('🧪 Browser Test Notification', {
        body: 'This is a standard browser notification test for Android',
        icon: '/favicon.ico',
        vibrate: [200, 100, 200],
        requireInteraction: true
      });

      notification.onclick = () => {
        setTestResults(prev => [...prev, '👆 Browser notification clicked!']);
        notification.close();
      };

      setTimeout(() => notification.close(), 10000);
      
      setTestResults(prev => [...prev, '✅ Browser notification test completed!']);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Browser notification test failed: ${error}`]);
    } finally {
      setIsTestingNotification(false);
    }
  };

  const testSound = async () => {
    setIsTestingSound(true);
    setTestResults(prev => [...prev, '🔊 Testing notification sound...']);
    
    try {
      // Test HTML Audio
      const audio = new Audio();
      audio.volume = 0.8;
      
      // Simple beep sound
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      
      await audio.play();
      setTestResults(prev => [...prev, '✅ HTML Audio test completed!']);
      setTestResults(prev => [...prev, '👂 Did you hear the beep sound?']);
      
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Sound test failed: ${error}`]);
      setTestResults(prev => [...prev, '💡 Try tapping the screen first to unlock audio']);
    } finally {
      setIsTestingSound(false);
    }
  };

  const testVibration = () => {
    setTestResults(prev => [...prev, '📳 Testing vibration...']);
    
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100, 500]);
      setTestResults(prev => [...prev, '✅ Vibration test completed!']);
      setTestResults(prev => [...prev, '📱 Did you feel the vibration?']);
    } else {
      setTestResults(prev => [...prev, '❌ Vibration not supported on this device']);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const checkAudioContext = () => {
    setTestResults(prev => [...prev, '🔍 Checking Audio Context...']);
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        setTestResults(prev => [...prev, `🎵 Audio Context state: ${audioContext.state}`]);
        
        if (audioContext.state === 'suspended') {
          setTestResults(prev => [...prev, '⚠️ Audio Context is suspended - need user interaction']);
          audioContext.resume().then(() => {
            setTestResults(prev => [...prev, '✅ Audio Context resumed']);
          });
        } else {
          setTestResults(prev => [...prev, '✅ Audio Context is ready']);
        }
        
        audioContext.close();
      } else {
        setTestResults(prev => [...prev, '❌ Audio Context not supported']);
      }
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Audio Context error: ${error}`]);
    }
  };

  if (!isAndroid) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="text-yellow-800 font-medium">ℹ️ Android Testing Component</div>
        <div className="text-yellow-700 text-sm mt-1">
          This component is designed for Android devices. Current device is not detected as Android.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">🤖 Android Notification Testing</h3>
      
      {/* Status */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">Current Status:</div>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            permission === 'granted' 
              ? 'bg-green-100 text-green-800' 
              : permission === 'denied'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {permission === 'granted' ? '✅ Notifications Enabled' : 
             permission === 'denied' ? '❌ Notifications Blocked' : 
             '⚠️ Notifications Not Set'}
          </div>
          <div className="text-sm text-gray-600">
            Android Chrome Browser
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">Test Controls:</div>
        <div className="flex flex-wrap gap-2">
          {permission !== 'granted' && (
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Request Permission
            </button>
          )}
          
          <button
            onClick={testNotification}
            disabled={isTestingNotification || permission !== 'granted'}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-sm"
          >
            {isTestingNotification ? 'Testing...' : 'Test Android Notification'}
          </button>
          
          <button
            onClick={testBrowserNotification}
            disabled={isTestingNotification}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 text-sm"
          >
            Test Browser Notification
          </button>
          
          <button
            onClick={testSound}
            disabled={isTestingSound}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 text-sm"
          >
            {isTestingSound ? 'Testing...' : 'Test Sound'}
          </button>
          
          <button
            onClick={testVibration}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            Test Vibration
          </button>
          
          <button
            onClick={checkAudioContext}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            Check Audio
          </button>
          
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Test Results:</div>
          <div className="bg-gray-900 rounded-lg p-3 max-h-60 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm text-green-400 mb-1 font-mono">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Android-specific Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-2">🤖 Android Troubleshooting Tips:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
          <li><strong>Sound Issues:</strong> Tap the screen first to unlock audio, check device volume</li>
          <li><strong>No Notifications:</strong> Check Chrome Settings → Site Settings → Notifications</li>
          <li><strong>Blocked Notifications:</strong> Tap lock icon in address bar → Notifications → Allow</li>
          <li><strong>No Vibration:</strong> Check if Do Not Disturb mode is enabled</li>
          <li><strong>Service Worker:</strong> Try refreshing the page to register service worker</li>
        </ul>
      </div>
    </div>
  );
}