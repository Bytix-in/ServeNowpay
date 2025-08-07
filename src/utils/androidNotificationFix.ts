// Android-specific notification fixes for sound and browser notifications
// Addresses Chrome on Android specific issues

export class AndroidNotificationManager {
  private static instance: AndroidNotificationManager;
  private audioContext: AudioContext | null = null;
  private isAudioUnlocked = false;
  private audioBuffer: AudioBuffer | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAndroidSupport();
    }
  }

  public static getInstance(): AndroidNotificationManager {
    if (!AndroidNotificationManager.instance) {
      AndroidNotificationManager.instance = new AndroidNotificationManager();
    }
    return AndroidNotificationManager.instance;
  }

  private async initializeAndroidSupport() {
    console.log('🤖 Initializing Android notification support');
    
    try {
      // Register service worker for better Android notification support
      await this.registerServiceWorker();
      console.log('✅ Service worker registration completed');
    } catch (error) {
      console.log('⚠️ Service worker registration failed:', error);
    }
    
    try {
      // Setup audio unlock for Android
      this.setupAudioUnlock();
      console.log('✅ Audio unlock setup completed');
    } catch (error) {
      console.log('⚠️ Audio unlock setup failed:', error);
    }
    
    try {
      // Pre-load notification sound
      await this.preloadNotificationSound();
      console.log('✅ Notification sound preload completed');
    } catch (error) {
      console.log('⚠️ Sound preload failed:', error);
    }
  }

  private async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('⚠️ Service Worker not supported in this browser');
      return;
    }

    try {
        // Create a more robust service worker for Android
        const swCode = `
          console.log('🔧 Service Worker: Starting for Android notifications');
          
          self.addEventListener('notificationclick', function(event) {
            console.log('🔔 Service Worker: Notification clicked');
            event.notification.close();
            
            event.waitUntil(
              clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
                console.log('👥 Service Worker: Found clients:', clientList.length);
                
                // Try to focus existing window
                for (let i = 0; i < clientList.length; i++) {
                  const client = clientList[i];
                  if (client.url.includes('/restaurant/orders')) {
                    console.log('🎯 Service Worker: Focusing existing orders page');
                    return client.focus();
                  }
                }
                
                // Focus any existing window
                if (clientList.length > 0) {
                  console.log('🎯 Service Worker: Focusing existing window');
                  const client = clientList[0];
                  client.postMessage({ action: 'navigate', url: '/restaurant/orders' });
                  return client.focus();
                }
                
                // Open new window
                console.log('🆕 Service Worker: Opening new window');
                return clients.openWindow('/restaurant/orders');
              })
            );
          });

          self.addEventListener('notificationclose', function(event) {
            console.log('❌ Service Worker: Notification closed');
          });

          // Handle push events (for future PWA support)
          self.addEventListener('push', function(event) {
            console.log('📨 Service Worker: Push received');
            if (event.data) {
              const data = event.data.json();
              event.waitUntil(
                self.registration.showNotification(data.title, {
                  body: data.body,
                  icon: data.icon || '/favicon.ico',
                  badge: '/favicon.ico',
                  vibrate: [200, 100, 200, 100, 400],
                  requireInteraction: true,
                  data: data.data
                })
              );
            }
          });
        `;
        
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        
        this.serviceWorkerRegistration = await navigator.serviceWorker.register(swUrl, {
          scope: '/'
        });
        
        console.log('✅ Service Worker registered for Android notifications');
        
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        
      } catch (error) {
        console.log('⚠️ Service Worker registration failed:', error);
      }
    }

  private setupAudioUnlock() {
    // Android Chrome requires user interaction to unlock audio
    const unlockAudio = async () => {
      if (this.isAudioUnlocked) return;
      
      try {
        console.log('🔓 Unlocking audio for Android');
        
        // Create audio context
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext && !this.audioContext) {
          this.audioContext = new AudioContext();
        }
        
        if (this.audioContext) {
          // Resume audio context if suspended
          if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
          }
          
          // Play a silent sound to unlock audio
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
          
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.1);
          
          this.isAudioUnlocked = true;
          console.log('✅ Audio unlocked for Android');
        }
        
      } catch (error) {
        console.log('⚠️ Audio unlock failed:', error);
      }
    };

    // Listen for various user interactions
    const events = ['touchstart', 'touchend', 'mousedown', 'keydown', 'click'];
    events.forEach(event => {
      document.addEventListener(event, unlockAudio, { once: true, passive: true });
    });
  }

  private async preloadNotificationSound() {
    try {
      // Initialize audio context if not already done
      if (!this.audioContext) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          this.audioContext = new AudioContext();
        } else {
          console.log('⚠️ Audio Context not supported');
          return;
        }
      }

      if (!this.audioContext) return;
      // Create a notification sound buffer
      const sampleRate = this.audioContext.sampleRate;
      const duration = 0.5; // 500ms
      const frameCount = sampleRate * duration;
      
      this.audioBuffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
      const channelData = this.audioBuffer.getChannelData(0);
      
      // Generate a pleasant notification chime
      for (let i = 0; i < frameCount; i++) {
        const t = i / sampleRate;
        // Multi-tone chime
        const freq1 = 800 * Math.exp(-t * 2); // Decaying high tone
        const freq2 = 400 * Math.exp(-t * 1); // Decaying low tone
        channelData[i] = (
          Math.sin(2 * Math.PI * freq1 * t) * 0.3 +
          Math.sin(2 * Math.PI * freq2 * t) * 0.2
        ) * Math.exp(-t * 3); // Overall decay
      }
      
      console.log('🎵 Notification sound preloaded for Android');
      
    } catch (error) {
      console.log('⚠️ Sound preload failed:', error);
    }
  }

  public async showAndroidNotification(order: {
    id: string;
    unique_order_id: string;
    customer_name: string;
    table_number: string;
    total_amount: number;
  }): Promise<void> {
    console.log('🤖 Showing Android notification for order:', order.unique_order_id);

    const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
    
    const title = '💰 NEW PAID ORDER!';
    const body = `Order #${order.unique_order_id}\n${order.customer_name} - Table ${order.table_number}\n${formatCurrency(order.total_amount)}`;

    try {
      // Check if we should use service worker or regular notifications
      let useServiceWorker = false;
      
      if (this.serviceWorkerRegistration && 'showNotification' in this.serviceWorkerRegistration) {
        try {
          // Ensure service worker is ready
          await navigator.serviceWorker.ready;
          useServiceWorker = true;
          console.log('📱 Service Worker is ready, using SW notification');
        } catch (swError) {
          console.log('⚠️ Service Worker not ready:', swError);
          useServiceWorker = false;
        }
      }

      if (useServiceWorker) {
        try {
          await this.serviceWorkerRegistration!.showNotification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `paid-order-${order.id}`,
            requireInteraction: true,
            silent: false, // Let Android handle the sound
            vibrate: [300, 100, 300, 100, 300], // Strong vibration pattern
            timestamp: Date.now(),
            data: {
              orderId: order.id,
              orderNumber: order.unique_order_id,
              url: '/restaurant/orders'
            },
            // Android-specific options
            actions: [
              {
                action: 'view',
                title: '👀 View Order',
                icon: '/favicon.ico'
              }
            ]
          });
          
          console.log('✅ Service Worker notification shown');
          
        } catch (swError) {
          console.log('❌ Service Worker notification failed:', swError);
          useServiceWorker = false;
        }
      }
      
      if (!useServiceWorker) {
        // Fallback to regular notification
        console.log('📱 Using regular notification API');
        
        try {
          const notification = new Notification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `paid-order-${order.id}`,
            requireInteraction: true,
            silent: false,
            vibrate: [300, 100, 300, 100, 300],
            timestamp: Date.now()
          });

          notification.onclick = () => {
            console.log('👆 Notification clicked');
            window.focus();
            if (window.location.pathname !== '/restaurant/orders') {
              window.location.href = '/restaurant/orders';
            }
            notification.close();
          };

          // Auto-close after 20 seconds (longer for mobile)
          setTimeout(() => notification.close(), 20000);
          
          console.log('✅ Regular notification shown');
          
        } catch (regularError) {
          console.log('❌ Regular notification failed:', regularError);
          throw regularError; // This will trigger the fallback alert
        }
      }

      // Play notification sound
      await this.playAndroidNotificationSound();
      
    } catch (error) {
      console.error('❌ Android notification failed:', error);
      // Show fallback alert
      this.showAndroidFallbackAlert(order);
    }
  }

  private async playAndroidNotificationSound(): Promise<void> {
    console.log('🔊 Playing Android notification sound');

    if (!this.isAudioUnlocked) {
      console.log('⚠️ Audio not unlocked, trying to unlock...');
      // Try to unlock audio one more time
      if (this.audioContext && this.audioContext.state === 'suspended') {
        try {
          await this.audioContext.resume();
          this.isAudioUnlocked = true;
        } catch (error) {
          console.log('⚠️ Could not unlock audio:', error);
          return;
        }
      }
    }

    try {
      // Method 1: Use preloaded audio buffer (best quality)
      if (this.audioContext && this.audioBuffer && this.isAudioUnlocked) {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = this.audioBuffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        gainNode.gain.setValueAtTime(0.8, this.audioContext.currentTime);
        source.start(0);
        
        console.log('✅ Played preloaded notification sound');
        return;
      }

      // Method 2: Generate sound on the fly
      if (this.audioContext && this.isAudioUnlocked) {
        await this.generateAndroidChime();
        console.log('✅ Generated notification chime');
        return;
      }

      // Method 3: HTML Audio fallback
      await this.playHTMLAudioForAndroid();
      console.log('✅ Played HTML audio');

    } catch (error) {
      console.log('⚠️ All audio methods failed:', error);
      // Try vibration as last resort
      this.tryAndroidVibration();
    }
  }

  private async generateAndroidChime(): Promise<void> {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Create a pleasant chime sequence
    const now = this.audioContext.currentTime;
    
    // Frequency sequence for a nice chime
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.setValueAtTime(1000, now + 0.1);
    oscillator.frequency.setValueAtTime(600, now + 0.2);
    oscillator.frequency.setValueAtTime(800, now + 0.3);
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.8, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    
    oscillator.start(now);
    oscillator.stop(now + 0.8);
  }

  private async playHTMLAudioForAndroid(): Promise<void> {
    // Create multiple short beeps for Android
    const frequencies = [800, 1000, 600];
    
    for (let i = 0; i < frequencies.length; i++) {
      setTimeout(async () => {
        try {
          const audio = new Audio();
          audio.volume = 0.8;
          
          // Generate a simple beep
          const duration = 0.2;
          const sampleRate = 44100;
          const samples = Math.floor(sampleRate * duration);
          const buffer = new ArrayBuffer(44 + samples * 2);
          const view = new DataView(buffer);
          
          // WAV header
          const writeString = (offset: number, string: string) => {
            for (let j = 0; j < string.length; j++) {
              view.setUint8(offset + j, string.charCodeAt(j));
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
          for (let k = 0; k < samples; k++) {
            const sample = Math.sin(2 * Math.PI * frequencies[i] * k / sampleRate) * 0.5 * 32767;
            view.setInt16(44 + k * 2, sample, true);
          }
          
          const blob = new Blob([buffer], { type: 'audio/wav' });
          audio.src = URL.createObjectURL(blob);
          
          await audio.play();
          
          // Clean up
          setTimeout(() => URL.revokeObjectURL(audio.src), 1000);
          
        } catch (error) {
          console.log('⚠️ HTML audio beep failed:', error);
        }
      }, i * 150);
    }
  }

  private tryAndroidVibration(): void {
    if ('vibrate' in navigator) {
      // Strong vibration pattern for Android
      navigator.vibrate([300, 100, 300, 100, 500, 100, 300]);
      console.log('📳 Android vibration triggered');
    }
  }

  private showAndroidFallbackAlert(order: any): void {
    console.log('🚨 Showing Android fallback alert');

    const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
    
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
      color: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      border: 2px solid #10b981;
      animation: androidSlideIn 0.5s ease-out;
    `;
    
    alertDiv.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <div style="font-size: 28px; margin-right: 12px;">💰</div>
        <div>
          <div style="font-weight: bold; font-size: 18px;">NEW PAID ORDER!</div>
          <div style="font-size: 14px; opacity: 0.8;">Tap to view details</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          margin-left: auto;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 24px;
          opacity: 0.7;
          padding: 4px;
        ">×</button>
      </div>
      <div style="font-size: 16px; line-height: 1.4;">
        <div><strong>Order #${order.unique_order_id}</strong></div>
        <div>${order.customer_name} - Table ${order.table_number}</div>
        <div style="color: #10b981; font-weight: bold; margin-top: 8px; font-size: 18px;">${formatCurrency(order.total_amount)}</div>
      </div>
      <div style="margin-top: 16px;">
        <button onclick="window.location.href='/restaurant/orders'" style="
          background: #10b981;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          width: 100%;
        ">View Order Details</button>
      </div>
    `;

    // Add animation styles
    if (!document.querySelector('#android-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'android-notification-styles';
      style.textContent = `
        @keyframes androidSlideIn {
          0% { transform: translateY(-100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(alertDiv);

    // Auto-remove after 15 seconds
    setTimeout(() => {
      if (alertDiv.parentElement) {
        alertDiv.style.animation = 'androidSlideIn 0.3s ease-in reverse';
        setTimeout(() => alertDiv.remove(), 300);
      }
    }, 15000);

    // Trigger vibration
    this.tryAndroidVibration();
  }

  public async testAndroidNotification(): Promise<void> {
    const testOrder = {
      id: 'test-android-' + Date.now(),
      unique_order_id: 'ANDROID123',
      customer_name: 'Android Test Customer',
      table_number: '5',
      total_amount: 599.99
    };

    await this.showAndroidNotification(testOrder);
  }

  public cleanup(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.isAudioUnlocked = false;
    this.audioBuffer = null;
  }
}

// Export singleton instance
export const androidNotificationManager = AndroidNotificationManager.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    androidNotificationManager.cleanup();
  });
}