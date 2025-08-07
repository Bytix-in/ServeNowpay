import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'alert';
  timestamp: Date;
  sound?: boolean;
}

export const useRealTimeNotifications = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Initialize audio context for custom sounds
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  // Generate notification sound using Web Audio API
  const playNotificationSound = async (type: 'success' | 'alert' | 'info' = 'info') => {
    try {
      initAudioContext();
      const audioContext = audioContextRef.current!;
      
      // Resume audio context if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different notification types
      const frequencies = {
        success: [523.25, 659.25, 783.99], // C5, E5, G5 (major chord)
        alert: [440, 554.37, 659.25], // A4, C#5, E5 (urgent)
        info: [261.63, 329.63, 392.00] // C4, E4, G4 (gentle)
      };
      
      const freq = frequencies[type];
      let currentTime = audioContext.currentTime;
      
      // Play sequence of tones
      freq.forEach((frequency, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.setValueAtTime(frequency, currentTime);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0, currentTime);
        gain.gain.linearRampToValueAtTime(0.3, currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
        
        osc.start(currentTime);
        osc.stop(currentTime + 0.3);
        
        currentTime += 0.2;
      });
      
    } catch (error) {
      console.warn('Could not play notification sound:', error);
      // Fallback to system beep
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  };

  // Show browser notification
  const showBrowserNotification = async (data: NotificationData) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(data.title, {
        body: data.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: data.id,
        requireInteraction: data.type === 'alert',
        vibrate: data.type === 'alert' ? [200, 100, 200, 100, 200] : [200],
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds for non-alert notifications
      if (data.type !== 'alert') {
        setTimeout(() => notification.close(), 5000);
      }
    }
  };

  // Handle incoming notification
  const handleNotification = async (data: NotificationData) => {
    // Add to notifications list
    setNotifications(prev => [data, ...prev.slice(0, 49)]); // Keep last 50

    // Show toast notification
    const toastType = data.type === 'alert' ? 'error' : data.type === 'payment' ? 'success' : 'info';
    toast[toastType](data.message, {
      position: 'top-right',
      autoClose: data.type === 'alert' ? false : 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // Show browser notification
    await showBrowserNotification(data);

    // Play sound
    if (data.sound !== false) {
      const soundType = data.type === 'payment' ? 'success' : data.type === 'alert' ? 'alert' : 'info';
      await playNotificationSound(soundType);
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  // Connect to Server-Sent Events
  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/notifications/stream');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('Connected to notification stream');
    };

    eventSource.onmessage = (event) => {
      try {
        const data: NotificationData = JSON.parse(event.data);
        handleNotification(data);
      } catch (error) {
        console.error('Error parsing notification data:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      console.log('Notification stream disconnected');
      
      // Reconnect after 3 seconds
      setTimeout(() => {
        if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
          connectSSE();
        }
      }, 3000);
    };
  };

  // Initialize connection
  useEffect(() => {
    // Request notification permission on mount
    requestNotificationPermission();
    
    // Connect to notification stream
    connectSSE();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Test notification function
  const testNotification = async () => {
    const testData: NotificationData = {
      id: `test-${Date.now()}`,
      title: '🔔 Test Notification',
      message: 'This is a test notification with sound!',
      type: 'info',
      timestamp: new Date(),
      sound: true
    };
    
    await handleNotification(testData);
  };

  return {
    isConnected,
    notifications,
    testNotification,
    requestNotificationPermission,
    playNotificationSound
  };
};