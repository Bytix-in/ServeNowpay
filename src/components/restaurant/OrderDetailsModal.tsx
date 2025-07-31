"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

interface OrderDetails {
  id: string;
  customer_name: string;
  customer_phone: string;
  table_number: string;
  items: any[];
  total_amount: number;
  status: string;
  payment_status: string;
  payment_id?: string;
  payment_gateway_order_id?: string;
  unique_order_id: string;
  created_at: string;
  updated_at: string;
  restaurant_id: string;
}



export default function OrderDetailsModal({ isOpen, onClose, orderId }: OrderDetailsModalProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      setOrder(orderData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'served': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'verifying': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'not_configured': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'New Order';
      case 'in_progress': return 'Preparing';
      case 'completed': return 'Ready';
      case 'served': return 'Served';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Paid';
      case 'pending': return 'Payment Pending';
      case 'verifying': return 'Verifying Payment';
      case 'failed': return 'Payment Failed';
      case 'not_configured': return 'Payment Not Configured';
      default: return status;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl print-content"
        >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <p className="text-gray-500 text-sm">Complete order and payment information</p>
          </div>
          <div className="flex items-center gap-3 no-print">
            <button
              onClick={() => fetchOrderDetails(true)}
              disabled={refreshing}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <span className={refreshing ? "animate-spin" : ""}>🔄</span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 text-sm"
            >
              <span>🖨️</span>
              Print
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 font-semibold mb-2">Error Loading Order</p>
              <p className="text-gray-600 text-center">{error}</p>
              <button
                onClick={fetchOrderDetails}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">#{order.unique_order_id}</h3>
                    <p className="text-gray-600">Order placed on {formatDateTime(order.created_at)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(order.payment_status)}`}>
                      {getPaymentStatusLabel(order.payment_status)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <h4 className="font-semibold text-gray-700 mb-2">Customer Information</h4>
                    <p className="font-medium text-gray-900">{order.customer_name}</p>
                    <p className="text-gray-600">{order.customer_phone}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <h4 className="font-semibold text-gray-700 mb-2">Table Information</h4>
                    <p className="font-medium text-gray-900">Table {order.table_number}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <h4 className="font-semibold text-gray-700 mb-2">Order Total</h4>
                    <p className="font-bold text-2xl text-green-600">{formatCurrency(order.total_amount)}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.dish_name || item.name}</h4>
                          <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                          <p className="text-gray-600 text-sm">Unit Price: {formatCurrency(item.price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(item.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                      <span className="text-xl font-bold text-green-600">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Payment Status</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                            {getPaymentStatusLabel(order.payment_status)}
                          </span>
                        </div>
                        
                        {order.payment_status === 'completed' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">✅</span>
                              <span className="text-green-800 font-medium">Payment Successful</span>
                            </div>
                            <p className="text-green-700 text-sm mt-1">
                              Customer has successfully paid {formatCurrency(order.total_amount)}
                            </p>
                          </div>
                        )}
                        
                        {order.payment_status === 'pending' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-600">⏳</span>
                              <span className="text-yellow-800 font-medium">Payment Pending</span>
                            </div>
                            <p className="text-yellow-700 text-sm mt-1">
                              Waiting for customer to complete payment
                            </p>
                          </div>
                        )}
                        
                        {order.payment_status === 'failed' && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-red-600">❌</span>
                              <span className="text-red-800 font-medium">Payment Failed</span>
                            </div>
                            <p className="text-red-700 text-sm mt-1">
                              Payment could not be processed. Customer may need to retry.
                            </p>
                          </div>
                        )}
                        
                        {order.payment_id && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment ID:</span>
                            <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                              {order.payment_id}
                            </span>
                          </div>
                        )}
                        {order.payment_gateway_order_id && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gateway Order ID:</span>
                            <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                              {order.payment_gateway_order_id}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Amount Breakdown</h4>
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Items Total:</span>
                              <span className="text-gray-900">{formatCurrency(order.total_amount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Taxes & Fees:</span>
                              <span className="text-gray-900">₹0.00</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Discount:</span>
                              <span className="text-gray-900">₹0.00</span>
                            </div>
                            <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-300">
                              <span className="text-gray-900">Final Amount:</span>
                              <span className="text-green-600">{formatCurrency(order.total_amount)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {order.payment_status === 'completed' && (
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
                              <span>💳</span>
                              <span className="font-medium">Amount Received</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Order Timeline</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Order Created</p>
                        <p className="text-sm text-gray-600">{formatDateTime(order.created_at)}</p>
                      </div>
                    </div>
                    
                    {order.updated_at !== order.created_at && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">Last Updated</p>
                          <p className="text-sm text-gray-600">{formatDateTime(order.updated_at)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>


            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <p className="text-gray-600">Order not found</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
    </>
  );
}