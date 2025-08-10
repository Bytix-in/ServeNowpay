import { NextRequest, NextResponse } from 'next/server'
import { generateDynamicInvoice, validateOrderForInvoice } from '@/lib/dynamicInvoiceGenerator'

/**
 * Download invoice endpoint - generates invoice on-demand from immutable order data
 * NO STORAGE - always fresh and accurate, generated from order details
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId, customerPhone } = await request.json()

    if (!orderId || !customerPhone) {
      return NextResponse.json(
        { error: 'Order ID and customer phone are required' },
        { status: 400 }
      )
    }

    // Validate order eligibility
    const validation = await validateOrderForInvoice(orderId)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Verify customer phone matches (security check)
    const { supabase } = await import('@/lib/supabase')
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('customer_phone, unique_order_id')
      .eq('id', orderId)
      .single()

    if (orderError || !order || order.customer_phone !== customerPhone) {
      return NextResponse.json(
        { error: 'Order not found or phone number mismatch' },
        { status: 404 }
      )
    }

    console.log(`🧾 Generating fresh invoice for order: ${orderId}`)

    // Generate fresh invoice from immutable order data (NO STORAGE)
    const htmlContent = await generateDynamicInvoice(orderId)

    console.log(`✅ Fresh invoice generated for order: ${orderId}`)

    // Return HTML content optimized for printing/viewing
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store', // Always fresh - no caching
        'X-Invoice-Source': 'fresh-generation',
        'X-Invoice-Order': order.unique_order_id || orderId.slice(-8)
      }
    })

  } catch (error) {
    console.error('Error generating fresh invoice:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate invoice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Fallback invoice generation optimized for printing
function generateFallbackInvoice(order: any): string {
  const formatCurrency = (amount: number) => `Rs. ${amount.toFixed(2)}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('en-IN');

  // Calculate subtotal from items
  const subtotal = order.items && order.items.length > 0 
    ? order.items.reduce((sum: number, item: any) => sum + (item.total || (item.price * item.quantity) || 0), 0)
    : order.total_amount * (100/102); // Reverse calculate if no items
  
  // Calculate payment gateway charge (2%)
  const paymentGatewayCharge = subtotal * 0.02;
  
  const totalAmount = order.total_amount;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${order.unique_order_id}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            margin: 0;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #8b5cf6; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .header h1 { 
            color: #8b5cf6; 
            margin: 0; 
            font-size: 2.5em; 
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
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
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
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #666;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .header { page-break-after: avoid; }
            table { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>INVOICE</h1>
        <p>Order #${order.unique_order_id}</p>
    </div>

    <div class="invoice-info">
        <div class="info-section">
            <h3>Restaurant Details</h3>
            <p><strong>Name:</strong> ${order.restaurants?.name || 'Restaurant'}</p>
            <p><strong>Address:</strong> ${order.restaurants?.address || 'Restaurant Address'}</p>
            <p><strong>Phone:</strong> ${order.restaurants?.phone_number || 'Restaurant Phone'}</p>
        </div>
        
        <div class="info-section">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${order.customer_name}</p>
            <p><strong>Phone:</strong> +91 ${order.customer_phone}</p>
            <p><strong>Table:</strong> ${order.table_number}</p>
            <p><strong>Date:</strong> ${formatDate(order.created_at)}</p>
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
            ${order.items && order.items.length > 0 ? order.items.map((item: any) => `
                <tr>
                    <td><strong>${item.dish_name || 'Unknown Item'}</strong></td>
                    <td style="text-align: center;">${item.quantity || 1}</td>
                    <td style="text-align: right;">${formatCurrency(item.price || 0)}</td>
                    <td style="text-align: right;">${formatCurrency(item.total || (item.price * item.quantity) || 0)}</td>
                </tr>
            `).join('') : `
                <tr>
                    <td colspan="4" style="text-align: center; color: #666; padding: 20px;">
                        No item details available
                    </td>
                </tr>
            `}
        </tbody>
    </table>

    <div class="tax-breakdown">
        <div class="tax-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(subtotal)}</span>
        </div>
        
        <div class="tax-row">
            <span>Payment Gateway Charge (2%):</span>
            <span>${formatCurrency(paymentGatewayCharge)}</span>
        </div>

        <div class="tax-row tax-total">
            <span>Total Amount:</span>
            <span>${formatCurrency(totalAmount)}</span>
        </div>
    </div>

    <div class="footer">
        <p><strong>ServeNow</strong> - Digital Restaurant Ordering System</p>
        <p>www.servenow.in</p>
        <p>This is a computer-generated invoice.</p>
        <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
    </div>
</body>
</html>
  `;
}