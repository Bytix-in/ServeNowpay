// Production-ready notification service for paid orders
// Optimized for performance, reliability, and cross-platform compatibility

export interface PaidOrderNotification {
  id: string;
  unique_order_id: string;
  customer_name: string;
  table_number: string;
  total_amount: number;
}

class ProductionNotificationService {
  private static instance: ProductionNotificationService;
  private permission: NotificationPermission = 'default';
  private isInitialized = false;
  private audioContext: AudioContext | null = null;
  private notificationQueue: PaidOrderNotification[] = [];
  private isProcessingQueue = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeService();
    }
  }

  public static getInstance(): ProductionNotificationService {
    if (!ProductionNotificationService.instance) {
      ProductionNotificationService.instance = new ProductionNotificationService();
    }
    return ProductionNotificationService.instance;
  }

  // Initialize the service with minimal overhead
  private async initializeService() {
    if (this.isInitialized) return;

    try {
      // Check current permission status
      if ('Notification' in window) {
        this.permission = Notification.permission;
      }

      // Pre-initialize audio context on user interaction
      document.addEventListener('click', this.initializeAudio, { once: true });
      document.addEventListener('keydown', this.initializeAudio, { once: true });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  // Lazy initialize audio context
  private initializeAudio = () => {
    if (!this.audioContext) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          this.audioContext = new AudioContext();
        }
      } catch (error) {
        console.log('Audio context initialization failed, using fallback audio');
      }
    }
  };

  // Request notification permission with user-friendly messaging
  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      if (this.permission === 'default') {
        this.permission = await Notification.requestPermission();
      }
      return this.permission;
    } catch (error) {
      console.error('Permission request failed:', error);
      return 'denied';
    }
  }

  // Check if notifications are supported and permitted
  public isReady(): boolean {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      this.permission === 'granted'
    );
  }

  public getPermission(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
    return this.permission;
  }

  // Show notification for paid orders with queue management
  public async showPaidOrderNotification(order: PaidOrderNotification): Promise<void> {
    // Add to queue for processing
    this.notificationQueue.push(order);
    
    if (!this.isProcessingQueue) {
      this.processNotificationQueue();
    }
  }

  // Process notification queue to prevent spam
  private async processNotificationQueue(): Promise<void> {
    if (this.isProcessingQueue || this.notificationQueue.length === 0) return;

    this.isProcessingQueue = true;

    try {
      while (this.notificationQueue.length > 0) {
        const order = this.notificationQueue.shift();
        if (order) {
          await this.displayNotification(order);
          // Small delay between notifications to prevent overwhelming
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // Display individual notification
  private async displayNotification(order: PaidOrderNotification): Promise<void> {
    if (!this.isReady()) {
      console.log('Notifications not ready, skipping notification for order:', order.unique_order_id);
      return;
    }

    try {
      const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
      
      // Create notification with production-optimized content
      const notification = new Notification('💰 NEW PAID ORDER!', {
        body: `Order #${order.unique_order_id}\n${order.customer_name} - Table ${order.table_number}\n${formatCurrency(order.total_amount)}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `paid-order-${order.id}`, // Prevents duplicate notifications
        requireInteraction: true, // Keeps notification visible until user interacts
        silent: false,
        timestamp: Date.now(),
        // Add vibration for mobile devices
        vibrate: [200, 100, 200, 100, 400]
      });

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navigate to orders page if not already there
        if (window.location.pathname !== '/restaurant/orders') {
          window.location.href = '/restaurant/orders';
        }
      };

      // Auto-close after 15 seconds
      setTimeout(() => {
        notification.close();
      }, 15000);

      // Play notification sound
      await this.playNotificationSound();

    } catch (error) {
      console.error('Failed to display notification:', error);
    }
  }

  // Optimized notification sound for production
  private async playNotificationSound(): Promise<void> {
    try {
      // Try Web Audio API first (best quality)
      if (this.audioContext) {
        await this.playWebAudioChime();
      } else {
        // Fallback to HTML Audio
        await this.playHTMLAudio();
      }
    } catch (error) {
      console.log('Audio playback failed:', error);
      // Try vibration as last resort on mobile
      this.tryVibration();
    }
  }

  // Web Audio API chime (production quality)
  private async playWebAudioChime(): Promise<void> {
    if (!this.audioContext) return;

    try {
      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Create urgent notification chime
      const now = this.audioContext.currentTime;
      oscillator.frequency.setValueAtTime(1000, now);
      oscillator.frequency.setValueAtTime(1200, now + 0.1);
      oscillator.frequency.setValueAtTime(800, now + 0.2);
      oscillator.frequency.setValueAtTime(1000, now + 0.3);
      
      gainNode.gain.setValueAtTime(0.6, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      
      oscillator.start(now);
      oscillator.stop(now + 0.8);
      
    } catch (error) {
      throw new Error('Web Audio playback failed');
    }
  }

  // HTML Audio fallback
  private async playHTMLAudio(): Promise<void> {
    const audio = new Audio();
    audio.volume = 0.8;
    
    // Use a simple data URI beep
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    
    await audio.play();
  }

  // Mobile vibration fallback
  private tryVibration(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  }

  // Test notification for setup
  public async showTestNotification(): Promise<void> {
    if (!this.isReady()) {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        alert('Please enable notifications to receive order alerts.');
        return;
      }
    }

    const testOrder: PaidOrderNotification = {
      id: 'test',
      unique_order_id: 'TEST123',
      customer_name: 'Test Customer',
      table_number: '1',
      total_amount: 299.99
    };

    await this.showPaidOrderNotification(testOrder);
  }

  // Cleanup method
  public cleanup(): void {
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.notificationQueue = [];
    this.isProcessingQueue = false;
  }
}

// Export singleton instance
export const productionNotificationService = ProductionNotificationService.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    productionNotificationService.cleanup();
  });
}