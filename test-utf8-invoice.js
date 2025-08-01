// Test UTF-8 encoding in invoice generation
// Run this in your browser console or as a Node.js script

async function testUTF8Invoice() {
    console.log('🧪 Testing UTF-8 Invoice Generation...')

    // Test data with various Unicode characters
    const testOrder = {
        id: 'test-utf8-order',
        unique_order_id: 'UTF8-TEST-001',
        customer_name: 'राम कुमार', // Hindi name
        customer_phone: '9876543210',
        total_amount: 525.50,
        status: 'completed',
        payment_status: 'completed',
        created_at: new Date().toISOString(),
        table_number: '5',
        items: [
            {
                dish_name: 'मसाला डोसा', // Hindi dish name
                quantity: 2,
                price: 150.00,
                total: 300.00
            },
            {
                dish_name: 'Coffee ☕', // With emoji
                quantity: 1,
                price: 75.50,
                total: 75.50
            },
            {
                dish_name: 'Special Thali (₹150)', // With rupee symbol
                quantity: 1,
                price: 150.00,
                total: 150.00
            }
        ],
        restaurants: {
            name: 'श्री राम रेस्टोरेंट', // Hindi restaurant name
            address: '123 Main Street, Mumbai 📍',
            phone_number: '022-12345678'
        }
    }

    try {
        console.log('📋 Test order data:', testOrder)

        // Test the auto-generate-invoice endpoint
        const response = await fetch('/api/auto-generate-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                orderId: testOrder.id,
                force: true // Force regeneration
            })
        })

        const result = await response.json()
        console.log('📊 Invoice generation result:', result)

        if (result.success) {
            console.log('✅ UTF-8 invoice generated successfully!')
            console.log(`📄 Invoice size: ${result.invoiceSize} bytes`)

            // Test retrieving the invoice
            console.log('🔍 Testing invoice retrieval...')
            
            const retrieveResponse = await fetch(`/api/store-invoice?orderId=${testOrder.id}&customerPhone=${testOrder.customer_phone}`)
            
            if (retrieveResponse.ok) {
                const blob = await retrieveResponse.blob()
                console.log('✅ Invoice retrieved successfully!')
                console.log(`📄 PDF size: ${blob.size} bytes`)
                console.log(`📄 PDF type: ${blob.type}`)

                // Create download link for testing
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `utf8-test-invoice-${testOrder.unique_order_id}.pdf`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)

                console.log('💾 Test invoice downloaded! Check if UTF-8 characters display correctly.')
            } else {
                console.error('❌ Failed to retrieve invoice:', await retrieveResponse.text())
            }

        } else {
            console.error('❌ Invoice generation failed:', result.error)
        }

    } catch (error) {
        console.error('❌ Test failed:', error)
    }
}

async function testFallbackInvoice() {
    console.log('🧪 Testing Fallback UTF-8 Invoice...')

    // Test the fallback invoice endpoint
    try {
        const response = await fetch('/api/test-fallback-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                testUTF8: true,
                customerName: 'राम कुमार',
                restaurantName: 'श्री राम रेस्टोरेंट',
                items: [
                    { name: 'मसाला डोसा ₹150', quantity: 2, price: 150 },
                    { name: 'Coffee ☕ ₹75', quantity: 1, price: 75 }
                ]
            })
        })

        if (response.ok) {
            const result = await response.json()
            console.log('✅ Fallback invoice test result:', result)
        } else {
            console.error('❌ Fallback test failed:', await response.text())
        }

    } catch (error) {
        console.error('❌ Fallback test error:', error)
    }
}

// Make functions available globally
window.testUTF8Invoice = testUTF8Invoice
window.testFallbackInvoice = testFallbackInvoice

console.log('🔧 UTF-8 Invoice Test Functions Loaded:')
console.log('- testUTF8Invoice() - Test full UTF-8 invoice generation')
console.log('- testFallbackInvoice() - Test fallback UTF-8 handling')
console.log('')
console.log('💡 Start with: testUTF8Invoice()')
console.log('')
console.log('🎯 What to check in the generated PDF:')
console.log('- Rs. symbol displays correctly (no encoding issues)')
console.log('- Numbers format properly (e.g., Rs. 150.00)')
console.log('- No garbled characters like â‚¹ or â€™')
console.log('- Clean, readable text throughout')