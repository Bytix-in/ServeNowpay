/**
 * Fallback invoice generation without Puppeteer
 * Uses a simple text-based approach when PDF generation fails
 */

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
    phone_number?: string
    email?: string
  }
}

/**
 * Generate a simple HTML invoice that can be converted to PDF later
 * This is a fallback when Puppeteer fails
 */
export function generateSimpleInvoiceHTML(orderData: OrderData): string {
  const formatCurrency = (amount: number): string => {
    // Use simple formatting to avoid encoding issues
    return `Rs. ${amount.toFixed(2)}`
  }

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

  // Calculate GST
  const totalAmount = orderData.total_amount
  const subtotal = Math.round((totalAmount / 1.05) * 100) / 100
  const cgst = Math.round(((subtotal * 0.025) * 100)) / 100
  const sgst = Math.round(((subtotal * 0.025) * 100)) / 100

  // Generate items HTML
  const itemsHTML = orderData.items && orderData.items.length > 0 
    ? orderData.items.map((item) => `
        <tr>
          <td>${item.dish_name}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">${formatCurrency(item.price || 0)}</td>
          <td style="text-align: right;">${formatCurrency(item.total || (item.price * item.quantity) || 0)}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4" style="text-align: center;">No items available</td></tr>'

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Invoice - ${orderData.unique_order_id || orderData.id.slice(-8)}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&display=swap');
        
        body {
          font-family: 'Noto Sans', Arial, 'DejaVu Sans', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
          color: #333;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #8b5cf6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #8b5cf6;
          font-size: 2.5em;
          margin: 0;
        }
        .invoice-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        .info-section h3 {
          color: #8b5cf6;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .info-section p {
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
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
        .total-section {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .total-section h3 {
          margin: 0 0 10px 0;
        }
        .total-amount {
          font-size: 2em;
          font-weight: bold;
          margin: 10px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          color: #666;
        }
        .tax-breakdown {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .tax-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .tax-total {
          border-top: 2px solid #333;
          padding-top: 10px;
          margin-top: 10px;
          font-weight: bold;
          font-size: 1.2em;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>INVOICE</h1>
        <p>Order #${orderData.unique_order_id || orderData.id.slice(-8)}</p>
      </div>

      <div class="invoice-info">
        <div class="info-section">
          <h3>Restaurant Details</h3>
          <p><strong>Name:</strong> ${orderData.restaurants?.name || 'Unknown Restaurant'}</p>
          <p><strong>Address:</strong> ${orderData.restaurants?.address || 'Address not available'}</p>
          <p><strong>Phone:</strong> ${orderData.restaurants?.phone_number || 'Phone not available'}</p>
        </div>
        
        <div class="info-section">
          <h3>Customer Details</h3>
          <p><strong>Name:</strong> ${orderData.customer_name || 'Customer'}</p>
          <p><strong>Phone:</strong> +91 ${orderData.customer_phone}</p>
          <p><strong>Table:</strong> ${orderData.table_number}</p>
          <p><strong>Date:</strong> ${formatDate(orderData.created_at)}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="tax-breakdown">
        <div class="tax-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        <div class="tax-row">
          <span>CGST @2.5%:</span>
          <span>${formatCurrency(cgst)}</span>
        </div>
        <div class="tax-row">
          <span>SGST @2.5%:</span>
          <span>${formatCurrency(sgst)}</span>
        </div>
        <div class="tax-row tax-total">
          <span>Total Amount:</span>
          <span>${formatCurrency(totalAmount)}</span>
        </div>
      </div>

      <div class="footer">
        <p><strong>ServeNowPay</strong> - Digital Restaurant Ordering System</p>
        <p>This is a computer-generated invoice.</p>
        <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate invoice data as a structured object (for database storage)
 * This can be used when PDF generation completely fails
 */
export function generateInvoiceData(orderData: OrderData) {
  const totalAmount = orderData.total_amount
  const subtotal = Math.round((totalAmount / 1.05) * 100) / 100
  const cgst = Math.round(((subtotal * 0.025) * 100)) / 100
  const sgst = Math.round(((subtotal * 0.025) * 100)) / 100

  return {
    invoiceNumber: orderData.unique_order_id || orderData.id.slice(-8),
    orderData: {
      id: orderData.id,
      customer: {
        name: orderData.customer_name || 'Customer',
        phone: orderData.customer_phone,
      },
      restaurant: {
        name: orderData.restaurants?.name || 'Unknown Restaurant',
        address: orderData.restaurants?.address || 'Address not available',
        phone: orderData.restaurants?.phone_number || 'Phone not available',
      },
      orderDetails: {
        tableNumber: orderData.table_number,
        status: orderData.status,
        paymentStatus: orderData.payment_status,
        createdAt: orderData.created_at,
      },
      items: orderData.items || [],
      totals: {
        subtotal,
        cgst,
        sgst,
        total: totalAmount
      }
    },
    generatedAt: new Date().toISOString(),
    format: 'structured-data'
  }
}

/**
 * Convert structured invoice data back to HTML
 */
export function structuredDataToHTML(invoiceData: any): string {
  // This would convert the structured data back to HTML
  // Implementation would be similar to generateSimpleInvoiceHTML
  // but using the structured data format
  return generateSimpleInvoiceHTML(invoiceData.orderData)
}