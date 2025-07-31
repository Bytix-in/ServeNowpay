# 🚀 Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Environment Configuration
- [ ] Update `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Set `NODE_ENV=production`
- [ ] Configure production Supabase credentials
- [ ] Set up production Cashfree credentials
- [ ] Ensure all environment variables are secure

### ✅ Database Setup
- [ ] Run database migration: `database-migration-webhook.sql`
- [ ] Verify Supabase Realtime is enabled for orders table
- [ ] Configure Row Level Security (RLS) policies
- [ ] Set up database backups

### ✅ Payment Gateway Setup
- [ ] Configure Cashfree production credentials
- [ ] Set up webhooks in Cashfree dashboard
- [ ] Test payment flow in production environment
- [ ] Verify webhook endpoints are accessible

### ✅ Security
- [ ] Enable HTTPS (required for webhooks)
- [ ] Configure CORS policies
- [ ] Set up rate limiting
- [ ] Implement webhook signature verification
- [ ] Secure API endpoints

## Deployment Steps

### 1. Environment Variables
```env
# Production Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
ENCRYPTION_KEY=your_secure_encryption_key
```

### 2. Database Migration
Run in production Supabase SQL Editor:
```sql
-- Add webhook configuration fields
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS webhook_configured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Enable Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

### 3. Webhook Configuration
- **Production URL**: `https://yourdomain.com/api/webhooks/cashfree`
- **Events**: `PAYMENT_SUCCESS_WEBHOOK`, `PAYMENT_FAILED_WEBHOOK`
- **Configure in**: Cashfree Production Dashboard

### 4. Build and Deploy
```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to your hosting platform
```

## Post-Deployment Verification

### ✅ Test Payment Flow
1. Create test order
2. Process payment
3. Verify real-time status updates
4. Check webhook delivery
5. Confirm database updates

### ✅ Monitor System Health
- [ ] Check server logs
- [ ] Monitor webhook delivery
- [ ] Verify Supabase Realtime connections
- [ ] Test payment verification API

## Performance Optimizations

### ✅ Implemented
- ✅ **Supabase Realtime**: Eliminates polling, instant updates
- ✅ **Single API calls**: No more repeated verification requests
- ✅ **Optimized database queries**: Proper indexing and efficient queries
- ✅ **Clean error handling**: Production-ready error responses
- ✅ **Minimal logging**: Only essential logs for production

### ✅ Monitoring
- Monitor webhook delivery success rate
- Track payment verification response times
- Monitor Supabase Realtime connection health
- Set up alerts for failed payments

## Security Best Practices

### ✅ Implemented
- ✅ **Environment-based configuration**: Different settings for dev/prod
- ✅ **Secure credential storage**: Encrypted payment credentials
- ✅ **Input validation**: All API endpoints validate input
- ✅ **Error handling**: No sensitive data in error responses

### ✅ Additional Recommendations
- Set up SSL/TLS certificates
- Configure firewall rules
- Implement rate limiting
- Set up monitoring and alerting
- Regular security audits

## Troubleshooting

### Common Issues
1. **Webhook not received**: Check domain accessibility and HTTPS
2. **Payment status stuck**: Verify Supabase Realtime configuration
3. **Database errors**: Check RLS policies and permissions
4. **API timeouts**: Monitor server performance and scaling

### Debug Commands
```sql
-- Check webhook configuration
SELECT name, webhook_configured, webhook_url FROM restaurants;

-- Check recent orders
SELECT id, payment_status, status, updated_at FROM orders ORDER BY created_at DESC LIMIT 10;

-- Verify Realtime setup
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

## Support
- Check server logs for errors
- Monitor Supabase dashboard
- Review Cashfree webhook logs
- Test payment flow regularly

Your ServeNow application is now production-ready! 🎉