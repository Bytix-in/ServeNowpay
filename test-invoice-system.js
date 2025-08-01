// Test script for invoice generation system
// Run this in your browser console or as a Node.js script

// Test 1: Check if the system is ready
async function testSystemStatus() {
    console.log('🔍 Testing Invoice System Status...')

    try {
        // Check if there are orders needing invoices
        const response = await fetch('/api/update-payment-status', {
            method: 'GET'
        })

        const result = await response.json()
        console.log('✅ System Status:', result)

        if (result.count === 0) {
            console.log('ℹ️  No completed orders without invoices found')
            console.log('💡 Create a test order and mark it as completed to test invoice generation')
        }

    } catch (error) {
        console.error('❌ System Status Error:', error)
    }
}

// Test 2: Update a specific order's payment status to trigger invoice generation
async function testInvoiceGeneration(orderId) {
    console.log(`🧪 Testing Invoice Generation for Order: ${orderId}`)

    try {
        const response = await fetch('/api/update-payment-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orderId: orderId,
                paymentStatus: 'completed',
                webhookSource: 'manual-test'
            })
        })

        const result = await response.json()
        console.log('✅ Invoice Generation Result:', result)

        if (result.success && result.invoiceGenerated) {
            console.log('🎉 Invoice generated successfully!')
            console.log(`📄 Invoice size: ${result.invoiceSize || 'Unknown'} characters`)
        } else if (result.invoiceAlreadyExists) {
            console.log('ℹ️  Invoice already exists for this order')
        } else {
            console.log('⚠️  Invoice generation may have failed')
        }

    } catch (error) {
        console.error('❌ Invoice Generation Error:', error)
    }
}

// Test 3: Run background job to process all pending invoices
async function testBackgroundJob() {
    console.log('🔄 Testing Background Invoice Job...')

    try {
        const response = await fetch('/api/jobs/generate-invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                batchSize: 5,
                maxRetries: 2
            })
        })

        const result = await response.json()
        console.log('✅ Background Job Result:', result)

        if (result.success) {
            console.log(`📊 Processed: ${result.processed} orders`)
            console.log(`✅ Successful: ${result.successful} invoices`)
            console.log(`❌ Failed: ${result.failed} invoices`)
        }

    } catch (error) {
        console.error('❌ Background Job Error:', error)
    }
}

// Test 4: Check job status and pending orders
async function checkJobStatus() {
    console.log('📊 Checking Job Status...')

    try {
        const response = await fetch('/api/jobs/generate-invoices', {
            method: 'GET'
        })

        const result = await response.json()
        console.log('✅ Job Status:', result)

        if (result.pendingOrders) {
            console.log(`📋 Pending Orders: ${result.pendingOrders.count}`)
            if (result.pendingOrders.orders.length > 0) {
                console.log('Orders needing invoices:')
                result.pendingOrders.orders.forEach(order => {
                    console.log(`  - Order ${order.unique_order_id}: ${order.customer_name} - ₹${order.total_amount}`)
                })
            }
        }

    } catch (error) {
        console.error('❌ Job Status Error:', error)
    }
}

// Run all tests
async function runAllTests(testOrderId = null) {
    console.log('🚀 Starting Invoice System Tests...\n')

    await testSystemStatus()
    console.log('\n' + '='.repeat(50) + '\n')

    await checkJobStatus()
    console.log('\n' + '='.repeat(50) + '\n')

    if (testOrderId) {
        await testInvoiceGeneration(testOrderId)
        console.log('\n' + '='.repeat(50) + '\n')
    } else {
        console.log('💡 To test invoice generation, run: testInvoiceGeneration("your-order-id")')
        console.log('\n' + '='.repeat(50) + '\n')
    }

    await testBackgroundJob()

    console.log('\n🎉 All tests completed!')
}

// Export functions for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testSystemStatus,
        testInvoiceGeneration,
        testBackgroundJob,
        checkJobStatus,
        runAllTests
    }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    console.log('🔧 Invoice System Test Functions Available:')
    console.log('- testSystemStatus()')
    console.log('- testInvoiceGeneration(orderId)')
    console.log('- testBackgroundJob()')
    console.log('- checkJobStatus()')
    console.log('- runAllTests(optionalOrderId)')
    console.log('\n💡 Run runAllTests() to test everything!')
}