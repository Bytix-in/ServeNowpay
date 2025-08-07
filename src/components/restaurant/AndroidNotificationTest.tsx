"use client";

import { useState, useEffect } from 'react';
import { androidNotificationManager } from '@/utils/androidNotificationFix';
import { androidBrowserNotificationManager } from '@/utils/androidBrowserNotifications';

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
      // Check permission first
      if (permission !== 'granted') {
        setTestResults(prev => [...prev, '❌ Permission not granted. Please request permission first.']);
        return;
      }

      // Check if androidNotificationManager is available
      if (typeof androidNotificationManager === 'undefined') {
        setTestResults(prev => [...prev, '❌ Android notification manager not loaded']);
        return;
      }

      await androidNotificationManager.testAndroidNotification();
      setTestResults(prev => [...prev, '✅ Android notification test completed!']);
      setTestResults(prev => [...prev, '👀 Check if you saw a notification and heard sound/felt vibration']);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Android notification test failed: ${error}`]);
      setTestResults(prev => [...prev, `🔍 Error details: ${JSON.stringify(error)}`]);
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

      // Check if service worker is registered
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && 'showNotification' in registration) {
          setTestResults(prev => [...prev, '📱 Using Service Worker notification...']);
          
          await registration.showNotification('🧪 Browser Test Notification', {
            body: 'This is a service worker notification test for Android',
            icon: '/favicon.ico',
            vibrate: [200, 100, 200],
            requireInteraction: true,
            tag: 'browser-test'
          });
          
          setTestResults(prev => [...prev, '✅ Service Worker notification test completed!']);
          setIsTestingNotification(false);
          return;
        }
      }

      // Fallback to regular notification if no service worker
      setTestResults(prev => [...prev, '📱 Using regular notification API...']);
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
      // First try to unlock audio context with user interaction
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        
        if (audioContext.state === 'suspended') {
          setTestResults(prev => [...prev, '🔓 Unlocking audio context...']);
          await audioContext.resume();
        }
        
        // Generate a simple beep using Web Audio API
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        setTestResults(prev => [...prev, '✅ Web Audio API test completed!']);
        setTestResults(prev => [...prev, '👂 Did you hear the beep sound?']);
        
        // Clean up
        setTimeout(() => audioContext.close(), 1000);
        
      } else {
        throw new Error('Web Audio API not supported');
      }
      
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Web Audio test failed: ${error}`]);
      
      // Fallback to HTML Audio with a generated sound
      try {
        setTestResults(prev => [...prev, '🔄 Trying HTML Audio fallback...']);
        
        // Generate a simple WAV file
        const sampleRate = 44100;
        const duration = 0.3;
        const samples = Math.floor(sampleRate * duration);
        const buffer = new ArrayBuffer(44 + samples * 2);
        const view = new DataView(buffer);
        
        // WAV header
        const writeString = (offset: number, string: string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + samples * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, samples * 2, true);
        
        // Generate sine wave
        for (let i = 0; i < samples; i++) {
          const sample = Math.sin(2 * Math.PI * 800 * i / sampleRate) * 0.3 * 32767;
          view.setInt16(44 + i * 2, sample, true);
        }
        
        const blob = new Blob([buffer], { type: 'audio/wav' });
        const audio = new Audio();
        audio.volume = 0.8;
        audio.src = URL.createObjectURL(blob);
        
        await audio.play();
        
        setTestResults(prev => [...prev, '✅ HTML Audio fallback completed!']);
        setTestResults(prev => [...prev, '👂 Did you hear the beep sound?']);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(audio.src), 1000);
        
      } catch (fallbackError) {
        setTestResults(prev => [...prev, `❌ HTML Audio fallback failed: ${fallbackError}`]);
        setTestResults(prev => [...prev, '💡 Try tapping the screen first to unlock audio']);
      }
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
          }).catch(err => {
            setTestResults(prev => [...prev, `❌ Failed to resume audio context: ${err}`]);
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

  const testSimpleNotification = async () => {
    setTestResults(prev => [...prev, '🔔 Testing simple notification...']);
    
    try {
      if (permission !== 'granted') {
        setTestResults(prev => [...prev, '❌ Permission not granted']);
        return;
      }

      // Check if we should use service worker or regular notification
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration && 'showNotification' in registration) {
            setTestResults(prev => [...prev, '📱 Using Service Worker for simple notification...']);
            
            await registration.showNotification('🧪 Simple Test', {
              body: 'This is a basic service worker notification test',
              icon: '/favicon.ico',
              vibrate: [200, 100, 200],
              tag: 'simple-test'
            });
            
            setTestResults(prev => [...prev, '✅ Simple service worker notification shown']);
            return;
          }
        } catch (swError) {
          setTestResults(prev => [...prev, `⚠️ Service worker failed, using regular notification: ${swError}`]);
        }
      }

      // Fallback to regular notification
      setTestResults(prev => [...prev, '📱 Using regular notification API...']);
      const notification = new Notification('🧪 Simple Test', {
        body: 'This is a basic notification test',
        icon: '/favicon.ico',
        vibrate: [200, 100, 200]
      });

      notification.onshow = () => {
        setTestResults(prev => [...prev, '✅ Simple notification shown']);
      };

      notification.onerror = (error) => {
        setTestResults(prev => [...prev, `❌ Simple notification error: ${error}`]);
      };

      setTimeout(() => notification.close(), 5000);
      
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Simple notification failed: ${error}`]);
    }
  };

  const testNativeBrowserNotification = async () => {
    setIsTestingNotification(true);
    setTestResults(prev => [...prev, '🌐 Testing native Android browser notification...']);
    
    try {
      if (permission !== 'granted') {
        setTestResults(prev => [...prev, '⚠️ Permission not granted, requesting...']);
        const newPermission = await androidBrowserNotificationManager.requestPermission();
        if (newPermission !== 'granted') {
          setTestResults(prev => [...prev, '❌ Permission denied']);
          return;
        }
      }

      // Test the enhanced Android browser notification
      await androidBrowserNotificationManager.showTestNotification();
      
      setTestResults(prev => [...prev, '✅ Native Android browser notification sent!']);
      setTestResults(prev => [...prev, '📱 Check your Android notification panel (swipe down from top)']);
      setTestResults(prev => [...prev, '👆 Tap the notification to test click handling']);
      
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Native browser notification failed: ${error}`]);
    } finally {
      setIsTestingNotification(false);
    }
  };

  const testGenericNotification = async () => {
    setIsTestingNotification(true);
    setTestResults(prev => [...prev, '📢 Testing generic Android notification...']);
    
    try {
      if (permission !== 'granted') {
        setTestResults(prev => [...prev, '⚠️ Permission not granted, requesting...']);
        const newPermission = await androidBrowserNotificationManager.requestPermission();
        if (newPermission !== 'granted') {
          setTestResults(prev => [...prev, '❌ Permission denied']);
          return;
        }
      }

      await androidBrowserNotificationManager.showGenericNotification(
        '🎉 Generic Test Notification',
        'This is a generic Android browser notification with action buttons and vibration.',
        {
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 400],
          data: {
            url: '/restaurant/orders',
            type: 'generic-test'
          }
        }
      );
      
      setTestResults(prev => [...prev, '✅ Generic Android notification sent!']);
      setTestResults(prev => [...prev, '📱 This should appear in your notification panel like other website notifications']);
      
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Generic notification failed: ${error}`]);
    } finally {
      setIsTestingNotification(false);
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
            onClick={testSimpleNotification}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
          >
            Simple Test
          </button>

          <button
            onClick={testNativeBrowserNotification}
            disabled={isTestingNotification}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 text-sm font-bold"
          >
            🔥 Native Android Notification
          </button>

          <button
            onClick={testGenericNotification}
            disabled={isTestingNotification}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 text-sm"
          >
            📢 Generic Notification
          </button>

          <button
            onClick={() => {
              setTestResults(prev => [...prev, '🔓 Unlocking audio with user interaction...']);
              // This button click itself provides the user interaction needed
              setTestResults(prev => [...prev, '✅ Audio should now be unlocked for sound tests']);
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
          >
            Unlock Audio
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

      {/* System Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-800 mb-2">📱 System Information:</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <div><strong>User Agent:</strong> {navigator.userAgent}</div>
          <div><strong>Service Worker Support:</strong> {'serviceWorker' in navigator ? '✅ Yes' : '❌ No'}</div>
          <div><strong>Notification Support:</strong> {'Notification' in window ? '✅ Yes' : '❌ No'}</div>
          <div><strong>Vibration Support:</strong> {'vibrate' in navigator ? '✅ Yes' : '❌ No'}</div>
          <div><strong>Audio Context Support:</strong> {(window.AudioContext || (window as any).webkitAudioContext) ? '✅ Yes' : '❌ No'}</div>
        </div>
      </div>

      {/* Native Android Notifications Info */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-red-800 mb-2">🔥 Native Android Browser Notifications:</h4>
        <div className="text-sm text-red-700 space-y-2">
          <p><strong>🎯 What are these?</strong> These are the same notifications you see from other websites like WhatsApp Web, Gmail, etc.</p>
          <p><strong>📱 Where they appear:</strong> In your Android notification panel (swipe down from top of screen)</p>
          <p><strong>✨ Features:</strong> Action buttons, rich content, persistent until dismissed, system sound & vibration</p>
          <p><strong>🔔 Best for:</strong> Important alerts like new paid orders that need immediate attention</p>
        </div>
      </div>

      {/* Android-specific Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-2">🤖 Android Troubleshooting Tips:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
          <li><strong>Service Worker Error:</strong> This is normal - Chrome requires ServiceWorker.showNotification() when SW is registered</li>
          <li><strong>Sound Issues:</strong> Click "Unlock Audio" button first, then test sound</li>
          <li><strong>No Notifications:</strong> Check Chrome Settings → Site Settings → Notifications</li>
          <li><strong>Blocked Notifications:</strong> Tap lock icon in address bar → Notifications → Allow</li>
          <li><strong>No Vibration:</strong> Check if Do Not Disturb mode is enabled</li>
          <li><strong>Service Worker:</strong> Try refreshing the page to register service worker</li>
          <li><strong>Native Notifications:</strong> These appear in Android notification panel, not as browser popups</li>
        </ul>
      </div>
    </div>
  );
}