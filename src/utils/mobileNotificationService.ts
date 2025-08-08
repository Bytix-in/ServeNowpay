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
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.initializeService();
    }
  }

  private initializeService() {
    // Check notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.state.notificationPermission = Notification.permission;
      console.log('Initialized with notification permission:', this.state.notificationPermission);
    }

    // Listen for user interactions to enable audio
    const enableAudio = () => {
      if (!this.state.userInteracted) {
        console.log('User interaction detected, initializing audio...');
        this.initializeAudioContext();
      }
    };

    // Add listeners for various interaction types (client-side only)
    if (typeof document !== 'undefined') {
      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, enableAudio, { once: true, passive: true });
      });
    }
  }

  private async initializeAudioContext(): Promise<boolean> {
    if (this.state.audioInitialized || typeof window === 'undefined') return true;

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
    if (typeof window === 'undefined') return false;
    
    try {
      console.log('Requesting permissions...');
      
      // Initialize audio context
      const audioEnabled = await this.initializeAudioContext();
      console.log('Audio enabled:', audioEnabled);
      
      // Request notification permission
      let notificationEnabled = false;
      if ('Notification' in window) {
        console.log('Current notification permission:', Notification.permission);
        
        if (Notification.permission === 'default') {
          console.log('Requesting notification permission...');
          const permission = await Notification.requestPermission();
          console.log('Permission result:', permission);
          this.state.notificationPermission = permission;
          notificationEnabled = permission === 'granted';
        } else {
          // Permission already granted or denied
          this.state.notificationPermission = Notification.permission;
          notificationEnabled = Notification.permission === 'granted';
        }
        
        console.log('Notification enabled:', notificationEnabled);
      }

      const result = audioEnabled && notificationEnabled;
      console.log('Final permissions result:', { audioEnabled, notificationEnabled, result });
      
      return result;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  private async playNotificationSound(): Promise<boolean> {
    if (typeof window === 'undefined' || !this.state.audioContext || !this.state.userInteracted) {
      console.warn('Audio not available - no user interaction or server-side');
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
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('Browser notifications not supported');
      return false;
    }

    // Check current permission
    const currentPermission = Notification.permission;
    console.log('Current notification permission:', currentPermission);
    console.log('Stored permission state:', this.state.notificationPermission);

    if (currentPermission !== 'granted') {
      console.log('Notification permission not granted, current:', currentPermission);
      return false;
    }

    try {
      const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
      
      console.log('Creating browser notification for order:', data.unique_order_id);
      
      const notification = new Notification('💰 NEW PAID ORDER!', {
        body: `Order #${data.unique_order_id}\n${data.customer_name} - Table ${data.table_number}\n${formatCurrency(data.total_amount)}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true,
        silent: false,
        vibrate: [200, 100, 200, 100, 400],
        tag: `paid-order-${data.id}`
      });

      console.log('Browser notification created successfully');

      // Handle click
      notification.onclick = () => {
        console.log('Notification clicked');
        window.focus();
        notification.close();
        // Navigate to orders if not already there
        if (window.location.pathname !== '/restaurant/orders') {
          window.location.href = '/restaurant/orders';
        }
      };

      // Handle error
      notification.onerror = (error) => {
        console.error('Notification error:', error);
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        console.log('Auto-closing notification');
        notification.close();
      }, 10000);

      return true;
    } catch (error) {
      console.error('Failed to show browser notification:', error);
      return false;
    }
  }

  private triggerVibration(): boolean {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
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
    
    if (!anyWorked && typeof window !== 'undefined') {
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

  // Refresh permission state from browser
  refreshPermissionState() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const currentPermission = Notification.permission;
      if (this.state.notificationPermission !== currentPermission) {
        console.log('Permission state changed:', this.state.notificationPermission, '->', currentPermission);
        this.state.notificationPermission = currentPermission;
      }
    }
  }

  // Get current state for UI
  getState() {
    // Refresh permission state before returning
    this.refreshPermissionState();
    
    return {
      audioEnabled: this.state.audioInitialized && this.state.userInteracted,
      notificationPermission: this.state.notificationPermission,
      fullyEnabled: this.isFullyEnabled()
    };
  }
}

// Export singleton instance
export const mobileNotificationService = new MobileNotificationService();