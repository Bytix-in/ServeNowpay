// Enhanced cross-platform notification system for restaurant orders
// Addresses specific issues with Android, iOS, Mac, and mobile browsers

export interface OrderNotificationData {
  id: string;
  unique_order_id: string;
  customer_name: string;
  table_number: string;
  total_amount: number;
}

export class CrossPlatformNotificationManager {
  private static instance: CrossPlatformNotificationManager;
  private permission: NotificationPermission = 'default';
  private audioContext: AudioContext | null = null;
  private isAudioInitialized = false;
  private notificationQueue: OrderNotificationData[] = [];
  private isProcessingQueue = false;
  private deviceInfo: any = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeManager();
    }
  }

  public static getInstance(): CrossPlatformNotificationManager {
    if (!CrossPlatformNotificationManager.instance) {
      CrossPlatformNotificationManager.instance = new CrossPlatformNotificationManager();
    }
    return CrossPlatformNotificationManager.instance;
  }

  private async initializeManager() {
    this.deviceInfo = this.detectDevice();
    console.log('🔧 Initializing notifications for:', this.deviceInfo);

    // Check current permission
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }

    // Initialize audio on first user interaction
    this.setupAudioInitialization();
  }

  private detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform?.toLowerCase() || '';
    
    return {
      isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
      isAndroid: /android/i.test(userAgent),
      isIOS: /iphone|ipad|ipod/i.test(userAgent),
      isWindows: /windows/i.test(userAgent) || /win32|win64/i.test(platform),
      isMac: /macintosh|mac os x/i.test(userAgent) || /mac/i.test(platform),
      isSafari: /safari/i.test(userAgent) && !/chrome/i.test(userAgent),
      isChrome: /chrome/i.test(userAgent),
      isFirefox: /firefox/i.test(userAgent),
      isEdge: /edge/i.test(userAgent),
      userAgent,
      platform
    };
  }

  private setupAudioInitialization() {
    const initAudio = () => {
      if (!this.isAudioInitialized) {
        this.initializeAudioContext();
        this.isAudioInitialized = true;
      }
    };

    // Initialize on various user interactions
    ['click', 'touchstart', 'keydown', 'mousedown'].forEach(event => {
      document.addEventListener(event, initAudio, { once: true, passive: true });
    });
  }

  private initializeAudioContext() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        this.audioContext = new AudioContext();
        console.log('🔊 Audio context initialized');
      }
    } catch (error) {
      console.log('⚠️ Audio context initialization failed:', error);
    }
  }

  // Enhanced permission request with platform-specific handling
  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('❌ Notifications not supported on this browser');
      return 'denied';
    }

    try {
      // For iOS Safari, we need to request permission differently
      if (this.deviceInfo?.isIOS && this.deviceInfo?.isSafari) {
        console.log('📱 Requesting iOS Safari notification permission');
        
        // iOS Safari requires permission to be requested from a user gesture
        if (Notification.permission === 'default') {
          this.permission = await Notification.requestPermission();
        } else {
          this.permission = Notification.permission;
        }
      }
      // For Android Chrome and other browsers
      else {
        console.log('🤖 Requesting standard notification permission');
        
        if (Notification.requestPermission) {
          this.permission = await Notification.requestPermission();
        } else if ((Notification as any).requestPermission) {
          // Legacy callback-based API
          this.permission = await new Promise((resolve) => {
            (Notification as any).requestPermission(resolve);
          });
        }
      }

      console.log('🔔 Notification permission result:', this.permission);
      return this.permission;
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return 'denied';
    }
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for standard Notification API
    if ('Notification' in window) {
      console.log('✅ Standard Notification API supported');
      return true;
    }
    
    // Check for webkit notifications (older Safari)
    if ('webkitNotifications' in window) {
      console.log('✅ WebKit notifications supported');
      return true;
    }
    
    console.log('❌ Notifications not supported');
    return false;
  }

  public isPermitted(): boolean {
    const permitted = this.permission === 'granted';
    console.log('🔐 Notification permission status:', this.permission, permitted ? '✅' : '❌');
    return permitted;
  }

  public getPermission(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
    return this.permission;
  }

  // Enhanced notification display with platform-specific optimizations
  public async showOrderNotification(order: OrderNotificationData): Promise<void> {
    console.log('🔔 Attempting to show notification for order:', order.unique_order_id);

    // Add to queue for processing
    this.notificationQueue.push(order);
    
    if (!this.isProcessingQueue) {
      await this.processNotificationQueue();
    }
  }

  private async processNotificationQueue(): Promise<void> {
    if (this.isProcessingQueue || this.notificationQueue.length === 0) return;

    this.isProcessingQueue = true;
    console.log('📋 Processing notification queue, items:', this.notificationQueue.length);

    try {
      while (this.notificationQueue.length > 0) {
        const order = this.notificationQueue.shift();
        if (order) {
          await this.displaySingleNotification(order);
          // Small delay between notifications
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  private async displaySingleNotification(order: OrderNotificationData): Promise<void> {
    if (!this.isSupported()) {
      console.log('❌ Notifications not supported, showing fallback');
      this.showFallbackAlert(order);
      return;
    }

    if (!this.isPermitted()) {
      console.log('❌ Notification permission not granted, requesting...');
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.log('❌ Permission denied, showing fallback');
        this.showFallbackAlert(order);
        return;
      }
    }

    try {
      const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
      
      // Platform-specific notification content
      const title = this.deviceInfo?.isMobile 
        ? '💰 NEW PAID ORDER!' 
        : '💰 NEW PAID ORDER RECEIVED!';
        
      const body = this.deviceInfo?.isMobile
        ? `Order #${order.unique_order_id}\n${order.customer_name}\nTable ${order.table_number} - ${formatCurrency(order.total_amount)}`
        : `Payment confirmed! Order #${order.unique_order_id} from ${order.customer_name} at Table ${order.table_number} for ${formatCurrency(order.total_amount)}`;

      // Enhanced notification options
      const notificationOptions: NotificationOptions = {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `paid-order-${order.id}`,
        requireInteraction: this.deviceInfo?.isMobile || false,
        silent: false,
        timestamp: Date.now(),
        // Mobile-specific enhancements
        vibrate: this.deviceInfo?.isMobile ? [200, 100, 200, 100, 400] : undefined,
        // Platform-specific data
        data: {
          orderId: order.id,
          orderNumber: order.unique_order_id,
          url: '/restaurant/orders'
        }
      };

      console.log('📱 Creating notification with options:', notificationOptions);

      // Create the notification
      const notification = new Notification(title, notificationOptions);

      // Handle notification events
      notification.onclick = () => {
        console.log('👆 Notification clicked');
        window.focus();
        
        // Navigate to orders page
        if (window.location.pathname !== '/restaurant/orders') {
          window.location.href = '/restaurant/orders';
        }
        
        notification.close();
      };

      notification.onshow = () => {
        console.log('👁️ Notification shown');
      };

      notification.onerror = (error) => {
        console.error('❌ Notification error:', error);
      };

      // Auto-close after 15 seconds
      setTimeout(() => {
        notification.close();
      }, 15000);

      // Play notification sound
      await this.playNotificationSound();

      console.log('✅ Notification displayed successfully');

    } catch (error) {
      console.error('❌ Failed to display notification:', error);
      this.showFallbackAlert(order);
    }
  }

  // Enhanced cross-platform audio with better mobile support
  private async playNotificationSound(): Promise<void> {
    console.log('🔊 Attempting to play notification sound');

    if (!this.isAudioInitialized) {
      console.log('⚠️ Audio not initialized, skipping sound');
      return;
    }

    try {
      // Try Web Audio API first
      if (this.audioContext && this.audioContext.state !== 'closed') {
        await this.playWebAudioChime();
        console.log('✅ Web Audio sound played');
        return;
      }
    } catch (error) {
      console.log('⚠️ Web Audio failed, trying HTML Audio:', error);
    }

    try {
      // Fallback to HTML Audio
      await this.playHTMLAudio();
      console.log('✅ HTML Audio sound played');
    } catch (error) {
      console.log('⚠️ HTML Audio failed, trying vibration:', error);
      this.tryVibration();
    }
  }

  private async playWebAudioChime(): Promise<void> {
    if (!this.audioContext) throw new Error('No audio context');

    // Resume context if suspended (required by mobile browsers)
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
  }

  private async playHTMLAudio(): Promise<void> {
    // Create a simple beep using data URI
    const audio = new Audio();
    audio.volume = 0.7;
    
    // Simple beep sound data URI
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    
    await audio.play();
  }

  private tryVibration(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 400]);
      console.log('📳 Vibration triggered');
    }
  }

  // Fallback visual alert for unsupported browsers
  private showFallbackAlert(order: OrderNotificationData): void {
    console.log('🚨 Showing fallback alert for order:', order.unique_order_id);

    const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
    
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      z-index: 10000;
      max-width: 350px;
      font-family: system-ui, -apple-system, sans-serif;
      border: 2px solid #10b981;
      animation: slideInBounce 0.5s ease-out;
    `;
    
    alertDiv.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <div style="font-size: 24px; margin-right: 8px;">💰</div>
        <div style="font-weight: bold; font-size: 16px;">NEW PAID ORDER!</div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          margin-left: auto;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 20px;
          opacity: 0.7;
          padding: 0;
          width: 24px;
          height: 24px;
        ">×</button>
      </div>
      <div style="font-size: 14px; line-height: 1.4; opacity: 0.9;">
        <div><strong>Order #${order.unique_order_id}</strong></div>
        <div>${order.customer_name} - Table ${order.table_number}</div>
        <div style="color: #10b981; font-weight: bold; margin-top: 4px;">${formatCurrency(order.total_amount)}</div>
      </div>
      <div style="margin-top: 12px;">
        <button onclick="window.location.href='/restaurant/orders'" style="
          background: #10b981;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
        ">View Orders</button>
      </div>
    `;

    // Add animation styles
    if (!document.querySelector('#fallback-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'fallback-notification-styles';
      style.textContent = `
        @keyframes slideInBounce {
          0% { transform: translateX(100%) scale(0.8); opacity: 0; }
          60% { transform: translateX(-10px) scale(1.05); opacity: 1; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(alertDiv);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (alertDiv.parentElement) {
        alertDiv.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => alertDiv.remove(), 300);
      }
    }, 10000);

    // Try to play a simple alert sound
    try {
      const audio = new Audio();
      audio.volume = 0.5;
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      audio.play().catch(() => {});
    } catch (error) {
      // Silent fail for audio
    }
  }

  // Test notification with device detection
  public async showTestNotification(): Promise<void> {
    console.log('🧪 Showing test notification');

    const testOrder: OrderNotificationData = {
      id: 'test-' + Date.now(),
      unique_order_id: 'TEST123',
      customer_name: 'Test Customer',
      table_number: '1',
      total_amount: 299.99
    };

    await this.showOrderNotification(testOrder);
  }

  // Diagnostic information
  public getDiagnosticInfo(): any {
    return {
      deviceInfo: this.deviceInfo,
      notificationSupported: this.isSupported(),
      notificationPermission: this.getPermission(),
      audioInitialized: this.isAudioInitialized,
      audioContextState: this.audioContext?.state || 'not-created',
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      queueLength: this.notificationQueue.length,
      isProcessingQueue: this.isProcessingQueue
    };
  }

  // Cleanup method
  public cleanup(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.notificationQueue = [];
    this.isProcessingQueue = false;
    this.isAudioInitialized = false;
  }
}

// Export singleton instance
export const crossPlatformNotificationManager = CrossPlatformNotificationManager.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    crossPlatformNotificationManager.cleanup();
  });
}