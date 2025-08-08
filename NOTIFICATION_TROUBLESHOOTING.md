# Notification Troubleshooting Guide

## Quick Test Steps

### 1. Visit the Test Page
Go to: `http://localhost:3000/restaurant/test-notifications`

### 2. Check Debug Panel
The yellow debug panel will show:
- **Notification Support**: Should be "Yes" 
- **Browser Permission**: Should show current permission status
- **Service Audio**: Shows if audio is enabled
- **Service Permission**: Shows service permission state
- **Fully Enabled**: Shows if everything is working

### 3. Test Sequence

#### Step 1: Request Permissions
1. Click "Request Permissions" button
2. Browser should show permission dialog
3. Click "Allow" when prompted
4. Check debug panel - permission should change to "granted"

#### Step 2: Test Direct Notification
1. Click "Test Direct Notification" button
2. Should show a browser notification immediately
3. If this works, the browser supports notifications

#### Step 3: Test Service Notification
1. Click "Test Service Notification" button
2. Should play sound AND show notification
3. If only sound plays, there's an issue with the service

### 4. Common Issues & Solutions

#### Issue: "Permission denied"
**Solution**: 
1. Check browser address bar for notification icon
2. Click it and set to "Allow"
3. Refresh page and try again

#### Issue: "No notification appears but sound plays"
**Possible causes**:
1. Browser notifications are blocked
2. Focus assist/Do not disturb is on
3. Notification permission was denied

**Debug steps**:
1. Open browser console (F12)
2. Look for error messages
3. Check the debug panel values
4. Try the "Test Direct Notification" button

#### Issue: "No sound but notification appears"
**Possible causes**:
1. User hasn't interacted with page yet
2. Audio context not initialized
3. Browser audio is muted

**Debug steps**:
1. Click somewhere on the page first
2. Check if audio is enabled in debug panel
3. Try requesting permissions again

### 5. Browser-Specific Issues

#### Chrome
- May block notifications if site isn't trusted
- Check chrome://settings/content/notifications
- Make sure site isn't in blocked list

#### Firefox
- May require explicit permission
- Check about:preferences#privacy
- Look for notification permissions

#### Safari
- May have stricter autoplay policies
- Check Safari > Preferences > Websites > Notifications
- Ensure site is allowed

### 6. Console Debugging

Open browser console (F12) and look for these messages:

**Good messages**:
```
Initialized with notification permission: granted
User interaction detected, initializing audio...
Audio context initialized successfully
Creating browser notification for order: TEST123
Browser notification created successfully
```

**Problem messages**:
```
Notification permission not granted, current: denied
Audio not available - no user interaction
Failed to show browser notification: [error]
```

### 7. Manual Test

If automated tests fail, try this manual test:

```javascript
// Paste in browser console
if ('Notification' in window) {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      new Notification('Manual Test', {
        body: 'This is a manual test notification'
      });
    } else {
      console.log('Permission denied:', permission);
    }
  });
} else {
  console.log('Notifications not supported');
}
```

### 8. Mobile Testing

For mobile devices:
1. Ensure HTTPS connection (notifications require secure context)
2. Test on actual device, not desktop browser mobile mode
3. Check device notification settings
4. Try both Chrome and Safari on mobile

### 9. Production Testing

To test with real paid orders:
1. Go to `/restaurant/orders`
2. Create a manual order with online payment
3. Complete the payment
4. Should trigger notification automatically

### 10. Get Help

If issues persist:
1. Note your browser and version
2. Copy the debug panel information
3. Check browser console for errors
4. Test on different browser/device

## Expected Behavior

**Desktop**: Sound + Browser notification
**Mobile**: Vibration + Browser notification (sound may not work due to mobile restrictions)
**All platforms**: Visual popup as fallback

The system is designed to work even if some methods fail - you should get at least one type of notification on any supported device.