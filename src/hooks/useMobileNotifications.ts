// Enhanced mobile-compatible notification system
// Handles audio autoplay restrictions and mobile compatibility

import { useEffect, useCallback, useRef, useState } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  requireInteraction?: boolean;
  vibrate?: number[];
}

interface AudioContextState {
  context: AudioContext | null;
  initialized: boolean;
  userInteracted: boolean;
}

export function useMobileNotifications() {
  const audioContextRef = useRef<AudioContextState>({
    context: null,
    initialized: false,
    userInteracted: false
  });
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Initialize audio context after user interaction
  const initializeAudioContext = useCallback(async () => {
    if (audioContextRef.current.initialized) return true;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return false;

      const context = new AudioContext();
      
      // Resume context if suspended
      if (context.state === 'suspended') {
        await context.resume();
      }

      audioContextRef.current = {
        context,
        initialized: true,
        userInteracted: true
      };

      setAudioEnabled(true);
      return true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return false;
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, []);

  // Enable notifications with user interaction
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    const [audioInitialized, notificationGranted] = await Promise.all([
      initializeAudioContext(),
      requestNotificationPermission()
    ]);

    return audioInitialized && notificationGranted;
  }, [initializeAudioContext, requestNotificationPermission]);  // Pla
y notification sound with mobile compatibility
  const playNotificationSound = useCallback(async (): Promise<boolean> => {
    if (!audioContextRef.current.userInteracted) {
      console.warn('Cannot play sound without user interaction');
      return false;
    }

    try {
      const { context } = audioContextRef.current;
      if (!context || context.state === 'closed') {
        return false;
      }

      // Resume context if suspended (common on mobile)
      if (context.state === 'suspended') {
        await context.resume();
      }

      // Create notification sound
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      const now = context.currentTime;
      
      // Create a pleasant notification chime
      oscillator.frequency.setValueAtTime(800, now);
      oscillator.frequency.setValueAtTime(1000, now + 0.1);
      oscillator.frequency.setValueAtTime(1200, now + 0.2);
      oscillator.frequency.setValueAtTime(1000, now + 0.3);
      oscillator.frequency.setValueAtTime(800, now + 0.4);
      
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      
      oscillator.start(now);
      oscillator.stop(now + 0.8);
      
      return true;
    } catch (error) {
      console.error('Failed to play notification sound:', error);
      
      // Fallback to vibration on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 400]);
        return true;
      }
      
      return false;
    }
  }, []);

  // Show browser notification
  const showNotification = useCallback(async (options: NotificationOptions): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: options.requireInteraction ?? true,
        silent: false,
        vibrate: options.vibrate || [200, 100, 200],
        tag: `notification-${Date.now()}`
      });

      // Handle click - focus window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);

      return true;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return false;
    }
  }, []);

  // Combined notification with sound and vibration
  const showNotificationWithSound = useCallback(async (options: NotificationOptions): Promise<void> => {
    // Play sound first (works better on mobile)
    await playNotificationSound();
    
    // Show notification
    await showNotification(options);
    
    // Additional vibration for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(options.vibrate || [200, 100, 200, 100, 400]);
    }
  }, [playNotificationSound, showNotification]);

  // Check if notifications are supported and enabled
  const isNotificationSupported = useCallback((): boolean => {
    return 'Notification' in window;
  }, []);

  const isNotificationEnabled = useCallback((): boolean => {
    return notificationPermission === 'granted' && audioEnabled;
  }, [notificationPermission, audioEnabled]);

  // Initialize on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  return {
    enableNotifications,
    showNotification,
    showNotificationWithSound,
    playNotificationSound,
    isNotificationSupported,
    isNotificationEnabled,
    notificationPermission,
    audioEnabled
  };
}