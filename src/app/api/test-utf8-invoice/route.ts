import { NextRequest, NextResponse } from 'next/server'
import { generateSimpleInvoiceHTML } from '@/lib/generateInvoiceFallback'

/**
 * Test endpoint to verify UTF-8 encoding in invoice generation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create test order data with UTF-8 characters
    const testOrderData = {
      id: 'utf8-test-' + Date.now(),
      unique_order_id: 'UTF8-TEST-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      customer_name: body.customerName || 'राम कुमार', // Hindi name
      customer_phone: '9876543210',
      total_amount: 525.50,
      status: 'completed',
      payment_status: 'completed',
      created_at: new Date().toISOString(),
      table_number: '5',
      items: body.items || [
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
        name: body.restaurantName || 'श्री राम रेस्टोरेंट', // Hindi restaurant name
        address: '123 Main Street, Mumbai 📍',
        phone_number: '022-12345678'
      }
    }

    console.log('🧪 Testing UTF-8 invoice with data:', {
      customerName: testOrderData.customer_name,
      restaurantName: testOrderData.restaurants?.name,
      itemsCount: testOrderData.items.length
    })

    // Generate HTML invoice
    const htmlInvoice = generateSimpleInvoiceHTML(testOrderData)
    
    // Check for UTF-8 characters in the generated HTML
    const utf8Tests = {
      hasRupeeSymbol: htmlInvoice.includes('₹'),
      hasHindiText: /[\u0900-\u097F]/.test(htmlInvoice),
      hasEmoji: /[\u{1F300}-\u{1F9FF}]/u.test(htmlInvoice),
      hasProperEncoding: htmlInvoice.includes('charset=UTF-8'),
      hasNotoFont: htmlInvoice.includes('Noto Sans')
    }

    // Create a buffer to test encoding
    const htmlBuffer = Buffer.from(htmlInvoice, 'utf8')
    const base64HTML = htmlBuffer.toString('base64')
    
    // Decode back to verify
    const decodedHTML = Buffer.from(base64HTML, 'base64').toString('utf8')
    const encodingPreserved = decodedHTML === htmlInvoice

    return NextResponse.json({
      success: true,
      message: 'UTF-8 invoice test completed',
      testResults: {
        ...utf8Tests,
        encodingPreserved,
        htmlLength: htmlInvoice.length,
        bufferSize: htmlBuffer.length,
        base64Size: base64HTML.length
      },
      sampleHTML: htmlInvoice.substring(0, 500) + '...',
      testData: {
        customerName: testOrderData.customer_name,
        restaurantName: testOrderData.restaurants?.name,
        firstItemName: testOrderData.items[0]?.dish_name
      }
    })

  } catch (error) {
    console.error('UTF-8 invoice test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'UTF-8 test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to return a test HTML invoice for direct viewing
 */
export async function GET(request: NextRequest) {
  try {
    const testOrderData = {
      id: 'utf8-test-get',
      unique_order_id: 'UTF8-GET-TEST',
      customer_name: 'राम कुमार Singh', // Mixed Hindi/English
      customer_phone: '9876543210',
      total_amount: 525.50,
      status: 'completed',
      payment_status: 'completed',
      created_at: new Date().toISOString(),
      table_number: '5',
      items: [
        {
          dish_name: 'मसाला डोसा (Masala Dosa)', // Hindi with English
          quantity: 2,
          price: 150.00,
          total: 300.00
        },
        {
          dish_name: 'Coffee ☕ (Hot)', // Emoji with text
          quantity: 1,
          price: 75.50,
          total: 75.50
        },
        {
          dish_name: 'थाली Special (₹150)', // Hindi with rupee symbol
          quantity: 1,
          price: 150.00,
          total: 150.00
        }
      ],
      restaurants: {
        name: 'श्री राम Restaurant & Café ☕',
        address: '123 Main Street, मुंबई (Mumbai) 📍',
        phone_number: '022-12345678'
      }
    }

    const htmlInvoice = generateSimpleInvoiceHTML(testOrderData)

    return new NextResponse(htmlInvoice, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('UTF-8 HTML test error:', error)
    return NextResponse.json(
      { error: 'Failed to generate test HTML' },
      { status: 500 }
    )
  }
}