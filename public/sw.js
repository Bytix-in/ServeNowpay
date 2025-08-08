// Simple service worker for notifications
// This helps resolve "Illegal constructor" errors on some browsers

const CACHE_NAME = 'servenowpay-notifications-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  // Focus or open the app window
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Check if there's already a window open
      for (const client of clients) {
        if (client.url.includes('/restaurant') && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow('/restaurant/orders');
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});

// Handle push events (for future use)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New order received',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag || 'order-notification',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 400]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'ServeNowPay', options)
    );
  }
});

console.log('Service worker loaded successfully');