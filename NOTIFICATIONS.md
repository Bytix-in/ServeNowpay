# Restaurant Order Notifications

## Overview
The ServeNow system includes a comprehensive browser notification system that alerts restaurants instantly when new orders are received, without requiring page reloads.

## Features

### 🔔 Browser Notifications
- **Title**: "New Order Alert"
- **Message**: "You have received a new order. Please check your dashboard."
- **Details**: Includes order ID, customer name, table number, and total amount
- **Auto-close**: Notifications automatically close after 15 seconds
- **Click Action**: Clicking the notification focuses the browser window and scrolls to the specific order

### 🔊 Audio Notifications
- Pleasant two-tone chime sound plays when new orders arrive
- Works across different browsers using Web Audio API
- Gracefully handles browsers that don't support audio

### ⚡ Real-time Updates
- Uses Supabase Realtime for instant order updates
- No page refresh required
- Orders appear immediately in the dashboard

### 🎛️ Permission Management
- Automatic permission request on first visit
- Visual status indicator showing notification state:
  - **Green**: Notifications enabled and working
  - **Red**: Notifications blocked by user
  - **Blue**: Click to enable notifications
- Test button to verify notifications are working

## How It Works

### 1. Permission Request
When a restaurant manager first visits the orders page, they'll see a button to enable notifications. Clicking it will:
- Request browser notification permission
- Show a test notification if granted
- Update the UI to show notification status

### 2. Real-time Monitoring
The system continuously monitors for new orders using Supabase Realtime:
```typescript
// Real-time subscription listens for new orders
const subscription = supabase
  .channel(`restaurant-orders-${restaurantId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'orders',
    filter: `restaurant_id=eq.${restaurantId}`
  }, (payload) => {
    // Show notification for new order
    showOrderNotification(payload.new);
    playNotificationSound();
  })
```

### 3. Notification Display
When a new order arrives:
1. Browser notification appears with order details
2. Audio chime plays
3. Order appears in the dashboard list
4. Notification auto-closes after 15 seconds
5. Clicking notification scrolls to the specific order

## Browser Compatibility
- **Chrome/Edge**: Full support including rich notifications
- **Firefox**: Full support with standard notifications
- **Safari**: Basic notification support
- **Mobile browsers**: Limited support (depends on device settings)

## Troubleshooting

### Notifications Not Appearing
1. Check if notifications are enabled in browser settings
2. Ensure the website has notification permission
3. Try the "Test 🔔" button to verify functionality
4. Check if "Do Not Disturb" mode is enabled on the device

### Audio Not Playing
1. Some browsers require user interaction before playing audio
2. Check browser audio settings and permissions
3. Audio may be blocked by browser autoplay policies

### Permission Denied
If notifications are blocked:
1. Click the browser's address bar lock icon
2. Change notification permission to "Allow"
3. Refresh the page
4. Click "Enable Notifications" again

## Technical Implementation

### Notification Manager
The system uses a singleton `OrderNotificationManager` class that handles:
- Permission management
- Notification creation and display
- Audio playback
- Cross-browser compatibility

### Key Files
- `/src/utils/notifications.ts` - Notification manager utility
- `/src/app/restaurant/orders/page.tsx` - Main orders page with notifications
- Database triggers automatically create real-time events

## Best Practices
1. **Always request permission gracefully** - Don't spam users with permission requests
2. **Provide clear status indicators** - Users should know if notifications are working
3. **Include test functionality** - Allow users to verify notifications work
4. **Handle failures gracefully** - System works even if notifications are disabled
5. **Respect user preferences** - Don't override browser/system notification settings

## Future Enhancements
- Push notifications for mobile apps
- Customizable notification sounds
- Notification scheduling and quiet hours
- Integration with restaurant management systems
- SMS/email fallback notifications