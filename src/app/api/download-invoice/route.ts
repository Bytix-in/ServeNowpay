import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateInvoicePDF, validateOrderData } from '@/lib/generateInvoicePDF'

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerPhone } = await request.json()

    if (!orderId || !customerPhone) {
      return NextResponse.json(
        { error: 'Order ID and customer phone are required' },
        { status: 400 }
      )
    }

    // Fetch order details from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        unique_order_id,
        customer_name,
        customer_phone,
        total_amount,
        status,
        payment_status,
        created_at,
        table_number,
        items,
        invoice_base64,
        invoice_generated,
        restaurants (
          name,
          address,
          phone_number,
          email
        )
      `)
      .eq('id', orderId)
      .eq('customer_phone', customerPhone)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if payment is completed
    if (order.payment_status !== 'completed') {
      return NextResponse.json(
        { error: 'Payment not completed yet' },
        { status: 400 }
      )
    }

    let pdfBuffer: Buffer | null = null;

    // For printing, we'll always generate HTML content for better compatibility
    let htmlContent = '';

    // First, try to use existing invoice if available and it's HTML
    if (order.invoice_base64) {
      try {
        const base64Data = order.invoice_base64;
        
        // Check if it's HTML (not PDF)
        if (!base64Data.startsWith('JVBERi0')) {
          // It's HTML, decode and use it
          htmlContent = Buffer.from(base64Data, 'base64').toString('utf8');
        }
      } catch (error) {
        console.error('Error processing existing invoice:', error);
      }
    }

    // If we don't have HTML content yet, generate it
    if (!htmlContent) {
      // Validate order data
      if (!validateOrderData(order)) {
        return NextResponse.json(
          { error: 'Invalid order data' },
          { status: 400 }
        )
      }

      try {
        // Try to generate invoice (this might return HTML or PDF)
        const result = await generateInvoicePDF(order, {
          returnBase64: true,
          format: 'A4'
        });

        if (typeof result === 'string') {
          // It's base64 data, check if it's HTML or PDF
          const base64Data = result;
          
          if (base64Data.startsWith('JVBERi0')) {
            // It's a PDF, but we need HTML for printing, so generate fallback
            htmlContent = generateFallbackInvoice(order);
          } else {
            // It's HTML, decode it
            htmlContent = Buffer.from(base64Data, 'base64').toString('utf8');
          }
          
          // Store the result in the database
          await supabase
            .from('orders')
            .update({
              invoice_base64: base64Data,
              invoice_generated: true,
              invoice_generated_at: new Date().toISOString()
            })
            .eq('id', orderId);
            
        } else {
          // Fallback to simple HTML invoice
          htmlContent = generateFallbackInvoice(order);
        }
      } catch (error) {
        console.error('Error generating invoice:', error);
        
        // Final fallback - generate simple HTML invoice
        htmlContent = generateFallbackInvoice(order);
      }
    }

    // Return HTML content optimized for printing
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error downloading invoice:', error)
    return NextResponse.json(
      { error: 'Failed to download invoice' },
      { status: 500 }
    )
  }
}

// Fallback invoice generation optimized for printing
function generateFallbackInvoice(order: any): string {
  const formatCurrency = (amount: number) => `Rs. ${amount.toFixed(2)}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('en-IN');

  // Calculate GST breakdown
  const totalAmount = order.total_amount;
  const subtotal = Math.round((totalAmount / 1.05) * 100) / 100;
  const cgst = Math.round(((subtotal * 0.025) * 100)) / 100;
  const sgst = Math.round(((subtotal * 0.025) * 100)) / 100;

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
  `;
}