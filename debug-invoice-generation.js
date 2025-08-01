// Debug script to test invoice generation step by step
// Run this in your browser console to identify the issue

async function debugInvoiceGeneration() {
  console.log('🔍 Starting Invoice Generation Debug...')
  
  try {
    // Step 1: Test if we can fetch order data
    console.log('📋 Step 1: Fetching orders that need invoices...')
    
    const ordersResponse = await fetch('/api/update-payment-status', {
      method: 'GET'
    })
    
    const ordersResult = await ordersResponse.json()
    console.log('✅ Orders fetched:', ordersResult)
    
    if (!ordersResult.orders || ordersResult.orders.length === 0) {
      console.log('❌ No orders found to test with')
      return
    }
    
    // Get the first order for testing
    const testOrder = ordersResult.orders[0]
    console.log('🧪 Using test order:', testOrder.unique_order_id)
    
    // Step 2: Test single invoice generation
    console.log('📄 Step 2: Testing single invoice generation...')
    
    const invoiceResponse = await fetch('/api/auto-generate-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: testOrder.id,
        force: true // Force regeneration even if exists
      })
    })
    
    const invoiceResult = await invoiceResponse.json()
    console.log('📄 Invoice generation result:', invoiceResult)
    
    if (invoiceResult.success) {
      console.log('🎉 Single invoice generation successful!')
      
      // Step 3: Verify the invoice was stored
      console.log('💾 Step 3: Verifying invoice storage...')
      
      // You can add a query here to check if the invoice was stored
      console.log('✅ Invoice should be stored in database')
      
    } else {
      console.log('❌ Single invoice generation failed:', invoiceResult.error)
      
      // Step 4: Try to get more detailed error info
      console.log('🔍 Step 4: Checking for detailed error information...')
      
      if (invoiceResult.error) {
        console.log('Error details:', invoiceResult.error)
      }
    }
    
  } catch (error) {
    console.error('❌ Debug process failed:', error)
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('🌐 This appears to be a network/API error')
      console.log('💡 Make sure your server is running and the API endpoints are accessible')
    }
    
    // Check if it's a JSON parsing error
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      console.log('📝 This appears to be a JSON parsing error')
      console.log('💡 The API might be returning HTML instead of JSON (check for 500 errors)')
    }
  }
}

// Test just the API endpoint availability
async function testAPIEndpoints() {
  console.log('🔗 Testing API Endpoints...')
  
  const endpoints = [
    '/api/update-payment-status',
    '/api/auto-generate-invoice',
    '/api/jobs/generate-invoices'
  ]
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: 'GET' })
      console.log(`${endpoint}: ${response.status} ${response.statusText}`)
      
      if (!response.ok) {
        const text = await response.text()
        console.log(`  Error response: ${text.substring(0, 200)}...`)
      }
    } catch (error) {
      console.log(`${endpoint}: ❌ ${error.message}`)
    }
  }
}

// Test with minimal order data
async function testWithMinimalData() {
  console.log('🧪 Testing with minimal order data...')
  
  const testOrderData = {
    id: 'test-123',
    unique_order_id: 'TEST-001',
    customer_name: 'Test Customer',
    customer_phone: '9876543210',
    total_amount: 100,
    status: 'completed',
    payment_status: 'completed',
    created_at: new Date().toISOString(),
    table_number: '1',
    items: [
      {
        dish_name: 'Test Item',
        quantity: 1,
        price: 100,
        total: 100
      }
    ],
    restaurants: {
      name: 'Test Restaurant',
      address: 'Test Address',
      phone_number: '1234567890',
      email: 'test@restaurant.com'
    }
  }
  
  console.log('📋 Test order data:', testOrderData)
  console.log('💡 This data structure should work with the invoice generator')
}

// Run all debug tests
async function runDebugTests() {
  console.log('🚀 Starting Complete Debug Process...\n')
  
  await testAPIEndpoints()
  console.log('\n' + '='.repeat(50) + '\n')
  
  await testWithMinimalData()
  console.log('\n' + '='.repeat(50) + '\n')
  
  await debugInvoiceGeneration()
  
  console.log('\n🏁 Debug process completed!')
}

// Make functions available globally
window.debugInvoiceGeneration = debugInvoiceGeneration
window.testAPIEndpoints = testAPIEndpoints
window.testWithMinimalData = testWithMinimalData
window.runDebugTests = runDebugTests

console.log('🔧 Debug functions loaded:')
console.log('- debugInvoiceGeneration()')
console.log('- testAPIEndpoints()')
console.log('- testWithMinimalData()')
console.log('- runDebugTests()')
console.log('\n💡 Run runDebugTests() to start debugging!')