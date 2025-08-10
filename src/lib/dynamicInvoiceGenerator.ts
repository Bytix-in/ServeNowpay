/**
 * Dynamic Invoice Generator - ServeNow System
 * 
 * This module generates invoices on-demand using only immutable data from:
 * - orders table (customer info, totals, timestamps)
 * - order_items table (item snapshots at time of purchase)
 * - restaurants table (restaurant details)
 * 
 * NO STORAGE WHATSOEVER - invoices are generated fresh every time
 * This ensures accuracy, saves storage, and maintains data consistency
 */

import { supabase } from '@/lib/supabase'

export interface OrderItemData {
  dish_name: string
  dish_description?: string
  quantity: number
  unit_price: number
  total_price: number
  dish_type?: string
}

export interface InvoiceData {
  order_id: string
  unique_order_id: string
  customer_name: string
  customer_phone: string
  table_number: string
  total_amount: number
  order_status: string
  payment_status: string
  order_date: string
  restaurant_name: string
  restaurant_address?: string
  restaurant_phone?: string
  restaurant_email?: string
  subtotal: number
  payment_gateway_charge: number
  items: OrderItemData[]
}

/**
 * Fetch invoice data dynamically from database
 * Uses only immutable order data - no stored PDFs or base64
 */
export async function fetchInvoiceData(orderId: string): Promise<InvoiceData> {
  try {
    // Fetch order with restaurant details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        unique_order_id,
        customer_name,
        customer_phone,
        table_number,
        total_amount,
        status,
        payment_status,
        payment_method,
        created_at,
        restaurants (
          name,
          address,
          phone_number,
          email
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderId}`)
    }

    // Fetch order items (immutable snapshots)
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        dish_name,
        dish_description,
        quantity,
        unit_price,
        total_price,
        dish_type
      `)
      .eq('order_id', orderId)
      .order('created_at')

    if (itemsError) {
      throw new Error(`Failed to fetch order items: ${itemsError.message}`)
    }

    // If no items in order_items table, try to extract from JSONB (migration fallback)
    let items: OrderItemData[] = orderItems || []
    
    if (items.length === 0) {
      // Check JSONB fallback for order items
      
      // Fetch the JSONB items from orders table
      const { data: orderWithItems, error: itemsError } = await supabase
        .from('orders')
        .select('items')
        .eq('id', orderId)
        .single()
      
      if (orderWithItems?.items) {
        try {
          const jsonbItems = Array.isArray(orderWithItems.items) ? orderWithItems.items : JSON.parse(orderWithItems.items)
          items = jsonbItems.map((item: any) => ({
            dish_name: item.dish_name || item.name || 'Unknown Item',
            dish_description: item.description || item.dish_description,
            quantity: item.quantity || 1,
            unit_price: item.price || item.unit_price || 0,
            total_price: item.total || item.total_price || (item.price * item.quantity) || 0,
            dish_type: item.dish_type
          }))
        } catch (parseError) {
          items = []
        }
      }
    }

    // Calculate subtotal from order items
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
    
    // For online payments, calculate gateway charge from subtotal
    // For cash payments, no gateway charge
    const paymentGatewayCharge = (order.payment_method === 'online') ? subtotal * 0.02 : 0
    
    // Use the stored total amount from database (already calculated correctly during order placement)
    const totalAmount = order.total_amount

    const invoiceData = {
      order_id: order.id,
      unique_order_id: order.unique_order_id || order.id.slice(-8),
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      table_number: order.table_number,
      total_amount: totalAmount,
      order_status: order.status,
      payment_status: order.payment_status,
      payment_method: order.payment_method || 'online', // Default to online if null
      order_date: order.created_at,
      restaurant_name: order.restaurants?.name || 'Restaurant',
      restaurant_address: order.restaurants?.address,
      restaurant_phone: order.restaurants?.phone_number,
      restaurant_email: order.restaurants?.email,
      subtotal,
      payment_gateway_charge: paymentGatewayCharge,
      items
    }

    // Debug log to check payment method
    console.log('Invoice data payment_method:', invoiceData.payment_method)
    
    return invoiceData

  } catch (error) {
    throw error
  }
}

/**
 * Generate clean HTML invoice from immutable order data
 * No storage required - generated fresh every time
 */
