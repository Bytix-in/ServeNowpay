// Cross-platform notification utility for restaurant orders
// Supports: Windows, Mac, Android, iOS, Chrome, Firefox, Safari, Edge

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  vibrate?: number[];
  actions?: NotificationAction[];
}

export class OrderNotificationManager {
  private static instance: OrderNotificationManager;
  private permission: NotificationPermission = 'default';
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeNotifications();
    }
  }

  public static getInstance(): OrderNotificationManager {
    if (!OrderNotificationManager.instance) {
      OrderNotificationManager.instance = new OrderNotificationManager();
    }
    return OrderNotificationManager.instance;
  }

  // Initialize notifications with cross-platform support
  private async initializeNotifications() {
    // Check for Notification API support
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }

    // Register service worker for better mobile support
    if ('serviceWorker' in navigator) {
      try {
        // Create inline service worker for notifications
        const swCode = `
          self.addEventListener('notificationclick', function(event) {
            event.notification.close();
            event.waitUntil(
              clients.matchAll().then(function(clientList) {
                if (clientList.length > 0) {
                  return clientList[0].focus();
                }
                return clients.openWindow('/restaurant/orders');
              })
            );
          });
        `;
        
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        
        this.serviceWorkerRegistration = await navigator.serviceWorker.register(swUrl);
      } catch (error) {
        console.log('Service worker registration failed, using fallback notifications');
      }
    }
  }

  // Enhanced permission request with cross-browser support
  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined') return 'denied';

    // Check for Notification API support
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return 'denied';
    }

    try {
      // Modern browsers
      if (Notification.requestPermission) {
        this.permission = await Notification.requestPermission();
      }
      // Legacy browsers (Safari < 6)
      else if ((Notification as any).requestPermission) {
        this.permission = await new Promise((resolve) => {
          (Notification as any).requestPermission(resolve);
        });
      }

      return this.permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Enhanced support detection for all platforms
  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for standard Notification API
    if ('Notification' in window) return true;
    
    // Check for webkit notifications (older Safari)
    if ('webkitNotifications' in window) return true;
    
    // Check for service worker notifications (PWA support)
    if ('serviceWorker' in navigator && 'PushManager' in window) return true;
    
    return false;
  }

  public isPermitted(): boolean {
    return this.permission === 'granted';
  }

  public getPermission(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
    return this.permission;
  }

  // Detect device type for platform-specific optimizations
  private getDeviceInfo() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isWindows = /windows/i.test(userAgent);
    const isMac = /macintosh|mac os x/i.test(userAgent);
    
    return { isMobile, isAndroid, isIOS, isWindows, isMac };
  }

  // Enhanced cross-platform notification display
  public async showNotification(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isSupported() || !this.isPermitted()) {
      return null;
    }

    const deviceInfo = this.getDeviceInfo();

    try {
      // Enhanced notification options with platform-specific optimizations
      const notificationOptions: NotificationOptions = {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        requireInteraction: deviceInfo.isMobile ? true : (options.requireInteraction || false),
        silent: options.silent || false,
        timestamp: options.timestamp || Date.now(),
        // Mobile-specific enhancements
        vibrate: deviceInfo.isMobile ? [200, 100, 200, 100, 200] : undefined,
        // Add action buttons for supported platforms
        actions: deviceInfo.isMobile ? [
          { action: 'view', title: '👀 View Order', icon: '/favicon.ico' },
          { action: 'dismiss', title: '✖️ Dismiss', icon: '/favicon.ico' }
        ] : undefined
      };

      let notification: Notification | null = null;

      // Try service worker notifications first (better for mobile/PWA)
      if (this.serviceWorkerRegistration && 'showNotification' in this.serviceWorkerRegistration) {
        try {
          await this.serviceWorkerRegistration.showNotification(options.title, notificationOptions);
          // Create a mock notification object for consistency
          notification = {
            title: options.title,
            body: options.body,
            close: () => {},
            onclick: null,
            onclose: null,
            onerror: null,
            onshow: null
          } as Notification;
        } catch (swError) {
          console.log('Service worker notification failed, using standard API');
        }
      }

      // Fallback to standard Notification API
      if (!notification) {
        // Standard modern browsers
        if ('Notification' in window && Notification.permission === 'granted') {
          notification = new Notification(options.title, notificationOptions);
        }
        // Legacy webkit notifications (older Safari)
        else if ('webkitNotifications' in window) {
          const webkitNotification = (window as any).webkitNotifications.createNotification(
            notificationOptions.icon,
            options.title,
            options.body
          );
          webkitNotification.show();
          notification = webkitNotification;
        }
      }

      // Add click handler to focus the restaurant orders page
      if (notification && notification.onclick !== undefined) {
        notification.onclick = () => {
          window.focus();
          // Try to navigate to orders page
          if (window.location.pathname !== '/restaurant/orders') {
            window.location.href = '/restaurant/orders';
          }
          notification?.close();
        };
      }

      return notification;
    } catch (error) {
      console.error('Notification display error:', error);
      // Try alternative notification methods
      return this.showFallbackNotification(options);
    }
  }

  // Fallback notification for unsupported browsers
  private showFallbackNotification(options: NotificationOptions): Notification | null {
    try {
      // Create visual alert as fallback
      const alertDiv = document.createElement('div');
      alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1f2937;
        color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 300px;
        font-family: system-ui, -apple-system, sans-serif;
        animation: slideIn 0.3s ease-out;
      `;
      
      alertDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px;">${options.title}</div>
        <div style="font-size: 14px; opacity: 0.9;">${options.body}</div>
        <button onclick="this.parentElement.remove()" style="
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
        ">×</button>
      `;

      // Add animation keyframes
      if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }

      document.body.appendChild(alertDiv);

      // Auto-remove after 8 seconds
      setTimeout(() => {
        if (alertDiv.parentElement) {
          alertDiv.remove();
        }
      }, 8000);

      return null;
    } catch (fallbackError) {
      console.error('Fallback notification failed:', fallbackError);
      return null;
    }
  }

  // Show order notification with predefined format (only for paid orders)
  public async showOrderNotification(order: {
    id: string;
    unique_order_id: string;
    customer_name: string;
    table_number: string;
    total_amount: number;
  }): Promise<Notification | null> {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount);
    };

    const deviceInfo = this.getDeviceInfo();
    
    // Platform-specific notification content
    const title = deviceInfo.isMobile 
      ? '💰 NEW PAID ORDER!' 
      : '💰 NEW PAID ORDER RECEIVED! 🔔';
      
    const body = deviceInfo.isMobile
      ? `💳 PAID! #${order.unique_order_id}\n${order.customer_name} - Table ${order.table_number}\n${formatCurrency(order.total_amount)}`
      : `🚨 PAYMENT CONFIRMED! Order #${order.unique_order_id} from ${order.customer_name} at Table ${order.table_number} for ${formatCurrency(order.total_amount)}. Start preparing immediately!`;

    return await this.showNotification({
      title,
      body,
      tag: `paid-order-${order.id}`,
      requireInteraction: true,
      silent: false,
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    });
  }

  // Enhanced cross-platform notification sound
  public async playNotificationSound(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const deviceInfo = this.getDeviceInfo();
    
    // Try multiple audio methods for maximum compatibility
    const audioMethods = [
      () => this.playWebAudioSound(),
      () => this.playHTMLAudioSound(),
      () => this.playDataURISound(),
      () => this.triggerDeviceVibration(deviceInfo)
    ];

    for (const method of audioMethods) {
      try {
        await method();
        break; // If one method succeeds, stop trying others
      } catch (error) {
        console.log('Audio method failed, trying next...');
        continue;
      }
    }
  }

  // Web Audio API method (best quality, modern browsers)
  private async playWebAudioSound(): Promise<void> {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) throw new Error('Web Audio API not supported');

    const audioContext = new AudioContext();
    
    // Resume audio context if suspended (required by Chrome/Safari)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Create enhanced notification sound for paid orders
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Enhanced urgent chime sequence
    const now = audioContext.currentTime;
    oscillator.frequency.setValueAtTime(1000, now);
    oscillator.frequency.setValueAtTime(800, now + 0.1);
    oscillator.frequency.setValueAtTime(1200, now + 0.2);
    oscillator.frequency.setValueAtTime(900, now + 0.35);
    oscillator.frequency.setValueAtTime(1100, now + 0.5);
    
    gainNode.gain.setValueAtTime(0.5, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
    
    oscillator.start(now);
    oscillator.stop(now + 1.0);
    
    // Clean up after sound finishes
    setTimeout(() => {
      audioContext.close().catch(() => {});
    }, 1100);
  }

  // HTML Audio method (good compatibility)
  private async playHTMLAudioSound(): Promise<void> {
    // Create multiple audio elements for the chime sequence
    const frequencies = [1000, 800, 1200, 900, 1100];
    const durations = [150, 150, 150, 150, 200];
    
    for (let i = 0; i < frequencies.length; i++) {
      setTimeout(() => {
        try {
          // Generate tone using data URI
          const audio = new Audio();
          audio.volume = 0.7;
          
          // Create a simple beep sound
          const sampleRate = 44100;
          const duration = durations[i] / 1000;
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
          for (let j = 0; j < samples; j++) {
            const sample = Math.sin(2 * Math.PI * frequencies[i] * j / sampleRate) * 0.3 * 32767;
            view.setInt16(44 + j * 2, sample, true);
          }
          
          const blob = new Blob([buffer], { type: 'audio/wav' });
          audio.src = URL.createObjectURL(blob);
          audio.play().catch(() => {});
          
          // Clean up
          setTimeout(() => URL.revokeObjectURL(audio.src), duration * 1000 + 100);
        } catch (error) {
          // Continue to next tone
        }
      }, i * 120);
    }
  }

  // Data URI audio method (fallback)
  private async playDataURISound(): Promise<void> {
    const sounds = [
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
    ];
    
    for (let i = 0; i < sounds.length; i++) {
      setTimeout(() => {
        const audio = new Audio(sounds[i]);
        audio.volume = 0.8;
        audio.play().catch(() => {});
      }, i * 200);
    }
  }

  // Device vibration for mobile devices
  private async triggerDeviceVibration(deviceInfo: any): Promise<void> {
    if (deviceInfo.isMobile && 'vibrate' in navigator) {
      // Vibration pattern for paid order alert
      navigator.vibrate([200, 100, 200, 100, 400, 100, 200]);
    }
  }

  // Show test notification
  public async showTestNotification(): Promise<Notification | null> {
    const deviceInfo = this.getDeviceInfo();
    
    return await this.showNotification({
      title: '🎉 Test Notification',
      body: `Notifications working on ${deviceInfo.isAndroid ? 'Android' : deviceInfo.isIOS ? 'iOS' : deviceInfo.isWindows ? 'Windows' : deviceInfo.isMac ? 'Mac' : 'your device'}! You will receive alerts for paid orders.`,
      tag: 'test-notification',
      requireInteraction: false,
      icon: '/favicon.ico'
    });
  }
}

// Export singleton instance
export const notificationManager = OrderNotificationManager.getInstance();