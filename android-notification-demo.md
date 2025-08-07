# Android Browser Notifications Demo

## What are Android Browser Notifications?

Android Browser Notifications are the **native notifications** that appear in your Android notification panel (the one you see when you swipe down from the top of your screen). These are the same type of notifications you get from:

- WhatsApp Web
- Gmail
- Facebook
- YouTube
- Any other website when they send notifications

## Key Features

### 🎯 **Native Integration**
- Appears in Android notification panel
- Uses system notification sound
- Respects Do Not Disturb settings
- Persistent until user dismisses

### 🔔 **Rich Content**
- Title and detailed message
- Custom icons and badges
- Action buttons (View, Dismiss, etc.)
- Large images (optional)

### 📱 **Mobile Optimized**
- Strong vibration patterns
- Requires user interaction for important alerts
- Click handling to open specific pages
- Service Worker powered for reliability

## How to Test

1. **Open the Android notification test page**
2. **Click "Request Permission"** if needed
3. **Click "🔥 Native Android Notification"** button
4. **Check your notification panel** (swipe down from top)
5. **Tap the notification** to test click handling

## Expected Behavior

When you click the "🔥 Native Android Notification" button:

1. ✅ A notification appears in your Android notification panel
2. 📳 Your phone vibrates with a strong pattern
3. 🔊 System notification sound plays (if not on silent)
4. 👆 Tapping the notification opens the restaurant orders page
5. 🎯 Action buttons allow "View Order" or "Dismiss"

## Code Usage

```typescript
import { androidBrowserNotificationManager } from '@/utils/androidBrowserNotifications';

// For order notifications
await androidBrowserNotificationManager.showOrderNotification({
  id: 'order-123',
  unique_order_id: 'ORD001',
  customer_name: 'John Doe',
  table_number: '5',
  total_amount: 599.99
});

// For generic notifications
await androidBrowserNotificationManager.showGenericNotification(
  'Title',
  'Message',
  {
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: { url: '/target-page' }
  }
);
```

## Comparison with Regular Notifications

| Feature | Regular Notifications | Android Browser Notifications |
|---------|----------------------|------------------------------|
| **Location** | Browser popup/overlay | Android notification panel |
| **Persistence** | Auto-dismiss after few seconds | Stays until dismissed |
| **Sound** | Custom web audio | System notification sound |
| **Vibration** | Basic vibration API | Rich vibration patterns |
| **Actions** | Limited click handling | Multiple action buttons |
| **Integration** | Browser-specific | Native Android experience |
| **Reliability** | Can be blocked by popup blockers | Service Worker powered |

## Best Practices

### ✅ **Use Native Android Notifications For:**
- Important alerts (new paid orders)
- Time-sensitive information
- Actions that require immediate attention
- Rich content with action buttons

### ⚠️ **Use Regular Notifications For:**
- Simple confirmations
- Non-critical updates
- Quick status messages
- Desktop/non-Android devices

## Troubleshooting

### No Notifications Appearing?
1. Check notification permissions in Chrome settings
2. Ensure Do Not Disturb is off
3. Check if notifications are blocked for the site
4. Try refreshing the page to register service worker

### Notifications Not Clickable?
1. Service worker might not be registered properly
2. Check browser console for errors
3. Ensure the target URL is accessible

### No Sound/Vibration?
1. Check device volume settings
2. Ensure Do Not Disturb mode is off
3. Check Chrome notification settings
4. Some Android versions have additional notification controls

## Integration with Restaurant System

The Android browser notifications are automatically used for Android devices in the main notification system:

```typescript
// This will automatically use Android browser notifications on Android devices
await notificationManager.showOrderNotification(order);
```

The system detects Android devices and uses the enhanced browser notifications for better user experience, while falling back to regular notifications on other platforms.