// Test the updated invoice system with fallback support
// Run this in your browser console

async function testUpdatedSystem() {
    console.log('🚀 Testing Updated Invoice System with Fallback...')

    try {
        // Test 1: Process a small batch first
        console.log('📋 Step 1: Processing small batch (3 orders)...')

        const batchResponse = await fetch('/api/jobs/generate-invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                batchSize: 3,
                maxRetries: 2,
                delayBetweenBatches: 500
            })
        })

        const batchResult = await batchResponse.json()
        console.log('✅ Small batch result:', batchResult)

        if (batchResult.success) {
            console.log(`📊 Processed: ${batchResult.processed} orders`)
            console.log(`✅ Successful: ${batchResult.successful} invoices`)
            console.log(`❌ Failed: ${batchResult.failed} invoices`)

            if (batchResult.successful > 0) {
                console.log('🎉 Success! The system is working with fallback support!')

                // Test 2: Check the results
                console.log('\n📋 Step 2: Checking generated invoices...')

                const statusResponse = await fetch('/api/jobs/generate-invoices', {
                    method: 'GET'
                })

                const statusResult = await statusResponse.json()
                console.log('📊 Current status:', statusResult)

                if (statusResult.pendingOrders) {
                    const remaining = statusResult.pendingOrders.count
                    console.log(`📋 Remaining orders to process: ${remaining}`)

                    if (remaining > 0) {
                        console.log('💡 Ready to process all remaining orders!')
                        console.log('Run: processAllRemainingOrders() to continue')
                    } else {
                        console.log('🎉 All orders have been processed!')
                    }
                }

            } else {
                console.log('⚠️  No invoices were generated successfully')
                console.log('Check the error details:', batchResult)
            }

        } else {
            console.log('❌ Batch processing failed:', batchResult.error)
        }

    } catch (error) {
        console.error('❌ Test failed:', error)
    }
}

async function processAllRemainingOrders() {
    console.log('🔄 Processing ALL remaining orders...')

    try {
        const response = await fetch('/api/jobs/generate-invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                batchSize: 10, // Process 10 at a time
                maxRetries: 2,
                delayBetweenBatches: 1000 // 1 second delay between batches
            })
        })

        const result = await response.json()
        console.log('📊 Final processing result:', result)

        if (result.success) {
            console.log(`🎉 COMPLETED!`)
            console.log(`📊 Total Processed: ${result.processed} orders`)
            console.log(`✅ Successful: ${result.successful} invoices`)
            console.log(`❌ Failed: ${result.failed} invoices`)

            if (result.failed > 0) {
                console.log('⚠️  Some orders failed. Check the logs for details.')
            } else {
                console.log('🎉 ALL ORDERS PROCESSED SUCCESSFULLY!')
            }
        } else {
            console.log('❌ Processing failed:', result.error)
        }

    } catch (error) {
        console.error('❌ Processing failed:', error)
    }
}

async function checkSystemStatus() {
    console.log('📊 Checking system status...')

    try {
        const response = await fetch('/api/jobs/generate-invoices', {
            method: 'GET'
        })

        const result = await response.json()
        console.log('📊 System Status:', result)

        if (result.pendingOrders) {
            console.log(`📋 Orders needing invoices: ${result.pendingOrders.count}`)

            if (result.pendingOrders.count === 0) {
                console.log('🎉 All orders have invoices!')
            } else {
                console.log('📋 Sample pending orders:')
                result.pendingOrders.orders.slice(0, 5).forEach(order => {
                    console.log(`  - ${order.unique_order_id}: ${order.customer_name} - ₹${order.total_amount}`)
                })
            }
        }

    } catch (error) {
        console.error('❌ Status check failed:', error)
    }
}

// Make functions available globally
window.testUpdatedSystem = testUpdatedSystem
window.processAllRemainingOrders = processAllRemainingOrders
window.checkSystemStatus = checkSystemStatus

console.log('🔧 Updated system test functions loaded:')
console.log('- testUpdatedSystem() - Test with small batch first')
console.log('- processAllRemainingOrders() - Process all remaining orders')
console.log('- checkSystemStatus() - Check current status')
console.log('\n💡 Start with: testUpdatedSystem()')