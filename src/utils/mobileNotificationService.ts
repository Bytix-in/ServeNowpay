// Comprehensive mobile-compatible notification service
// Handles audio autoplay restrictions, mobile browsers, and fallbacks

interface NotificationData {
  id: string;
  unique_order_id: string;
  customer_name: string;
  table_number: string;
  total_amount: number;
}

interface NotificationState {
  audioContext: AudioContext | null;
  audioInitialized: boolean;
  userInteracted: boolean;
  notificationPermission: NotificationPermission;
  popupCallback: ((data: NotificationData) => void) | null;
}

class MobileNotificationService {
  private state: NotificationState = {
    audioContext: null,
    audioInitialized: false,
    userInteracted: false,
    notificationPermission: 'default',
    popupCallback: null
  };

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    // Check notification permission
    if ('Notification' in window) {
      this.state.notificationPermission = Notification.permission;
    }

    // Listen for user interactions to enable audio
    const enableAudio = () => {
      if (!this.state.userInteracted) {
        this.initializeAudioContext();
      }
    };

    // Add listeners for various interaction types
    ['click', 'touchstart', 'keydown'].forEach(event => {
      document.addEventListener(event, enableAudio, { once: true, passive: true });
    });
  }

  private async initializeAudioContext(): Promise<boolean> {
    if (this.state.audioInitialized) return true;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return false;

      this.state.audioContext = new AudioContext();
      
      // Resume if suspended (common on mobile)
      if (this.state.audioContext.state === 'suspended') {
        await this.state.audioContext.resume();
      }

      this.state.audioInitialized = true;
      this.state.userInteracted = true;
      
      console.log('Audio context initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      // Initialize audio context
      const audioEnabled = await this.initializeAudioContext();
      
      // Request notification permission
      let notificationEnabled = false;
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        this.state.notificationPermission = permission;
        notificationEnabled = permission === 'granted';
      }

      return audioEnabled && notificationEnabled;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  private async playNotificationSound(): Promise<boolean> {
    if (!this.state.audioContext || !this.state.userInteracted) {
      console.warn('Audio not available - no user interaction');
      return false;
    }

    try {
      const context = this.state.audioContext;
      
      // Resume if suspended
      if (context.state === 'suspended') {
        await context.resume();
      }

      // Create notification sound
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      const now = context.currentTime;
      
      // Create urgent but pleasant notification sound
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
      return false;
    }
  }

  private async showBrowserNotification(data: NotificationData): Promise<boolean> {
    if (!('Notification' in window) || this.state.notificationPermission !== 'granted') {
      return false;
    }

    try {
      const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
      
      const notification = new Notification('💰 NEW PAID ORDER!', {
        body: `Order #${data.unique_order_id}\n${data.customer_name} - Table ${data.table_number}\n${formatCurrency(data.total_amount)}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true,
        silent: false,
        vibrate: [200, 100, 200, 100, 400],
        tag: `paid-order-${data.id}`
      });

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
        // Navigate to orders if not already there
        if (window.location.pathname !== '/restaurant/orders') {
          window.location.href = '/restaurant/orders';
        }
      };

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);

      return true;
    } catch (error) {
      console.error('Failed to show browser notification:', error);
      return false;
    }
  }

  private triggerVibration(): boolean {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 400]);
        return true;
      } catch (error) {
        console.error('Vibration failed:', error);
      }
    }
    return false;
  }

  private showPopupNotification(data: NotificationData): boolean {
    if (this.state.popupCallback) {
      try {
        this.state.popupCallback(data);
        return true;
      } catch (error) {
        console.error('Popup notification failed:', error);
      }
    }
    return false;
  }

  // Register popup callback for fallback notifications
  setPopupCallback(callback: (data: NotificationData) => void) {
    this.state.popupCallback = callback;
  }

  // Main notification method
  async showPaidOrderNotification(data: NotificationData): Promise<void> {
    console.log('Showing paid order notification:', data.unique_order_id);

    // Try multiple notification methods for maximum compatibility
    const results = await Promise.allSettled([
      this.playNotificationSound(),
      this.showBrowserNotification(data),
      Promise.resolve(this.triggerVibration()),
      Promise.resolve(this.showPopupNotification(data))
    ]);

    // Log results for debugging
    const [soundResult, notificationResult, vibrationResult, popupResult] = results;
    
    console.log('Notification results:', {
      sound: soundResult.status === 'fulfilled' ? soundResult.value : false,
      notification: notificationResult.status === 'fulfilled' ? notificationResult.value : false,
      vibration: vibrationResult.status === 'fulfilled' ? vibrationResult.value : false,
      popup: popupResult.status === 'fulfilled' ? popupResult.value : false
    });

    // If no methods worked, at least try to focus the window
    const anyWorked = results.some(result => 
      result.status === 'fulfilled' && result.value === true
    );
    
    if (!anyWorked) {
      console.warn('All notification methods failed, focusing window');
      window.focus();
    }
  }

  // Test notification
  async showTestNotification(): Promise<void> {
    const testData: NotificationData = {
      id: 'test',
      unique_order_id: 'TEST123',
      customer_name: 'Test Customer',
      table_number: '5',
      total_amount: 299.99
    };

    await this.showPaidOrderNotification(testData);
  }

  // Check if notifications are properly enabled
  isFullyEnabled(): boolean {
    return (
      this.state.userInteracted &&
      this.state.audioInitialized &&
      this.state.notificationPermission === 'granted'
    );
  }

  // Get current state for UI
  getState() {
    return {
      audioEnabled: this.state.audioInitialized && this.state.userInteracted,
      notificationPermission: this.state.notificationPermission,
      fullyEnabled: this.isFullyEnabled()
    };
  }
}

// Export singleton instance
export const mobileNotificationService = new MobileNotificationService();