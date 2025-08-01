import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { generateSimpleInvoiceHTML, generateInvoiceData } from './generateInvoiceFallback'

interface OrderData {
  id: string
  unique_order_id?: string
  customer_name?: string
  customer_phone: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  table_number: string
  items: Array<{
    dish_name: string
    quantity: number
    price: number
    total: number
  }>
  restaurants?: {
    name: string
    address?: string
    phone?: string
    gst_number?: string
  }
}

interface InvoicePDFOptions {
  format?: 'A4' | 'Letter'
  returnBase64?: boolean
  saveToFile?: boolean
  filename?: string
}

/**
 * Generate PDF invoice from order data
 * @param orderData - Order information
 * @param options - PDF generation options
 * @returns Promise<string | Buffer> - Base64 string or PDF buffer
 */
export async function generateInvoicePDF(
  orderData: OrderData, 
  options: InvoicePDFOptions = {}
): Promise<string | Buffer> {
  const {
    format = 'A4',
    returnBase64 = true,
    saveToFile = false,
    filename
  } = options

  let browser: puppeteer.Browser | null = null

  try {
    // Use embedded template to avoid file encoding issues
    const htmlTemplate = getEmbeddedTemplate()

    // Process the order data and replace placeholders
    const processedHTML = processInvoiceTemplate(htmlTemplate, orderData)

    // Launch Puppeteer with UTF-8 and font support
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--run-all-compositor-stages-before-draw',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-field-trial-config',
        '--disable-back-forward-cache',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-default-apps',
        '--no-default-browser-check',
        '--memory-pressure-off',
        // UTF-8 and font support
        '--font-render-hinting=none',
        '--disable-font-subpixel-positioning',
        '--enable-font-antialiasing',
        '--force-device-scale-factor=1'
      ],
      timeout: 60000, // 60 second timeout
      protocolTimeout: 60000
    })

    const page = await browser.newPage()
    
    // Set page settings for better PDF generation with UTF-8 support
    await page.setViewport({ width: 1200, height: 800 })
    await page.setDefaultTimeout(60000)
    
    // Set extra HTTP headers for UTF-8 support
    await page.setExtraHTTPHeaders({
      'Accept-Charset': 'utf-8',
      'Content-Type': 'text/html; charset=utf-8'
    })
    
    // Ensure UTF-8 encoding
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(document, 'charset', {
        value: 'UTF-8',
        writable: false
      })
    })
    
    // Set content with retry logic
    let contentSet = false
    let retries = 3
    
    while (!contentSet && retries > 0) {
      try {
        await page.setContent(processedHTML, { 
          waitUntil: 'domcontentloaded',
          timeout: 30000
        })
        
        // Wait for fonts to load and ensure proper rendering
        await page.evaluateHandle('document.fonts.ready')
        contentSet = true
      } catch (error) {
        console.log(`Content setting attempt failed, retries left: ${retries - 1}`)
        retries--
        if (retries === 0) throw error
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Wait a bit more for any dynamic content
    await page.waitForTimeout(2000)

    // Generate PDF with retry logic
    let pdfBuffer: Buffer | null = null
    retries = 3
    
    while (!pdfBuffer && retries > 0) {
      try {
        pdfBuffer = await page.pdf({
          format: format,
          printBackground: true,
          margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
          },
          preferCSSPageSize: true,
          timeout: 30000,
          // Ensure proper font embedding and UTF-8 support
          displayHeaderFooter: false,
          tagged: true, // For accessibility and better text extraction
          outline: false
        })
      } catch (error) {
        console.log(`PDF generation attempt failed, retries left: ${retries - 1}`)
        retries--
        if (retries === 0) throw error
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    if (!pdfBuffer) {
      throw new Error('Failed to generate PDF after multiple attempts')
    }

    // Save to file if requested
    if (saveToFile && filename) {
      const outputPath = path.join(process.cwd(), 'invoices', filename)
      
      // Ensure invoices directory exists
      const invoicesDir = path.dirname(outputPath)
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true })
      }
      
      fs.writeFileSync(outputPath, pdfBuffer)
    }

    // Return base64 string or buffer based on options
    if (returnBase64) {
      return pdfBuffer.toString('base64')
    } else {
      return pdfBuffer
    }

  } catch (error) {
    console.error('Error generating PDF invoice with Puppeteer:', error)
    
    // Try fallback method
    try {
      console.log('Attempting fallback invoice generation...')
      
      if (returnBase64) {
        // For base64 return, we'll store the HTML as base64 with proper UTF-8 encoding
        const fallbackHTML = generateSimpleInvoiceHTML(orderData)
        // Ensure UTF-8 encoding when creating buffer
        const htmlBuffer = Buffer.from(fallbackHTML, 'utf8')
        console.log('Fallback: Generated HTML invoice, size:', htmlBuffer.length)
        return htmlBuffer.toString('base64')
      } else {
        // For buffer return, we'll return the HTML as buffer with UTF-8 encoding
        const fallbackHTML = generateSimpleInvoiceHTML(orderData)
        const htmlBuffer = Buffer.from(fallbackHTML, 'utf8')
        console.log('Fallback: Generated HTML invoice buffer, size:', htmlBuffer.length)
        return htmlBuffer
      }
    } catch (fallbackError) {
      console.error('Fallback invoice generation also failed:', fallbackError)
      throw new Error(`Both PDF and fallback generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  } finally {
    // Always close the browser
    if (browser) {
      try {
        await browser.close()
      } catch (closeError) {
        console.error('Error closing browser:', closeError)
      }
    }
  }
}

/**
 * Process the HTML template and replace placeholders with order data
 * @param htmlTemplate - Raw HTML template
 * @param orderData - Order information
 * @returns Processed HTML string
 */
function processInvoiceTemplate(htmlTemplate: string, orderData: OrderData): string {
  try {
    // Calculate GST and totals
    const totalAmount = orderData.total_amount
    const subtotal = Math.round((totalAmount / 1.05) * 100) / 100 // Assuming 5% total GST
    const cgst = Math.round(((subtotal * 0.025) * 100)) / 100 // 2.5% CGST
    const sgst = Math.round(((subtotal * 0.025) * 100)) / 100 // 2.5% SGST

    // Format currency without symbol for template - using simple approach to avoid encoding issues
    const formatAmount = (amount: number): string => {
      // Use simple toFixed to avoid Intl formatting issues
      return amount.toFixed(2)
    }

    // Format date
    const formatDate = (dateString: string): string => {
      return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }

    // Get status classes for styling
    const getStatusClass = (status: string): string => {
      switch (status.toLowerCase()) {
        case 'completed':
        case 'served': return 'status-completed'
        case 'pending': return 'status-pending'
        case 'failed':
        case 'cancelled': return 'status-failed'
        case 'in_progress': return 'status-in-progress'
        default: return 'status-pending'
      }
    }

    // Generate items HTML table rows
    const generateItemsHTML = (): string => {
      if (!orderData.items || orderData.items.length === 0) {
        return `
          <tr>
            <td colspan="4" style="text-align: center; color: #666; padding: 20px;">
              No item details available
            </td>
          </tr>
        `
      }

      return orderData.items.map((item) => {
        const itemPrice = item.price || 0
        const itemTotal = item.total || (itemPrice * item.quantity) || 0
        
        return `
          <tr>
            <td><strong>${escapeHtml(item.dish_name || 'Unknown Item')}</strong></td>
            <td style="text-align: center;">${item.quantity || 1}</td>
            <td class="amount-cell">${formatAmount(itemPrice)}</td>
            <td class="amount-cell">${formatAmount(itemTotal)}</td>
          </tr>
        `
      }).join('')
    }

    // Replace all placeholders in the template
    let processedHTML = htmlTemplate
      .replace(/{{restaurantName}}/g, escapeHtml(orderData.restaurants?.name || 'Unknown Restaurant'))
      .replace(/{{restaurantAddress}}/g, escapeHtml(orderData.restaurants?.address || 'Address not available'))
      .replace(/{{restaurantPhone}}/g, escapeHtml(orderData.restaurants?.phone_number || 'Phone not available'))
      .replace(/{{restaurantGST}}/g, 'GST not available')
      .replace(/{{invoiceNumber}}/g, escapeHtml(orderData.unique_order_id || orderData.id.slice(-8)))
      .replace(/{{date}}/g, formatDate(orderData.created_at))
      .replace(/{{tableNumber}}/g, escapeHtml(orderData.table_number || 'N/A'))
      .replace(/{{customerName}}/g, escapeHtml(orderData.customer_name || 'Customer'))
      .replace(/{{customerPhone}}/g, `+91 ${orderData.customer_phone}`)
      .replace(/{{orderStatus}}/g, escapeHtml(orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1).replace('_', ' ')))
      .replace(/{{paymentStatus}}/g, escapeHtml(orderData.payment_status.charAt(0).toUpperCase() + orderData.payment_status.slice(1)))
      .replace(/{{orderStatusClass}}/g, getStatusClass(orderData.status))
      .replace(/{{paymentStatusClass}}/g, getStatusClass(orderData.payment_status))
      .replace(/{{items}}/g, generateItemsHTML())
      .replace(/{{subtotal}}/g, formatAmount(subtotal))
      .replace(/{{cgst}}/g, formatAmount(cgst))
      .replace(/{{sgst}}/g, formatAmount(sgst))
      .replace(/{{total}}/g, formatAmount(totalAmount))
      .replace(/{{generatedDate}}/g, new Date().toLocaleString('en-IN'))

    return processedHTML

  } catch (error) {
    console.error('Error processing invoice template:', error)
    throw new Error('Failed to process invoice template')
  }
}

/**
 * Get embedded HTML template to avoid file encoding issues
 * @returns HTML template string
 */
function getEmbeddedTemplate(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #8b5cf6;
            margin: 0;
            font-size: 2.5em;
        }
        
        .restaurant-info {
            margin-bottom: 30px;
        }
        
        .restaurant-info h2 {
            color: #333;
            margin: 0 0 10px 0;
            font-size: 1.8em;
        }
        
        .restaurant-info p {
            margin: 5px 0;
            color: #666;
        }
        
        .invoice-details {
            display: table;
            width: 100%;
            margin-bottom: 30px;
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
        }
        
        .invoice-details > div {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding-right: 20px;
        }
        
        .invoice-details h3 {
            margin: 0 0 10px 0;
            color: #8b5cf6;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        
        .invoice-details p {
            margin: 5px 0;
        }
        
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
        }
        
        th, td { 
            border: 1px solid #ddd; 
            padding: 12px 8px; 
            text-align: left; 
        }
        
        th { 
            background-color: #8b5cf6; 
            color: white;
            font-weight: bold;
        }
        
        tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .amount-cell {
            text-align: right;
            font-weight: bold;
        }
        
        .tax-summary {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-top: 20px;
        }
        
        .tax-summary p {
            margin: 8px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .tax-summary .total-row {
            border-top: 2px solid #333;
            padding-top: 10px;
            margin-top: 15px;
            font-size: 1.2em;
            font-weight: bold;
            color: #8b5cf6;
        }
        
        .footer-note {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 0.9em;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
        
        .status-badges {
            margin: 20px 0;
        }
        
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 0.9em;
            font-weight: bold;
            color: white;
            margin-right: 10px;
        }
        
        .status-completed { background-color: #28a745; }
        .status-pending { background-color: #ffc107; color: #333; }
        .status-failed { background-color: #dc3545; }
        .status-in-progress { background-color: #007bff; }
        
        @media print {
            body { margin: 0; padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>INVOICE</h1>
        <p>Tax Invoice</p>
    </div>
    
    <div class="restaurant-info">
        <h2>{{restaurantName}}</h2>
        <p>{{restaurantAddress}}</p>
        <p>Phone: {{restaurantPhone}} | GSTIN: {{restaurantGST}}</p>
    </div>
    
    <div class="invoice-details">
        <div>
            <h3>Invoice Details</h3>
            <p><strong>Invoice #:</strong> {{invoiceNumber}}</p>
            <p><strong>Date:</strong> {{date}}</p>
            <p><strong>Table:</strong> {{tableNumber}}</p>
        </div>
        <div>
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> {{customerName}}</p>
            <p><strong>Phone:</strong> {{customerPhone}}</p>
        </div>
    </div>
    
    <div class="status-badges">
        <span class="status-badge {{orderStatusClass}}">Order: {{orderStatus}}</span>
        <span class="status-badge {{paymentStatusClass}}">Payment: {{paymentStatus}}</span>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Rate (Rs.)</th>
                <th>Total (Rs.)</th>
            </tr>
        </thead>
        <tbody>
            {{items}}
        </tbody>
    </table>
    
    <div class="tax-summary">
        <p><span>Subtotal:</span> <span class="amount-cell">Rs. {{subtotal}}</span></p>
        <p><span>CGST @2.5%:</span> <span class="amount-cell">Rs. {{cgst}}</span></p>
        <p><span>SGST @2.5%:</span> <span class="amount-cell">Rs. {{sgst}}</span></p>
        <p class="total-row"><span>Total Amount:</span> <span class="amount-cell">Rs. {{total}}</span></p>
    </div>
    
    <div class="footer-note">
        <p><strong>ServeNowPay</strong> - Digital Restaurant Ordering System</p>
        <p>This is a computer-generated invoice. No signature required.</p>
        <p>Generated on: {{generatedDate}}</p>
    </div>
</body>
</html>`
}

/**
 * Escape HTML characters to prevent XSS
 * @param text - Text to escape
 * @returns Escaped HTML string
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Generate invoice PDF and save to database
 * @param orderData - Order information
 * @returns Promise<string> - Base64 encoded PDF
 */
export async function generateAndStoreInvoicePDF(orderData: OrderData): Promise<string> {
  try {
    // Generate PDF as base64 string
    const base64PDF = await generateInvoicePDF(orderData, {
      returnBase64: true,
      format: 'A4'
    }) as string

    // Here you can add logic to save the base64 string to your database
    // Example:
    // await supabase
    //   .from('invoices')
    //   .insert({
    //     order_id: orderData.id,
    //     pdf_data: base64PDF,
    //     generated_at: new Date().toISOString()
    //   })

    return base64PDF

  } catch (error) {
    console.error('Error generating and storing invoice PDF:', error)
    throw error
  }
}

/**
 * Convert base64 PDF back to buffer for download
 * @param base64PDF - Base64 encoded PDF string
 * @returns Buffer - PDF buffer for download
 */
export function base64ToBuffer(base64PDF: string): Buffer {
  return Buffer.from(base64PDF, 'base64')
}

/**
 * Validate order data before PDF generation
 * @param orderData - Order data to validate
 * @returns boolean - True if valid
 */
export function validateOrderData(orderData: any): orderData is OrderData {
  return (
    orderData &&
    typeof orderData.id === 'string' &&
    typeof orderData.customer_phone === 'string' &&
    typeof orderData.total_amount === 'number' &&
    typeof orderData.status === 'string' &&
    typeof orderData.payment_status === 'string' &&
    typeof orderData.created_at === 'string' &&
    typeof orderData.table_number === 'string'
  )
}

export default generateInvoicePDF