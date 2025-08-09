// Simple service worker for notifications
// This helps resolve "Illegal constructor" errors on some browsers

const CACHE_NAME = 'servenowpay-notifications-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
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
  // Notification closed
});

// Handle push events (for future use)
self.addEventListener('push', (event) => {
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