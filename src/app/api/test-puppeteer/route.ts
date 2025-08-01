import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

/**
 * Test endpoint to check if Puppeteer is working
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Testing Puppeteer...')
    
    // Launch Puppeteer with safe options
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    })

    const page = await browser.newPage()
    
    // Test with simple HTML
    const testHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #8b5cf6; }
        </style>
      </head>
      <body>
        <h1>Puppeteer Test</h1>
        <p>This is a test PDF generated at: ${new Date().toISOString()}</p>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <tr>
            <th>Test Column 1</th>
            <th>Test Column 2</th>
          </tr>
          <tr>
            <td>Test Data 1</td>
            <td>Test Data 2</td>
          </tr>
        </table>
      </body>
      </html>
    `
    
    await page.setContent(testHTML, { waitUntil: 'networkidle0' })
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })

    await browser.close()

    console.log('Puppeteer test successful, PDF size:', pdfBuffer.length)

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="puppeteer-test.pdf"'
      }
    })

  } catch (error) {
    console.error('Puppeteer test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Puppeteer test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { html } = await request.json()
    
    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      )
    }

    console.log('Testing Puppeteer with custom HTML...')
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })

    await browser.close()

    // Convert to base64 for testing
    const base64PDF = pdfBuffer.toString('base64')

    return NextResponse.json({
      success: true,
      message: 'PDF generated successfully',
      pdfSize: pdfBuffer.length,
      base64Size: base64PDF.length,
      base64Preview: base64PDF.substring(0, 100) + '...'
    })

  } catch (error) {
    console.error('Custom HTML test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Custom HTML test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}