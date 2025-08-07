// Enhanced Android Browser Notifications
// Shows native notifications in Android notification panel like other websites

export interface AndroidNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
  data?: any;
  timestamp?: number;
}

export class AndroidBrowserNotificationManager {
  private static instance: AndroidBrowserNotificationManager;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private isAndroid: boolean = false;
  private notificationQueue: AndroidNotificationOptions[] = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      this.detectAndroid();
      this.initializeServiceWorker();
    }
  }

  public static getInstance(): AndroidBrowserNotificationManager {
    if (!AndroidBrowserNotificationManager.instance) {
      AndroidBrowserNotificationManager.instance = new AndroidBrowserNotificationManager();
    }
    return AndroidBrowserNotificationManager.instance;
  }

  private detectAndroid(): void {
    const userAgent = navigator.userAgent.toLowerCase();
    this.isAndroid = /android/i.test(userAgent);
    console.log('🤖 Android detected:', this.isAndroid);
  }

  private async initializeServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.log('⚠️ Service Worker not supported');
      return;
    }

    try {
      // Enhanced service worker for Android notifications
      const swCode = `
        console.log('🔧 Android Notification Service Worker: Starting');
        
        // Handle notification clicks
        self.addEventListener('notificationclick', function(event) {
          console.log('🔔 Android Notification clicked:', event.notification.tag);
          
          const notification = event.notification;
          const action = event.action;
          const data = notification.data || {};
          
          notification.close();
          
          event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
              console.log('👥 Found clients:', clientList.length);
              
              // Handle action buttons
              if (action === 'view' || action === 'open') {
                const targetUrl = data.url || '/restaurant/orders';
                
                // Try to focus existing window with target URL
                for (let i = 0; i < clientList.length; i++) {
                  const client = clientList[i];
                  if (client.url.includes(targetUrl.split('?')[0])) {
                    console.log('🎯 Focusing existing target window');
                    return client.focus();
                  }
                }
                
                // Focus any existing window and navigate
                if (clientList.length > 0) {
                  console.log('🎯 Focusing existing window and navigating');
                  const client = clientList[0];
                  client.postMessage({ 
                    action: 'navigate', 
                    url: targetUrl,
                    notificationData: data 
                  });
                  return client.focus();
                }
                
                // Open new window
                console.log('🆕 Opening new window');
                return clients.openWindow(targetUrl);
              }
              
              // Default behavior - focus any existing window
              if (clientList.length > 0) {
                return clientList[0].focus();
              }
              
              return clients.openWindow('/');
            })
          );
        });

        // Handle notification close
        self.addEventListener('notificationclose', function(event) {
          console.log('❌ Android Notification closed:', event.notification.tag);
          
          // Track notification dismissal if needed
          const data = event.notification.data || {};
          if (data.trackDismissal) {
            // Could send analytics here
            console.log('📊 Tracking notification dismissal');
          }
        });

        // Handle push messages (for future PWA support)
        self.addEventListener('push', function(event) {
          console.log('📨 Push message received');
          
          if (event.data) {
            try {
              const data = event.data.json();
              console.log('📨 Push data:', data);
              
              const notificationOptions = {
                body: data.body || 'New notification',
                icon: data.icon || '/favicon.ico',
                badge: data.badge || '/favicon.ico',
                image: data.image,
                vibrate: data.vibrate || [200, 100, 200],
                requireInteraction: data.requireInteraction || true,
                silent: data.silent || false,
                tag: data.tag || 'push-notification',
                timestamp: Date.now(),
                data: data.data || {},
                actions: data.actions || [
                  {
                    action: 'view',
                    title: '👀 View',
                    icon: '/favicon.ico'
                  },
                  {
                    action: 'dismiss',
                    title: '✖️ Dismiss',
                    icon: '/favicon.ico'
                  }
                ]
              };
              
              event.waitUntil(
                self.registration.showNotification(
                  data.title || 'New Notification',
                  notificationOptions
                )
              );
            } catch (error) {
              console.error('❌ Error processing push message:', error);
            }
          }
        });

        // Service worker installation
        self.addEventListener('install', function(event) {
          console.log('⚙️ Android Notification Service Worker: Installing');
          self.skipWaiting();
        });

        // Service worker activation
        self.addEventListener('activate', function(event) {
          console.log('✅ Android Notification Service Worker: Activated');
          event.waitUntil(clients.claim());
        });
      `;
      
      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);
      
      this.serviceWorkerRegistration = await navigator.serviceWorker.register(swUrl, {
        scope: '/'
      });
      
      console.log('✅ Android Notification Service Worker registered');
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('✅ Android Notification Service Worker ready');
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { action, url, notificationData } = event.data;
    
    if (action === 'navigate' && url) {
      console.log('🧭 Navigating to:', url);
      window.location.href = url;
      
      // Trigger any custom handlers
      if (notificationData && notificationData.callback) {
        try {
          // Could execute custom callback here
          console.log('🔄 Executing notification callback');
        } catch (error) {
          console.error('❌ Callback execution failed:', error);
        }
      }
    }
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('❌ Notifications not supported');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', permission);
      
      if (permission === 'granted') {
        // Process any queued notifications
        await this.processNotificationQueue();
      }
      
      return permission;
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      return 'denied';
    }
  }

  public isPermissionGranted(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  public async showAndroidBrowserNotification(options: AndroidNotificationOptions): Promise<void> {
    console.log('📱 Showing Android browser notification:', options.title);

    // Check permission
    if (!this.isPermissionGranted()) {
      console.log('⚠️ Permission not granted, queuing notification');
      this.notificationQueue.push(options);
      return;
    }

    try {
      // Enhanced options for Android
      const androidOptions: NotificationOptions = {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        image: options.image, // Large image for rich notifications
        tag: options.tag || `notification-${Date.now()}`,
        requireInteraction: options.requireInteraction !== false, // Default to true for Android
        silent: options.silent || false,
        vibrate: options.vibrate || [300, 100, 300, 100, 300], // Strong vibration for Android
        timestamp: options.timestamp || Date.now(),
        data: {
          ...options.data,
          timestamp: Date.now(),
          platform: 'android',
          url: options.data?.url || '/restaurant/orders'
        },
        // Action buttons for Android
        actions: options.actions || [
          {
            action: 'view',
            title: '👀 View Details',
            icon: '/favicon.ico'
          },
          {
            action: 'dismiss',
            title: '✖️ Dismiss',
            icon: '/favicon.ico'
          }
        ]
      };

      // Use service worker notification for better Android support
      if (this.serviceWorkerRegistration && 'showNotification' in this.serviceWorkerRegistration) {
        console.log('📱 Using Service Worker notification');
        
        await this.serviceWorkerRegistration.showNotification(options.title, androidOptions);
        console.log('✅ Service Worker notification displayed');
        
      } else {
        // Fallback to regular notification
        console.log('📱 Using regular Notification API');
        
        const notification = new Notification(options.title, androidOptions);
        
        // Handle click events for regular notifications
        notification.onclick = () => {
          console.log('👆 Regular notification clicked');
          window.focus();
          
          if (options.data?.url) {
            window.location.href = options.data.url;
          }
          
          notification.close();
        };
        
        // Auto-close after specified time (longer for Android)
        if (!options.requireInteraction) {
          setTimeout(() => notification.close(), 15000);
        }
        
        console.log('✅ Regular notification displayed');
      }
      
    } catch (error) {
      console.error('❌ Android notification failed:', error);
      throw error;
    }
  }

  private async processNotificationQueue(): Promise<void> {
    if (this.notificationQueue.length === 0) return;
    
    console.log(`📋 Processing ${this.notificationQueue.length} queued notifications`);
    
    const queue = [...this.notificationQueue];
    this.notificationQueue = [];
    
    for (const notification of queue) {
      try {
        await this.showAndroidBrowserNotification(notification);
        // Small delay between notifications
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('❌ Failed to process queued notification:', error);
      }
    }
  }

  // Show order notification with Android-optimized format
  public async showOrderNotification(order: {
    id: string;
    unique_order_id: string;
    customer_name: string;
    table_number: string;
    total_amount: number;
    items?: any[];
  }): Promise<void> {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount);
    };

    // Create rich notification content for Android
    const title = '💰 NEW PAID ORDER RECEIVED!';
    const body = `Order #${order.unique_order_id}
👤 ${order.customer_name}
🪑 Table ${order.table_number}
💵 ${formatCurrency(order.total_amount)}

Tap to view full order details and start preparation.`;

    await this.showAndroidBrowserNotification({
      title,
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `paid-order-${order.id}`,
      requireInteraction: true,
      silent: false,
      vibrate: [400, 200, 400, 200, 600], // Urgent vibration pattern
      data: {
        orderId: order.id,
        orderNumber: order.unique_order_id,
        customerName: order.customer_name,
        tableNumber: order.table_number,
        amount: order.total_amount,
        url: `/restaurant/orders?highlight=${order.id}`,
        type: 'paid-order',
        trackDismissal: true
      },
      actions: [
        {
          action: 'view',
          title: '👀 View Order',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: '✖️ Later',
          icon: '/favicon.ico'
        }
      ]
    });
  }

  // Test notification for Android
  public async showTestNotification(): Promise<void> {
    const testOrder = {
      id: 'test-android-' + Date.now(),
      unique_order_id: 'TEST' + Math.floor(Math.random() * 1000),
      customer_name: 'Test Customer',
      table_number: '5',
      total_amount: 599.99
    };

    await this.showOrderNotification(testOrder);
  }

  // Show generic Android browser notification
  public async showGenericNotification(title: string, message: string, options?: Partial<AndroidNotificationOptions>): Promise<void> {
    await this.showAndroidBrowserNotification({
      title,
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: false,
      vibrate: [200, 100, 200],
      ...options
    });
  }

  public cleanup(): void {
    this.notificationQueue = [];
    
    if (navigator.serviceWorker) {
      navigator.serviceWorker.removeEventListener('message', this.handleServiceWorkerMessage);
    }
  }
}

// Export singleton instance
export const androidBrowserNotificationManager = AndroidBrowserNotificationManager.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    androidBrowserNotificationManager.cleanup();
  });
}