export function generateInvoiceHTML(invoiceData: InvoiceData): string {
  const formatCurrency = (amount: number): string => `₹${amount.toFixed(2)}`
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

  // Generate items HTML
  const itemsHTML = invoiceData.items.length > 0 
    ? invoiceData.items.map((item) => `
        <tr>
          <td>
            <strong>${escapeHtml(item.dish_name)}</strong>
            ${item.dish_description ? `<br><small class="text-muted">${escapeHtml(item.dish_description)}</small>` : ''}
          </td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-right">${formatCurrency(item.unit_price)}</td>
          <td class="text-right"><strong>${formatCurrency(item.total_price)}</strong></td>
        </tr>
      `).join('')
    : `
        <tr>
          <td colspan="4" class="text-center text-muted">
            <em>No item details available</em>
          </td>
        </tr>
      `

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${invoiceData.unique_order_id}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #8b5cf6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #8b5cf6;
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header .subtitle {
            color: #666666;
            font-size: 1.1rem;
        }
        
        .invoice-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .info-section h3 {
            color: #8b5cf6;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-size: 1.2rem;
        }
        
        .info-section p {
            margin: 8px 0;
            font-size: 0.95rem;
        }
        
        .info-section strong {
            color: #374151;
        }
        
        .status-badges {
            text-align: center;
            margin: 20px 0;
        }
        
        .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            margin: 0 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-completed { background-color: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
        .status-pending { background-color: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
        .status-failed { background-color: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        th, td {
            padding: 15px 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        th {
            background-color: #8b5cf6;
            color: white;
            font-weight: 600;
            font-size: 0.95rem;
        }
        
        tbody tr:nth-child(even) {
            background-color: #f9fafb;
        }
        
        tbody tr:hover {
            background-color: #f3f4f6;
        }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-muted { color: #6b7280; }
        
        .tax-summary {
            background-color: #f8fafc;
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
            border: 1px solid #e2e8f0;
        }
        
        .tax-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 10px 0;
            font-size: 1rem;
        }
        
        .tax-total {
            border-top: 2px solid #8b5cf6;
            padding-top: 15px;
            margin-top: 15px;
            font-weight: 700;
            font-size: 1.4rem;
            color: #8b5cf6;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
        }
        
        .footer p {
            margin: 8px 0;
        }
        
        .footer .brand {
            color: #8b5cf6;
            font-weight: 600;
        }
        
        .generated-info {
            font-size: 0.85rem;
            color: #9ca3af;
            margin-top: 15px;
        }
        
        @media print {
            body { margin: 0; padding: 15px; }
            .header { page-break-after: avoid; }
            table { page-break-inside: avoid; }
            .tax-summary { page-break-inside: avoid; }
        }
        
        @media (max-width: 600px) {
            .invoice-grid { 
                grid-template-columns: 1fr; 
                gap: 20px; 
            }
            .header h1 { font-size: 2rem; }
            th, td { padding: 10px 8px; }
            .tax-summary { padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>INVOICE</h1>
        <p class="subtitle">Order #${invoiceData.unique_order_id}</p>
    </div>

    <div class="status-badges">
        <span class="status-badge status-${getStatusClass(invoiceData.order_status)}">
            Order: ${formatStatus(invoiceData.order_status)}
        </span>
        <span class="status-badge status-${getStatusClass(invoiceData.payment_status)}">
            Payment: ${formatStatus(invoiceData.payment_status)}
        </span>
        ${invoiceData.payment_method ? `
        <span class="status-badge ${invoiceData.payment_method === 'cash' ? 'status-completed' : 'status-pending'}">
            Method: ${invoiceData.payment_method === 'cash' ? 'Cash Payment' : 'Online Payment'}
        </span>
        ` : ''}
    </div>

    <div class="invoice-grid">
        <div class="info-section">
            <h3>Restaurant Details</h3>
            <p><strong>Name:</strong> ${escapeHtml(invoiceData.restaurant_name)}</p>
            <p><strong>Address:</strong> ${escapeHtml(invoiceData.restaurant_address || 'Address not available')}</p>
            <p><strong>Phone:</strong> ${escapeHtml(invoiceData.restaurant_phone || 'Phone not available')}</p>

        </div>
        
        <div class="info-section">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${escapeHtml(invoiceData.customer_name)}</p>
            <p><strong>Phone:</strong> +91 ${invoiceData.customer_phone}</p>
            <p><strong>Table:</strong> ${escapeHtml(invoiceData.table_number)}</p>
            <p><strong>Date:</strong> ${formatDate(invoiceData.order_date)}</p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Item Details</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${itemsHTML}
        </tbody>
    </table>

    <div class="tax-summary">
        <div class="tax-row">
            <span>Subtotal:</span>
            <span><strong>${formatCurrency(invoiceData.subtotal)}</strong></span>
        </div>
        
        ${invoiceData.payment_method === 'online' && invoiceData.payment_gateway_charge > 0 ? `
        <div class="tax-row">
            <span>Payment Gateway Charge (2%):</span>
            <span><strong>${formatCurrency(invoiceData.payment_gateway_charge)}</strong></span>
        </div>
        ` : ''}

        <div class="tax-row tax-total">
            <span>Total Amount:</span>
            <span>${formatCurrency(invoiceData.total_amount)}</span>
        </div>
    </div>

    <div class="footer">
        <p><span class="brand">ServeNow</span> - Digital Restaurant Ordering System</p>
        <p>www.servenow.in</p>
        <p>This is a computer-generated invoice. No signature required.</p>
        <div class="generated-info">
            <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
        </div>
    </div>
</body>
</html>`

  function getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'served': return 'completed'
      case 'pending': return 'pending'
      case 'failed':
      case 'cancelled': return 'failed'
      default: return 'pending'
    }
  }

  function formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
  }
}

/**
 * Escape HTML characters to prevent XSS
 */
function escapeHtml(text: string): string {
  if (!text) return ''
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
 * Generate invoice on-demand (no storage)
 * This is the main function to use for invoice generation
 */
export async function generateDynamicInvoice(orderId: string): Promise<string> {
  try {
    // Fetch fresh data from immutable tables
    const invoiceData = await fetchInvoiceData(orderId)
    
    // Generate HTML invoice
    const htmlInvoice = generateInvoiceHTML(invoiceData)
    return htmlInvoice
    
  } catch (error) {
    throw new Error(`Failed to generate invoice: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Validate if order is eligible for invoice generation
 */
export async function validateOrderForInvoice(orderId: string): Promise<{
  isValid: boolean
  error?: string
  orderData?: any
}> {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, payment_status, status')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return {
        isValid: false,
        error: 'Order not found'
      }
    }

    if (order.payment_status !== 'completed') {
      return {
        isValid: false,
        error: 'Payment not completed'
      }
    }

    return {
      isValid: true,
      orderData: order
    }

  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}