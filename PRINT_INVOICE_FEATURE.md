# Print Invoice Feature Added to Analytics Page

## Overview
Added "Print Invoice" functionality to the detailed orders table in the restaurant analytics page, allowing restaurants to generate and download PDF invoices for completed orders directly from the analytics dashboard.

## Features Added

### 1. Print Invoice Button
- **Location**: Added as a new "Actions" column in the detailed orders table
- **Visibility**: Only shows for orders with `payment_status === 'completed'`
- **Styling**: Green-themed button with download icon to match the payment completion status

### 2. Invoice Generation
- **PDF Generation**: Uses the existing `/api/dynamic-invoice` endpoint
- **File Naming**: Downloads as `invoice-{order_id}.pdf`
- **Loading State**: Shows "Generating..." with spinning icon during PDF creation
- **Error Handling**: Displays user-friendly error messages if generation fails

### 3. User Experience
- **Individual Order Processing**: Each order has its own print button
- **Loading Indicators**: Visual feedback during invoice generation
- **Disabled State**: Button is disabled while generating to prevent multiple requests
- **Fallback Display**: Shows "Payment pending" for non-completed orders

## Technical Implementation

### Frontend Changes
- **State Management**: Added `downloadingInvoice` state to track which invoice is being generated
- **Print Function**: `printInvoice()` function handles the API call and file download
- **Table Structure**: Added "Actions" column header and corresponding table cells
- **Conditional Rendering**: Shows button only for completed payments

### Backend Integration
- **Existing API**: Leverages the existing `/api/dynamic-invoice` endpoint
- **POST Request**: Sends order ID and customer phone for invoice generation
- **PDF Response**: Handles blob response and triggers automatic download

## Code Changes

### Analytics Page (`/src/app/restaurant/analytics/page.tsx`)
1. **Added State**: `downloadingInvoice` to track loading state
2. **Added Function**: `printInvoice()` for invoice generation and download
3. **Modified Table**: Added "Actions" column header
4. **Added Button**: Print invoice button with loading states and conditional rendering

### Table Structure
```tsx
// New Actions column header
<th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>

// New Actions column cell with print button
<td className="py-3 px-4">
  <div className="flex items-center gap-2">
    {order.payment_status === 'completed' ? (
      <Button onClick={() => printInvoice(order)} ... >
        Print Invoice
      </Button>
    ) : (
      <span>Payment pending</span>
    )}
  </div>
</td>
```

## User Interface

### Button States
1. **Default State**: Green "Print Invoice" button with download icon
2. **Loading State**: "Generating..." text with spinning refresh icon
3. **Disabled State**: Button disabled during generation to prevent duplicate requests
4. **Unavailable State**: "Payment pending" text for non-completed orders

### Visual Design
- **Color Scheme**: Green theme to match completed payment status
- **Icons**: Download icon for default state, spinning refresh for loading
- **Size**: Small button size to fit well in table layout
- **Hover Effects**: Green background on hover for better interactivity

## Functionality

### Invoice Generation Process
1. **User clicks** "Print Invoice" button
2. **Loading state** activates with spinning icon
3. **API call** made to `/api/dynamic-invoice` with order details
4. **PDF generated** on server side
5. **File downloaded** automatically to user's device
6. **Loading state** cleared after completion

### Error Handling
- **Network Errors**: Displays "Failed to generate invoice" alert
- **API Errors**: Handles server-side errors gracefully
- **User Feedback**: Clear error messages for troubleshooting

## Benefits

### For Restaurants
- **Quick Access**: Generate invoices directly from analytics view
- **Batch Processing**: Can generate multiple invoices while reviewing analytics
- **Historical Access**: Print invoices for any completed order in the selected date range
- **Integrated Workflow**: No need to navigate to separate pages

### For Users
- **Intuitive Interface**: Clear visual indicators for available actions
- **Responsive Design**: Works on both desktop and mobile devices
- **Fast Processing**: Efficient PDF generation and download
- **Professional Output**: High-quality PDF invoices for record keeping

## Security & Performance
- **Authentication**: Requires restaurant login to access
- **Data Isolation**: Only restaurant's own orders are accessible
- **Efficient Processing**: Leverages existing optimized invoice generation system
- **Error Recovery**: Graceful handling of failed requests

The print invoice feature is now fully integrated into the analytics page, providing restaurants with convenient access to generate PDF invoices for all their completed orders directly from the analytics dashboard.