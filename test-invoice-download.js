// Test script for invoice download functionality
// Run this in your browser console to test the download feature

async function testInvoiceDownload() {
  console.log('🧪 Testing Invoice Download Functionality...')
  
  try {
    // Check if we're on the user dashboard
    if (window.location.pathname.includes('/user/dashboard')) {
      console.log('📱 Testing User Dashboard Invoice Download...')
      
      // Look for download buttons
      const downloadButtons = document.querySelectorAll('button[class*="text-green-600"]')
      console.log(`Found ${downloadButtons.length} potential download buttons`)
      
      if (downloadButtons.length > 0) {
        console.log('✅ Download buttons found on user dashboard')
        console.log('💡 Click on an order to open details, then click "Download Invoice"')
      } else {
        console.log('⚠️  No download buttons found. Make sure you have completed orders.')
      }
    }
    
    // Check if we're on the restaurant dashboard
    if (window.location.pathname.includes('/restaurant')) {
      console.log('🏪 Testing Restaurant Dashboard Invoice Download...')
      
      // Look for download buttons in the orders table
      const downloadButtons = document.querySelectorAll('button[class*="text-green-600"]')
      console.log(`Found ${downloadButtons.length} potential download buttons`)
      
      if (downloadButtons.length > 0) {
        console.log('✅ Download buttons found on restaurant dashboard')
        console.log('💡 Click any "Download" button next to completed orders')
      } else {
        console.log('⚠️  No download buttons found. Make sure you have completed orders.')
      }
    }
    
    // Test base64 to blob conversion
    console.log('🔧 Testing base64 to blob conversion...')
    
    const testBase64 = 'SGVsbG8gV29ybGQh' // "Hello World!" in base64
    const byteCharacters = atob(testBase64)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'text/plain' })
    
    console.log('✅ Base64 to blob conversion working')
    console.log(`Blob size: ${blob.size} bytes`)
    
    // Test download functionality
    console.log('📥 Testing download functionality...')
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'test-download.txt'
    
    console.log('✅ Download link created successfully')
    console.log('💡 Download functionality is ready!')
    
    // Cleanup
    window.URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Test invoice generation API
async function testInvoiceGeneration(orderId) {
  console.log(`🧪 Testing Invoice Generation for Order: ${orderId}`)
  
  try {
    const response = await fetch('/api/auto-generate-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: orderId
      })
    })
    
    const result = await response.json()
    console.log('📄 Invoice Generation Result:', result)
    
    if (result.success) {
      console.log('✅ Invoice generated successfully!')
      console.log(`📊 Invoice size: ${result.invoiceSize} characters`)
    } else {
      console.log('❌ Invoice generation failed:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Invoice generation test failed:', error)
  }
}

// Check invoice status for orders
async function checkInvoiceStatus() {
  console.log('📊 Checking Invoice Status...')
  
  try {
    const response = await fetch('/api/jobs/generate-invoices', {
      method: 'GET'
    })
    
    const result = await response.json()
    console.log('📊 Invoice Status:', result)
    
    if (result.pendingOrders) {
      console.log(`📋 Orders with invoices: ${result.pendingOrders.count === 0 ? 'All orders have invoices!' : 'Some orders need invoices'}`)
      
      if (result.pendingOrders.count > 0) {
        console.log('📋 Orders needing invoices:')
        result.pendingOrders.orders.slice(0, 5).forEach(order => {
          console.log(`  - ${order.unique_order_id}: ${order.customer_name}`)
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Status check failed:', error)
  }
}

// Make functions available globally
window.testInvoiceDownload = testInvoiceDownload
window.testInvoiceGeneration = testInvoiceGeneration
window.checkInvoiceStatus = checkInvoiceStatus

console.log('🔧 Invoice Download Test Functions Available:')
console.log('- testInvoiceDownload() - Test download functionality')
console.log('- testInvoiceGeneration(orderId) - Test invoice generation')
console.log('- checkInvoiceStatus() - Check invoice status')
console.log('\n💡 Start with: testInvoiceDownload()')