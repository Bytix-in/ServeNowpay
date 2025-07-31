// Notification utility functions for restaurant orders

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

export class OrderNotificationManager {
  private static instance: OrderNotificationManager;
  private permission: NotificationPermission = 'default';

  private constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public static getInstance(): OrderNotificationManager {
    if (!OrderNotificationManager.instance) {
      OrderNotificationManager.instance = new OrderNotificationManager();
    }
    return OrderNotificationManager.instance;
  }

  // Request notification permission
  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = await Notification.requestPermission();
      return this.permission;
    }
    return 'denied';
  }

  // Check if notifications are supported and permitted
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public isPermitted(): boolean {
    return this.permission === 'granted';
  }

  public getPermission(): NotificationPermission {
    return this.permission;
  }

  // Show a notification
  public showNotification(options: NotificationOptions): Notification | null {
    if (!this.isSupported() || !this.isPermitted()) {
      console.warn('Notifications not supported or not permitted');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        timestamp: options.timestamp || Date.now()
      });

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  // Show order notification with predefined format
  public showOrderNotification(order: {
    id: string;
    unique_order_id: string;
    customer_name: string;
    table_number: string;
    total_amount: number;
  }): Notification | null {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount);
    };

    return this.showNotification({
      title: '💳 New Paid Order! 🔔',
      body: `URGENT: Payment confirmed! Order #${order.unique_order_id} from ${order.customer_name} at Table ${order.table_number} for ${formatCurrency(order.total_amount)}. Start preparing now!`,
      tag: `order-${order.id}`,
      requireInteraction: true,
      silent: false
    });
  }

  // Play notification sound
  public playNotificationSound(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a pleasant notification chime
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a pleasant two-tone chime
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.15);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.6);
    } catch (error) {
      // Audio not supported, fail silently
    }
  }

  // Show test notification
  public showTestNotification(): Notification | null {
    return this.showNotification({
      title: '🎉 Test Notification',
      body: 'Notifications are working perfectly! You will receive alerts for new orders.',
      tag: 'test-notification',
      requireInteraction: false
    });
  }
}

// Export singleton instance
export const notificationManager = OrderNotificationManager.getInstance();