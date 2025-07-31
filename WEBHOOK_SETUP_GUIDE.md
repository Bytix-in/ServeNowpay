# Webhook Configuration Guide for ServeNow

## Overview
Webhooks enable real-time payment status updates from Cashfree to your application, eliminating the need for multiple API requests and providing instant payment confirmations.

## 🔧 Setup Steps

### 1. Database Migration
First, run the database migration to add webhook fields:

```sql
-- Run this in your Supabase SQL Editor
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS webhook_configured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Enable Supabase Realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

### 2. Admin Dashboard Configuration

#### Where to Configure Webhooks:
1. **Go to Admin Dashboard** → `http://localhost:3001/admin`
2. **Click on any restaurant** to open details modal
3. **Find "Payment Webhooks" section** (after Manager Access)
4. **Click "Configure" button**

#### What Happens When You Configure:
- Creates webhook URL: `https://yourdomain.com/api/webhooks/cashfree`
- Registers webhook with Cashfree for payment events
- Enables real-time payment status updates
- Updates restaurant record with webhook status

### 3. Cashfree Dashboard (Manual Setup Alternative)

If you prefer to configure webhooks manually in Cashfree:

#### Sandbox Environment:
1. Go to [Cashfree Sandbox Dashboard](https://sandbox.cashfree.com)
2. Navigate to **Developers** → **Webhooks**
3. Add webhook URL: `https://yourdomain.com/api/webhooks/cashfree`
4. Select events:
   - `PAYMENT_SUCCESS_WEBHOOK`
   - `PAYMENT_FAILED_WEBHOOK`

#### Production Environment:
1. Go to [Cashfree Production Dashboard](https://dashboard.cashfree.com)
2. Follow same steps as sandbox

### 4. Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📡 How Webhooks Work

### Payment Flow with Webhooks:
1. **Customer makes payment** → Cashfree processes payment
2. **Cashfree sends webhook** → `POST /api/webhooks/cashfree`
3. **Webhook updates database** → Order status changed to 'completed'
4. **Supabase Realtime triggers** → Frontend receives instant update
5. **UI updates immediately** → No API polling needed

### Webhook Events Handled:
- `PAYMENT_SUCCESS_WEBHOOK` → Updates order to 'completed'
- `PAYMENT_FAILED_WEBHOOK` → Updates order to 'failed'

## 🔍 Verification & Testing

### Check Webhook Status:
```sql
-- Check which restaurants have webhooks configured
SELECT name, webhook_configured, webhook_url 
FROM restaurants 
WHERE webhook_configured = true;
```

### Test Webhook Locally:
1. Use ngrok to expose local server: `ngrok http 3001`
2. Update webhook URL to ngrok URL
3. Make test payment to verify webhook delivery

### Monitor Webhook Calls:
- Check server logs for webhook events
- Verify order status updates in database
- Test real-time UI updates

## 🚨 Troubleshooting

### Common Issues:

#### 1. Webhook Not Configured
**Symptoms:** Multiple API requests, slow payment verification
**Solution:** Click "Configure" in admin dashboard

#### 2. Webhook URL Not Accessible
**Symptoms:** Webhooks not received, manual verification still needed
**Solution:** Ensure your domain is publicly accessible

#### 3. Supabase Realtime Not Working
**Symptoms:** Database updates but UI doesn't update
**Solution:** Run `ALTER PUBLICATION supabase_realtime ADD TABLE orders;`

#### 4. Invalid Webhook Signature
**Symptoms:** Webhook received but not processed
**Solution:** Verify webhook signature validation in code

### Debug Commands:
```sql
-- Check recent webhook deliveries
SELECT * FROM orders 
WHERE payment_gateway_response IS NOT NULL 
ORDER BY updated_at DESC LIMIT 10;

-- Verify Realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'orders';
```

## 📊 Benefits of Webhook Configuration

### Before Webhooks:
- ❌ Multiple API requests every 5 seconds
- ❌ Delayed payment confirmations
- ❌ Higher server load
- ❌ Poor user experience

### After Webhooks:
- ✅ Instant payment confirmations
- ✅ Single API call for verification
- ✅ Real-time UI updates
- ✅ Better performance
- ✅ Reduced server load

## 🔐 Security Considerations

1. **Webhook Signature Verification** - Always verify webhook signatures
2. **HTTPS Only** - Never use HTTP for webhook URLs
3. **Rate Limiting** - Implement rate limiting on webhook endpoints
4. **Idempotency** - Handle duplicate webhook deliveries gracefully

## 📝 API Endpoints

### Webhook Configuration:
- `POST /api/admin/restaurants/[id]/webhook-config` - Configure webhook
- `POST /api/webhooks/cashfree` - Receive webhook events

### Payment Verification:
- `POST /api/verify-payment` - Manual verification (fallback)

## 🎯 Next Steps

1. Run database migration
2. Configure webhooks for each restaurant
3. Test payment flow
4. Monitor webhook delivery
5. Verify real-time updates work

Your payment system will now use real-time webhooks instead of polling! 🚀