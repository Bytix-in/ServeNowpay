#!/usr/bin/env node

/**
 * Webhook Setup Script for ServeNow
 * 
 * This script helps you set up webhooks for all restaurants in your system.
 * Run with: node setup-webhooks.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupWebhooksForAllRestaurants() {
  try {
    console.log('🚀 Starting webhook setup for all restaurants...\n')

    // Get all restaurants
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('id, name, webhook_configured')
      .eq('status', 'active')

    if (error) {
      throw new Error(`Failed to fetch restaurants: ${error.message}`)
    }

    if (!restaurants || restaurants.length === 0) {
      console.log('❌ No active restaurants found.')
      return
    }

    console.log(`📋 Found ${restaurants.length} active restaurants\n`)

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const restaurant of restaurants) {
      console.log(`🏪 Processing: ${restaurant.name} (${restaurant.id})`)

      if (restaurant.webhook_configured) {
        console.log('   ✅ Already configured, skipping...\n')
        skipCount++
        continue
      }

      try {
        // Call the webhook configuration API
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/restaurants/${restaurant.id}/webhook-config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (response.ok) {
          const result = await response.json()
          console.log('   ✅ Webhook configured successfully')
          console.log(`   📡 URL: ${result.webhook_url}\n`)
          successCount++
        } else {
          const error = await response.json()
          console.log(`   ❌ Failed: ${error.error}`)
          console.log(`   💡 Tip: Make sure payment credentials are configured first\n`)
          errorCount++
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}\n`)
        errorCount++
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('📊 SUMMARY:')
    console.log(`   ✅ Successfully configured: ${successCount}`)
    console.log(`   ⏭️  Already configured: ${skipCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    console.log(`   📋 Total processed: ${restaurants.length}\n`)

    if (successCount > 0) {
      console.log('🎉 Webhook setup completed! Your restaurants now support real-time payment updates.')
    }

    if (errorCount > 0) {
      console.log('⚠️  Some restaurants failed webhook configuration. Please:')
      console.log('   1. Ensure payment credentials are configured')
      console.log('   2. Check Cashfree API connectivity')
      console.log('   3. Verify your domain is accessible')
    }

  } catch (error) {
    console.error('💥 Setup failed:', error.message)
    process.exit(1)
  }
}

async function testWebhookEndpoint() {
  try {
    console.log('🧪 Testing webhook endpoint...')
    
    const testPayload = {
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: {
        order: {
          order_id: 'test_order_123',
          order_status: 'PAID'
        }
      }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/cashfree`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    })

    if (response.ok) {
      console.log('✅ Webhook endpoint is accessible and working')
    } else {
      console.log('❌ Webhook endpoint test failed')
      console.log('💡 Make sure your server is running and accessible')
    }
  } catch (error) {
    console.log('❌ Webhook endpoint test failed:', error.message)
  }
}

async function main() {
  console.log('🔧 ServeNow Webhook Setup Tool\n')

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY')
    console.error('\nPlease check your .env.local file.')
    process.exit(1)
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    console.error('❌ Missing NEXT_PUBLIC_APP_URL environment variable')
    console.error('   This should be your domain (e.g., https://yourdomain.com)')
    console.error('\nPlease add it to your .env.local file.')
    process.exit(1)
  }

  console.log(`🌐 App URL: ${process.env.NEXT_PUBLIC_APP_URL}`)
  console.log(`🗄️  Database: ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n`)

  // Test webhook endpoint first
  await testWebhookEndpoint()
  console.log()

  // Setup webhooks for all restaurants
  await setupWebhooksForAllRestaurants()
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { setupWebhooksForAllRestaurants, testWebhookEndpoint }