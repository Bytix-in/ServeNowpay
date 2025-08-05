"use client";

import React from 'react';

export interface InvoiceItem {
  dish_name: string;
  dish_description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  dish_type?: string;
}

export interface InvoiceData {
  order_id: string;
  unique_order_id: string;
  customer_name: string;
  customer_phone: string;
  table_number: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  order_date: string;
  restaurant_name: string;
  restaurant_address?: string;
  restaurant_phone?: string;
  restaurant_email?: string;
  subtotal: number;
  items: InvoiceItem[];
}

interface InvoiceTemplateProps {
  data: InvoiceData;
}

export const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ data }, ref) => {
    const formatCurrency = (amount: number): string => `₹${amount.toFixed(2)}`;
    
    const formatDate = (dateString: string): string => {
      return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    const getStatusBadgeStyle = (status: string) => {
      return { 
        backgroundColor: '#f3f4f6', 
        color: '#374151',
        border: '1px solid #d1d5db'
      };
    };

    const formatStatus = (status: string): string => {
      return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    };

    return (
      <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto font-sans text-gray-800">
        {/* Header */}
        <div className="text-center border-b-4 border-purple-600 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">INVOICE</h1>
          <p className="text-lg text-gray-600">Order #{data.unique_order_id}</p>
        </div>

        {/* Status Badges */}
        <div className="flex justify-center gap-4 mb-8">
          <span 
            className="px-4 py-2 rounded-full text-sm font-semibold"
            style={getStatusBadgeStyle(data.order_status)}
          >
            Order: {formatStatus(data.order_status)}
          </span>
          <span 
            className="px-4 py-2 rounded-full text-sm font-semibold"
            style={getStatusBadgeStyle(data.payment_status)}
          >
            Payment: {formatStatus(data.payment_status)}
          </span>
        </div>

        {/* Restaurant and Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-600 mb-4 border-b-2 border-gray-200 pb-2">
              Restaurant Details
            </h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {data.restaurant_name}</p>
              <p><span className="font-medium">Address:</span> {data.restaurant_address || 'Address not available'}</p>
              <p><span className="font-medium">Phone:</span> {data.restaurant_phone || 'Phone not available'}</p>

            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-600 mb-4 border-b-2 border-gray-200 pb-2">
              Customer Details
            </h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {data.customer_name}</p>
              <p><span className="font-medium">Phone:</span> +91 {data.customer_phone}</p>
              <p><span className="font-medium">Table:</span> {data.table_number}</p>
              <p><span className="font-medium">Date:</span> {formatDate(data.order_date)}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-purple-600 mb-4">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="border border-gray-300 px-4 py-3 text-left">Item Details</th>
                  <th className="border border-gray-300 px-4 py-3 text-center">Qty</th>
                  <th className="border border-gray-300 px-4 py-3 text-right">Unit Price</th>
                  <th className="border border-gray-300 px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length > 0 ? (
                  data.items.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 px-4 py-3">
                        <div>
                          <div className="font-medium">{item.dish_name}</div>
                          {item.dish_description && (
                            <div className="text-sm text-gray-600">{item.dish_description}</div>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-medium">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      No item details available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tax Summary */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold text-purple-600 mb-4">Amount Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(data.subtotal)}</span>
            </div>

            <div className="border-t-2 border-purple-600 pt-3 mt-3">
              <div className="flex justify-between items-center text-xl font-bold text-purple-600">
                <span>Total Amount:</span>
                <span>{formatCurrency(data.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t-2 border-gray-200 pt-6 text-gray-600">
          <p className="text-lg font-semibold text-purple-600 mb-2">ServeNowPay</p>
          <p className="text-sm">Digital Restaurant Ordering System</p>
          <p className="text-sm">This is a computer-generated invoice. No signature required.</p>
          <div className="mt-4 text-xs">
            <p>Generated on: {new Date().toLocaleString('en-IN')}</p>
            <p className="text-purple-600 font-medium">⚡ Fresh Invoice - Generated from order data</p>
          </div>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = 'InvoiceTemplate';