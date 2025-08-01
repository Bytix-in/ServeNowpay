# Invoice PDF Generation Utility - Usage Examples

This document demonstrates how to use the `generateInvoicePDF` utility for creating PDF invoices.

## Basic Usage

### 1. Generate PDF as Buffer (for immediate download)

```typescript
import { generateInvoicePDF } from '@/lib/generateInvoicePDF'

const orderData = {
  id: 'order-123',
  unique_order_id: 'ORD-2024-001',
  customer_name: 'John Doe',
  customer_phone: '9876543210',
  total_amount: 850.00,
  status: 'completed',
  payment_status: 'completed',
  created_at: '2024-01-15T14:30:00Z',
  table_number: '5',
  items: [
    {
      dish_name: 'Chicken Biryani',
      quantity: 2,
      price: 300.00,
      total: 600.00
    },
    {
      dish_name: 'Raita',
      quantity: 1,
      price: 50.00,
      total: 50.00
    }
  ],
  restaurants: {
    name: 'Spice Garden Restaurant',
    address: '123 Food Street, Mumbai, Maharashtra 400001',
    phone: '+91-22-12345678',
    gst_number: '27ABCDE1234F1Z5'
  }
}

// Generate PDF as buffer for immediate download
const pdfBuffer = await generateInvoicePDF(orderData, {
  returnBase64: false,
  format: 'A4'
}) as Buffer
```

### 2. Generate PDF as Base64 (for database storage)

```typescript
// Generate PDF as base64 string for database storage
const base64PDF = await generateInvoicePDF(orderData, {
  returnBase64: true,
  format: 'A4'
}) as string

// Store in database
await supabase
  .from('invoices')
  .insert({
    order_id: orderData.id,
    customer_phone: orderData.customer_phone,
    pdf_data: base64PDF,
    invoice_number: orderData.unique_order_id,
    generated_at: new Date().toISOString()
  })
```

### 3. Generate and Save to File

```typescript
// Generate PDF and save to file system
await generateInvoicePDF(orderData, {
  returnBase64: false,
  format: 'A4',
  saveToFile: true,
  filename: `invoice-${orderData.unique_order_id}.pdf`
})
```

## Advanced Usage

### 4. Using the Store Invoice API

```typescript
// POST to store invoice in database
const response = await fetch('/api/store-invoice', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    orderId: 'order-123',
    customerPhone: '9876543210'
  })
})

const result = await response.json()
console.log('Invoice stored:', result.success)
```

### 5. Retrieve Stored Invoice

```typescript
// GET stored invoice as PDF download
const downloadUrl = `/api/store-invoice?orderId=order-123&customerPhone=9876543210`
window.open(downloadUrl, '_blank')
```

### 6. Convert Base64 back to Buffer

```typescript
import { base64ToBuffer } from '@/lib/generateInvoicePDF'

// Retrieve base64 from database
const { data: invoice } = await supabase
  .from('invoices')
  .select('pdf_data')
  .eq('order_id', 'order-123')
  .single()

// Convert back to buffer for download
const pdfBuffer = base64ToBuffer(invoice.pdf_data)

// Create download link
const blob = new Blob([pdfBuffer], { type: 'application/pdf' })
const url = URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
link.download = 'invoice.pdf'
link.click()
```

## Error Handling

### 7. Validate Order Data

```typescript
import { validateOrderData } from '@/lib/generateInvoicePDF'

if (!validateOrderData(orderData)) {
  throw new Error('Invalid order data provided')
}

try {
  const pdfBuffer = await generateInvoicePDF(orderData)
  // Handle success
} catch (error) {
  console.error('PDF generation failed:', error)
  // Handle error
}
```

## Integration Examples

### 8. In API Route

```typescript
// pages/api/download-invoice.ts
import { generateInvoicePDF } from '@/lib/generateInvoicePDF'

export default async function handler(req, res) {
  try {
    const { orderId } = req.query
    
    // Fetch order data from database
    const orderData = await fetchOrderData(orderId)
    
    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(orderData, {
      returnBase64: false
    }) as Buffer
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${orderId}.pdf"`)
    
    // Send PDF
    res.send(pdfBuffer)
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate invoice' })
  }
}
```

### 9. In React Component

```typescript
// components/InvoiceDownload.tsx
import { useState } from 'react'

export function InvoiceDownload({ orderId, customerPhone }) {
  const [downloading, setDownloading] = useState(false)
  
  const downloadInvoice = async () => {
    try {
      setDownloading(true)
      
      const response = await fetch('/api/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, customerPhone })
      })
      
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${orderId}.pdf`
      link.click()
      
      URL.revokeObjectURL(url)
      
    } catch (error) {
      alert('Failed to download invoice')
    } finally {
      setDownloading(false)
    }
  }
  
  return (
    <button onClick={downloadInvoice} disabled={downloading}>
      {downloading ? 'Generating...' : 'Download Invoice'}
    </button>
  )
}
```

## Configuration Options

### Available Options

```typescript
interface InvoicePDFOptions {
  format?: 'A4' | 'Letter'        // PDF page format
  returnBase64?: boolean           // Return base64 string or buffer
  saveToFile?: boolean            // Save to file system
  filename?: string               // Filename when saving to file
}
```

### Default Values

- `format`: 'A4'
- `returnBase64`: true
- `saveToFile`: false
- `filename`: undefined

## Template Customization

The utility uses `invoice-template.html` in the project root. You can customize:

- Styling (CSS)
- Layout structure
- Add new placeholders
- Modify GST calculations

### Available Placeholders

- `{{restaurantName}}` - Restaurant name
- `{{restaurantAddress}}` - Restaurant address
- `{{restaurantPhone}}` - Restaurant phone
- `{{restaurantGST}}` - Restaurant GST number
- `{{invoiceNumber}}` - Invoice/Order number
- `{{date}}` - Order date and time
- `{{tableNumber}}` - Table number
- `{{customerName}}` - Customer name
- `{{customerPhone}}` - Customer phone
- `{{orderStatus}}` - Order status
- `{{paymentStatus}}` - Payment status
- `{{items}}` - Order items (auto-generated table rows)
- `{{subtotal}}` - Subtotal before tax
- `{{cgst}}` - CGST amount (2.5%)
- `{{sgst}}` - SGST amount (2.5%)
- `{{total}}` - Total amount
- `{{generatedDate}}` - PDF generation timestamp

## Performance Tips

1. **Reuse Browser Instance**: For high-volume generation, consider reusing Puppeteer browser instances
2. **Caching**: Cache generated PDFs in database to avoid regeneration
3. **Background Processing**: Use job queues for bulk invoice generation
4. **Memory Management**: Monitor memory usage with large volumes

## Security Considerations

1. **Input Validation**: Always validate order data before generation
2. **Access Control**: Ensure users can only generate invoices for their orders
3. **XSS Prevention**: HTML escaping is built into the utility
4. **File Storage**: Secure storage of base64 PDF data in database