"use client";

import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { usePaidOrderNotifications } from '@/hooks/usePaidOrderNotifications';
import { useRealTimeOrders } from '@/hooks/useRealTimeOrders';
import { useWaiterCallNotifications } from '@/hooks/useWaiterCallNotifications';
import OrderDetailsModal from '@/components/restaurant/OrderDetailsModal';
import NotificationSetup from '@/components/restaurant/NotificationSetup';
import { notificationManager } from "@/utils/notifications";



interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  table_number: string | null;
  customer_address: string | null;
  customer_note: string | null;
  order_type: string;
  payment_method?: string;
  items: any[];
  total_amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'served';
  payment_status: 'pending' | 'verifying' | 'completed' | 'failed' | 'not_configured';
  unique_order_id: string;
  created_at: string;
  updated_at: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  dish_type: string;
  description?: string;
  is_available?: boolean;
  preparation_time?: number;
  ingredients?: string;
  tags?: string;
}

export default function OrdersManagementPage() {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  // Initialize paid order notifications (after user is available)
  usePaidOrderNotifications({
    restaurantId: user?.restaurantId || '',
    enabled: !!user?.restaurantId
  });

  // Initialize waiter call notifications
  const {
    calls: waiterCalls,
    loading: waiterCallsLoading,
    isConnected: waiterCallsConnected,
    updateCallStatus
  } = useWaiterCallNotifications({
    restaurantId: user?.restaurantId || '',
    enabled: !!user?.restaurantId,
    onNewCall: (call) => {
      console.log('🔔 New waiter call received:', call);
      // Add to activity feed
      if ((window as any).addOrderActivity) {
        (window as any).addOrderActivity({
          type: 'waiter_call',
          message: `${call.customer_name} at Table ${call.table_number} is calling for assistance`,
          orderId: call.id,
          customerName: call.customer_name,
          tableNumber: call.table_number
        });
      }
    }
  });

  // Debug logging
  console.log('🏪 Restaurant Dashboard Debug:', {
    restaurantId: user?.restaurantId,
    waiterCalls: waiterCalls,
    waiterCallsLoading,
    waiterCallsConnected,
    userInfo: user
  });

  // Print state management
  const [isPrintingInvoice, setIsPrintingInvoice] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  // Print invoice function for quick print buttons
  const printInvoice = async (orderId: string, customerPhone: string) => {
    setIsPrintingInvoice(true);
    setPrintError(null);

    try {
      // Fetch invoice data
      const response = await fetch('/api/dynamic-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          customerPhone,
          options: { includeData: true }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invoice data');
      }

      const result = await response.json();
      const invoiceData = result.data.invoiceData;

      // Generate and print invoice using the same rich template
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window. Please allow popups and try again.');
      }

      // Add error handler for the print window
      printWindow.onerror = (error) => {
        console.error('Print window error:', error);
        setPrintError('Print window encountered an error');
        if (printWindow && !printWindow.closed) {
          printWindow.close();
        }
      };

      // Use the same rich HTML template as the invoice modal
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

      const escapeHtml = (text: string): string => {
        if (!text) return '';
        const map: { [key: string]: string } = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
      };

      const getStatusClass = (status: string): string => {
        switch (status.toLowerCase()) {
          case 'completed':
          case 'served': return 'completed';
          case 'pending': return 'pending';
          case 'failed':
          case 'cancelled': return 'failed';
          default: return 'pending';
        }
      };

      const formatStatus = (status: string): string => {
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
      };

      // Generate items HTML
      const itemsHTML = invoiceData.items.length > 0 
        ? invoiceData.items.map((item: any) => `
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
          `;

      const htmlContent = `<!DOCTYPE html>
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
        
        <div class="tax-row">
            <span>Payment Gateway Charge (2%):</span>
            <span><strong>${formatCurrency(invoiceData.payment_gateway_charge || 0)}</strong></span>
        </div>
        
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
</html>`;

      try {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      } catch (writeError) {
        console.error('Error writing to print window:', writeError);
        if (printWindow && !printWindow.closed) {
          printWindow.close();
        }
        throw new Error('Failed to prepare invoice for printing');
      }
      
      // Wait for content to load then print with better error handling
      const handlePrint = () => {
        try {
          if (printWindow && !printWindow.closed) {
            printWindow.print();
            setTimeout(() => {
              if (printWindow && !printWindow.closed) {
                printWindow.close();
              }
            }, 1000);
          }
        } catch (printError) {
          console.error('Print error:', printError);
          if (printWindow && !printWindow.closed) {
            printWindow.close();
          }
        }
      };

      // Set up a timeout to prevent hanging
      const printTimeout = setTimeout(() => {
        console.warn('Print operation timed out');
        if (printWindow && !printWindow.closed) {
          printWindow.close();
        }
      }, 10000); // 10 second timeout

      const executePrint = () => {
        clearTimeout(printTimeout);
        handlePrint();
      };

      if (printWindow.document.readyState === 'complete') {
        setTimeout(executePrint, 500);
      } else {
        printWindow.onload = () => {
          setTimeout(executePrint, 500);
        };
        
        // Fallback in case onload doesn't fire
        setTimeout(() => {
          if (printWindow && !printWindow.closed && printWindow.document.readyState !== 'complete') {
            console.warn('Print window load timeout, attempting print anyway');
            executePrint();
          }
        }, 5000);
      }

    } catch (error) {
      setPrintError(error instanceof Error ? error.message : 'Failed to print invoice');
      alert(`Failed to print invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Cleanup: close any open print windows
      try {
        const printWindows = Array.from(window.frames);
        printWindows.forEach((frame) => {
          try {
            if (frame && !frame.closed) {
              frame.close();
            }
          } catch (closeError) {
            // Ignore close errors
          }
        });
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    } finally {
      setIsPrintingInvoice(false);
    }
  };

  // Manual order creation state
  const [manualOrder, setManualOrder] = useState({
    customerName: '',
    customerPhone: '',
    tableNumber: '',
    customerNote: '',
    paymentMethod: 'cash' as 'cash' | 'online',
    items: [] as { menuItem: MenuItem; quantity: number }[]
  });

  // Payment waiting state
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [paymentWindow, setPaymentWindow] = useState<Window | null>(null);

  // Use the real-time orders hook with activity feed integration
  const {
    orders,
    loading,
    isConnected,
    lastUpdate,
    newOrdersCount,
    error,
    statusCounts,
    refreshOrders,
    resetNewOrdersCount,
    updateOrderOptimistically
  } = useRealTimeOrders({
    restaurantId: user?.restaurantId || '', 
   onNewOrder: async (order) => {
      // Add to activity feed for all orders (but specify if payment is completed)
      if ((window as any).addOrderActivity) {
        (window as any).addOrderActivity({
          type: 'new_order',
          message: `New order received from ${order.customer_name}${order.payment_status === 'completed' ? ` (PAID${order.payment_method ? ` - ${order.payment_method === 'cash' ? 'Cash' : 'Online'}` : ''})` : ''}`,
          orderId: order.unique_order_id,
          customerName: order.customer_name
        });
      }
    },
    onOrderUpdate: async (updatedOrder, oldOrder) => {
      // Add to activity feed if status changed
      if (oldOrder.status !== updatedOrder.status) {
        if ((window as any).addOrderActivity) {
          (window as any).addOrderActivity({
            type: 'status_change',
            message: `Order status changed to ${updatedOrder.status}`,
            orderId: updatedOrder.unique_order_id,
            customerName: updatedOrder.customer_name,
            status: updatedOrder.status
          });
        }
      }
      // Add to activity feed if payment completed
      if (oldOrder.payment_status !== 'completed' && updatedOrder.payment_status === 'completed') {
        if ((window as any).addOrderActivity) {
          (window as any).addOrderActivity({
            type: 'payment_completed',
            message: `Payment completed for order from ${updatedOrder.customer_name}`,
            orderId: updatedOrder.unique_order_id,
            customerName: updatedOrder.customer_name
          });
        }
      }
    },
    onOrderDelete: (orderId) => {
      // Handle order deletion if needed
    }
  });

  // Initialize notification permission and Cashfree SDK
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    
    // Load Cashfree SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Calculate status cards from real-time data
  const statusCards = [
    {
      label: "New Orders",
      count: statusCounts.pending,
      color: "text-orange-500",
      bg: "bg-orange-50",
      icon: "🔔",
    },    {

      label: "Preparing",
      count: statusCounts.in_progress,
      color: "text-blue-500",
      bg: "bg-blue-50",
      icon: "👨‍🍳",
    },
    {
      label: "Ready",
      count: statusCounts.completed,
      color: "text-green-500",
      bg: "bg-green-50",
      icon: "✅",
    },
    {
      label: "Served",
      count: statusCounts.served,
      color: "text-gray-500",
      bg: "bg-gray-100",
      icon: "🍽️",
    },
  ];

  // Fetch menu items for the current restaurant
  const fetchMenuItems = async () => {
    if (!user?.restaurantId) return;

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', user.restaurantId)
        .order('dish_type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      // Silently handle menu fetch errors
    }
  };

  // Fetch menu items when component mounts
  useEffect(() => {
    if (user?.restaurantId) {
      fetchMenuItems();
    }
  }, [user?.restaurantId]);

  // Function to request notification permission (simplified)
  const requestNotificationPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'denied') {
          alert('Notifications are blocked. Please enable them in your browser settings to receive order alerts.');
        }
      }
    } catch (error) {
      alert('Failed to request notification permission. Please check your browser settings.');
    }
  };

  // Function to monitor payment status
  const monitorPaymentStatus = async (orderId: string) => {
    const maxAttempts = 60; // Monitor for 5 minutes (60 attempts * 5 seconds)
    let attempts = 0;

    const checkPaymentStatus = async (): Promise<boolean> => {
      try {
        const { data: order, error } = await supabase
          .from('orders')
          .select('payment_status, status')
          .eq('id', orderId)
          .single();

        if (error) {
          return false;
        }

        return order.payment_status === 'completed';
      } catch (error) {
        return false;
      }
    };

    return new Promise<boolean>((resolve) => {
      const interval = setInterval(async () => {
        attempts++;
        
        // Check if payment window is closed
        if (paymentWindow && paymentWindow.closed) {
          clearInterval(interval);
          setWaitingForPayment(false);
          setPaymentWindow(null);
          setIsCreatingOrder(false); // Reset creating order state when window is closed
          resolve(false);
          return;
        }

        const isCompleted = await checkPaymentStatus();
        
        if (isCompleted) {
          clearInterval(interval);
          setWaitingForPayment(false);
          if (paymentWindow) {
            paymentWindow.close();
            setPaymentWindow(null);
          }
          resolve(true);
          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setWaitingForPayment(false);
          setIsCreatingOrder(false); // Reset creating order state on timeout
          if (paymentWindow) {
            paymentWindow.close();
            setPaymentWindow(null);
          }
          resolve(false);
        }
      }, 5000); // Check every 5 seconds
    });
  };

  // Manual order creation function
  const createManualOrder = async () => {
    if (!user?.restaurantId || !manualOrder.customerName || !manualOrder.customerPhone || !manualOrder.tableNumber || manualOrder.items.length === 0) {
      alert('Please fill in all required fields and add at least one item.');
      return;
    }

    try {
      setIsCreatingOrder(true);

      // Calculate total amount
      const totalAmount = manualOrder.items.reduce((total, item) => 
        total + (item.menuItem.price * item.quantity), 0
      );

      if (manualOrder.paymentMethod === 'cash') {
        // Handle cash payment - create order directly in database
        // Generate a 6-character unique order ID (matching database constraint)
        const generateUniqueOrderId = () => {
          const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
          let result = '';
          for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        };
        
        const uniqueOrderId = generateUniqueOrderId();

        // Prepare order data for cash payment
        const orderData = {
          restaurant_id: user.restaurantId,
          customer_name: manualOrder.customerName,
          customer_phone: manualOrder.customerPhone,
          table_number: manualOrder.tableNumber,
          customer_note: manualOrder.customerNote || null,
          payment_method: 'cash', // Cash payment method
          items: manualOrder.items.map(item => ({
            dish_id: item.menuItem.id,
            dish_name: item.menuItem.name,
            quantity: item.quantity,
            price: item.menuItem.price,
            total: item.menuItem.price * item.quantity
          })),
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'completed', // Cash orders are paid immediately
          unique_order_id: uniqueOrderId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Insert cash order into database
        const { data, error } = await supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create cash order: ${error.message}`);
        }

        // Reset form and close modal
        setManualOrder({
          customerName: '',
          customerPhone: '',
          tableNumber: '',
          customerNote: '',
          paymentMethod: 'cash',
          items: []
        });
        setShowAddOrderModal(false);

        // Show success message
        alert('Manual order created successfully! Payment marked as completed (Cash).');

        // Refresh orders
        refreshOrders();

      } else {
        // Handle online payment - open payment gateway in new tab
        const paymentData = {
          restaurant_id: user.restaurantId,
          customer_name: manualOrder.customerName,
          customer_phone: manualOrder.customerPhone,
          table_number: manualOrder.tableNumber,
          customer_note: manualOrder.customerNote,
          payment_method: 'online', // Online payment method
          items: manualOrder.items.map(item => ({
            dish_id: item.menuItem.id,
            dish_name: item.menuItem.name,
            quantity: item.quantity,
            price: item.menuItem.price,
            total: item.menuItem.price * item.quantity
          })),
          total_amount: totalAmount
        };

        // Create payment through API
        const response = await fetch('/api/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData)
        });

        const result = await response.json();

        if (!response.ok) {
          let errorMessage = result.error || 'Failed to create payment';
          
          // Provide more specific error messages
          if (result.error?.includes('credentials')) {
            errorMessage = 'Payment gateway not configured. Please contact administrator.';
          } else if (result.error?.includes('Cashfree')) {
            errorMessage = 'Payment gateway error. Please try again or contact support.';
          }
          
          throw new Error(errorMessage);
        }

        if (result.success) {
          if (result.payment_configured === false) {
            // Payment not configured, order created without payment
            setManualOrder({
              customerName: '',
              customerPhone: '',
              tableNumber: '',
              customerNote: '',
              paymentMethod: 'cash',
              items: []
            });
            setShowAddOrderModal(false);
            alert('Order created successfully! Payment system not configured - customer will pay manually.');
            refreshOrders();
          } else {
            // Open payment gateway in new tab and wait for confirmation
            setPaymentOrderId(result.order_id);
            setWaitingForPayment(true);
            
            // Create payment URL for new tab
            const paymentUrl = `/payment?session_id=${result.payment_session_id}&order_id=${result.order_id}&environment=${result.environment}`;
            
            // Open payment in new tab (not popup window)
            const newWindow = window.open(paymentUrl, '_blank');
            setPaymentWindow(newWindow);

            if (!newWindow) {
              alert('Please allow popups to complete the payment.');
              setWaitingForPayment(false);
              return;
            }

            // Reset form but keep modal open to show waiting state
            setManualOrder({
              customerName: '',
              customerPhone: '',
              tableNumber: '',
              customerNote: '',
              paymentMethod: 'cash',
              items: []
            });

            // Monitor payment status
            const paymentCompleted = await monitorPaymentStatus(result.order_id);
            
            if (paymentCompleted) {
              setShowAddOrderModal(false);
              alert('Payment completed successfully! Order has been confirmed.');
              refreshOrders();
            } else {
              alert('Payment was not completed or timed out. Please check the order status manually.');
              setShowAddOrderModal(false);
              refreshOrders();
            }
            
            setPaymentOrderId(null);
          }
        }
      }

    } catch (error) {
      let userMessage = 'Unknown error';
      if (error instanceof Error) {
        userMessage = error.message;
      }
      
      alert(`Failed to create order: ${userMessage}`);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Add item to manual order
  const addItemToManualOrder = (menuItem: MenuItem) => {
    setManualOrder(prev => {
      const existingItem = prev.items.find(item => item.menuItem.id === menuItem.id);
      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map(item =>
            item.menuItem.id === menuItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      } else {
        return {
          ...prev,
          items: [...prev.items, { menuItem, quantity: 1 }]
        };
      }
    });
  };

  // Remove item from manual order
  const removeItemFromManualOrder = (menuItemId: string) => {
    setManualOrder(prev => {
      const existingItem = prev.items.find(item => item.menuItem.id === menuItemId);
      if (existingItem && existingItem.quantity > 1) {
        return {
          ...prev,
          items: prev.items.map(item =>
            item.menuItem.id === menuItemId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
        };
      } else {
        return {
          ...prev,
          items: prev.items.filter(item => item.menuItem.id !== menuItemId)
        };
      }
    });
  };

  // Get manual order subtotal (without gateway charges)
  const getManualOrderSubtotal = () => {
    return manualOrder.items.reduce((total, item) => 
      total + (item.menuItem.price * item.quantity), 0
    );
  };

  // Get payment gateway charge (2% for online payments)
  const getManualOrderGatewayCharge = () => {
    return manualOrder.paymentMethod === 'online' ? getManualOrderSubtotal() * 0.02 : 0;
  };

  // Get manual order total (subtotal + gateway charges if applicable)
  const getManualOrderTotal = () => {
    return getManualOrderSubtotal() + getManualOrderGatewayCharge();
  };

  // Update payment status for cash orders
  const updatePaymentStatus = async (orderId: string, newPaymentStatus: 'completed' | 'pending') => {
    // Prevent multiple simultaneous updates for the same order
    if (updatingOrders.has(orderId)) return;
    
    // Find the order
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Add to updating set
    setUpdatingOrders(prev => new Set(prev).add(orderId));

    // Optimistic update - immediately update the UI
    updateOrderOptimistically(orderId, { 
      payment_status: newPaymentStatus, 
      updated_at: new Date().toISOString() 
    });

    try {
      // Make the database update
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: newPaymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Add to activity feed
      if ((window as any).addOrderActivity) {
        (window as any).addOrderActivity({
          type: 'payment_completed',
          message: `Payment ${newPaymentStatus === 'completed' ? 'confirmed' : 'marked as pending'} for order from ${order.customer_name}`,
          orderId: order.unique_order_id,
          customerName: order.customer_name,
          paymentStatus: newPaymentStatus
        });
      }

    } catch (error) {
      // Revert optimistic update on error
      updateOrderOptimistically(orderId, { 
        payment_status: order.payment_status, 
        updated_at: order.updated_at 
      });
      
      alert('Failed to update payment status. Please try again.');
    } finally {
      // Remove from updating set after a short delay to show success state
      setTimeout(() => {
        setUpdatingOrders(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
      }, 1000);
    }
  };

  // Update order status with optimistic updates and state tracking
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    // Prevent multiple simultaneous updates for the same order
    if (updatingOrders.has(orderId)) return;
    
    // Find the order
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Add to updating set
    setUpdatingOrders(prev => new Set(prev).add(orderId));

    // Optimistic update - immediately update the UI
    updateOrderOptimistically(orderId, { 
      status: newStatus, 
      updated_at: new Date().toISOString() 
    });

    try {
      // Make the database update
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Add to activity feed
      if ((window as any).addOrderActivity) {
        (window as any).addOrderActivity({
          type: 'status_change',
          message: `Order status updated to ${newStatus}`,
          orderId: order.unique_order_id,
          customerName: order.customer_name,
          status: newStatus
        });
      }

    } catch (error) {
      // Revert optimistic update on error
      updateOrderOptimistically(orderId, { 
        status: order.status, 
        updated_at: order.updated_at 
      });
      
      alert('Failed to update order status. Please try again.');
    } finally {
      // Remove from updating set after a short delay to show success state
      setTimeout(() => {
        setUpdatingOrders(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
      }, 500);
    }
  };

  // Open order details modal
  const openOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowOrderDetails(true);
  };



  // Utility functions
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'served': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'NEW ORDER';
      case 'in_progress': return 'PREPARING';
      case 'completed': return 'READY';
      case 'served': return 'SERVED';
      case 'cancelled': return 'CANCELLED';
      default: return status.toUpperCase();
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verifying': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      {/* Notification Setup */}
      <div className="mb-6">
        <NotificationSetup />
      </div>

      {/* Header with Real-time Status */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <span className="text-3xl">📋</span> Orders Management
            {newOrdersCount > 0 && (
              <motion.span 
                className="bg-red-500 text-white text-xs px-2 py-1 rounded-full"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              >
                {newOrdersCount} new
              </motion.span>
            )}
          </h1>
          <p className="text-gray-500 flex items-center gap-2">
            Track and manage customer orders from your menu
            <span className="text-xs text-gray-400">
              • Last updated: {formatTime(lastUpdate.toISOString())}
            </span>
          </p>
        </div> 
       
        {/* Real-time Status & Controls */}
        <div className="flex items-center gap-4">


          {/* Manual Refresh Button */}
          <button
            onClick={() => {
              refreshOrders();
              resetNewOrdersCount();
            }}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition disabled:opacity-50"
          >
            <span className={`text-sm ${loading ? 'animate-spin' : ''}`}>🔄</span>
            <span className="text-sm font-medium">Refresh</span>
          </button>

          {/* Notification Status */}
          {notificationPermission === 'granted' ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200">
                <motion.div 
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-sm font-medium">Notifications ON</span>
              </div>
              <button
                onClick={async () => {
                  try {
                    await notificationManager.showTestNotification();
                    await notificationManager.playNotificationSound();
                  } catch (error) {
                    // Silently handle test notification errors
                  }
                }}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition text-xs"
                title="Test notification (works on all devices)"
              >
                🔔 Test
              </button>
            </div>
          ) : notificationPermission === 'denied' ? (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg border border-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium">Notifications Blocked</span>
            </div>
          ) : (
            <button
              onClick={requestNotificationPermission}
              className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition"
            >
              <span className="text-sm font-medium">🔔 Enable Notifications</span>
            </button>
          )}
        </div>
      </div>

      {/* Print Error Display */}
      {printError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-red-600">❌</span>
            <span className="text-red-800 font-medium">Print Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{printError}</p>
          <button
            onClick={() => setPrintError(null)}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
          >
            Dismiss
          </button>
        </div>
      )}
  
      {/* Real-time Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statusCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-xl shadow p-6 flex flex-col items-center border transition hover:scale-105 hover:shadow-lg ${card.bg} relative`}
          >
            {/* Real-time indicator for new orders */}
            {card.label === "New Orders" && card.count > 0 && (
              <motion.div 
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            
            <span className={`text-3xl mb-2 ${card.color}`}>{card.icon}</span>
            <span className="text-gray-700 font-semibold">{card.label}</span>
            <motion.span 
              key={card.count}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold mt-2"
            >
              {card.count}
            </motion.span>
            

          </motion.div>
        ))}
      </div>

      {/* Waiter Calls Section - Always show when connected */}
      {(waiterCalls.length > 0 || waiterCallsConnected) && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🙋‍♂️</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    🔔 Waiter Calls ({waiterCalls.length})
                    <motion.div 
                      className="w-2 h-2 bg-orange-500 rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </h2>
                  <p className="text-sm text-gray-600">Customers requesting assistance</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Test Sound Button */}
                <button
                  onClick={async () => {
                    try {
                      await notificationManager.playNotificationSound();
                      await notificationManager.showNotification({
                        title: '🔔 Test Waiter Call',
                        body: 'This is how waiter call notifications will sound and look!',
                        tag: 'test-waiter-call',
                        requireInteraction: false,
                        icon: '/favicon.ico'
                      });
                    } catch (error) {
                      console.error('Test notification failed:', error);
                    }
                  }}
                  className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-full transition-colors"
                >
                  🔊 Test Sound
                </button>
                <div className="text-sm text-gray-500">
                  {waiterCallsConnected ? '🟢 Live' : '🔴 Offline'}
                  <div className="text-xs mt-1">
                    Calls: {waiterCalls.length} | Loading: {waiterCallsLoading ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {waiterCalls.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <div className="text-4xl mb-2">👂</div>
                  <p className="text-gray-500">Listening for waiter calls...</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Status: {waiterCallsConnected ? 'Connected' : 'Connecting...'}
                  </p>
                </div>
              ) : (
                waiterCalls.map((call) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{call.customer_name}</h3>
                      <p className="text-sm text-gray-600">Table {call.table_number}</p>
                      {call.customer_phone && (
                        <p className="text-xs text-gray-500">📞 {call.customer_phone}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(call.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded italic">
                      "{call.message}"
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => updateCallStatus(call.id, 'acknowledged')}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded transition-colors"
                    >
                      ✓ Acknowledge
                    </button>
                    <button
                      onClick={() => updateCallStatus(call.id, 'completed')}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-2 px-3 rounded transition-colors"
                    >
                      ✅ Complete
                    </button>
                  </div>
                </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      
      <button 
        onClick={() => setShowAddOrderModal(true)}
        className="mb-6 bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-900 transition shadow"
      >
        + Add Order
      </button>     
 {/* Dine-In Orders Section */}
      {/* Orders Sections - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Dine-In Orders Section */}
        <div className="bg-white rounded-xl shadow p-6 border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  🍽️ Dine-In Orders ({orders.filter(order => order.order_type === 'dine_in' || !order.order_type).length})
                </h2>
                <p className="text-sm text-gray-500">Restaurant table orders</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isConnected && (
                <span className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  <motion.div 
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  Real-time
                </span>
              )}
            </div>
          </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-6xl mb-4">⚠️</span>
            <p className="text-red-600 font-semibold mb-2">Error Loading Orders</p>
            <p className="text-gray-600 text-center">{error}</p>
            <button
              onClick={refreshOrders}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : orders.filter(order => order.order_type === 'dine_in' || !order.order_type).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-6xl mb-4">🍽️</span>
            <p className="text-lg font-semibold mb-2">No Dine-In Orders</p>
            <p className="text-gray-500 mb-6">
              Table orders will appear here when customers place them at your restaurant
            </p>
            <div className="bg-gray-50 rounded-lg p-6 w-full max-w-xl">
              <h3 className="font-semibold mb-2">Real-time Order Management Features:</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>✔️ Live order notifications with sound alerts</li>
                <li>✔️ Real-time status tracking and updates</li>
                <li>✔️ Activity feed showing recent order events</li>
                <li>✔️ Auto-refresh every 30 seconds as backup</li>
                <li>✔️ Connection status monitoring</li>
              </ul>
            </div>
          </div>        )
 : (
          <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
            {orders
              .filter(order => order.order_type === 'dine_in' || !order.order_type)
              .map((order, index) => {
              const isNewOrder = order.status === 'pending' && order.payment_status === 'completed';
              const orderAge = Date.now() - new Date(order.created_at).getTime();
              const isRecentOrder = orderAge < 60000; // Less than 1 minute old
              
              return (
                <motion.div
                  key={order.id}
                  data-order-id={order.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    borderColor: isNewOrder ? '#f59e0b' : '#e5e7eb'
                  }}
                  transition={{ delay: index * 0.05 }}
                  className={`border rounded-lg p-4 hover:shadow-md transition-all duration-300 relative ${
                    isNewOrder ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                  } ${isRecentOrder ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}`}
                >
                  {/* New order indicator */}
                  {isNewOrder && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                      NEW!
                    </div>
                  )}
                  
                  {/* Recent order pulse */}
                  {isRecentOrder && (
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="font-mono font-bold text-blue-600 cursor-pointer hover:text-blue-800 transition"
                           onClick={() => {
                             setSelectedOrderId(order.id);
                             setShowOrderDetails(true);
                           }}
                           title="Click to view details">
                        #{order.unique_order_id}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTime(order.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status === 'completed' 
                          ? `PAID${order.payment_method ? ` (${order.payment_method === 'cash' ? 'Cash' : 'Online'})` : ''}` 
                          : order.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>  
                
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-gray-500">{order.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Table</p>
                      <p className="font-medium">Table {order.table_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-bold text-green-600">{formatCurrency(order.total_amount)}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Items</p>
                    <div className="space-y-1">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.dish_name} x{item.quantity}</span>
                          <span>{formatCurrency(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Order ID: #{order.unique_order_id}
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* View Details Button */}
                      <button
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setShowOrderDetails(true);
                        }}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100 transition border border-blue-200 flex items-center gap-1"
                      >
                        <span>👁️</span>
                        View Details
                      </button>

                      {/* Print Invoice Button - Only for completed payments */}
                      {order.payment_status === 'completed' && (
                        <button
                          onClick={() => printInvoice(order.id, order.customer_phone)}
                          disabled={isPrintingInvoice}
                          className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded hover:bg-green-100 transition border border-green-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Print Invoice"
                        >
                          <span>{isPrintingInvoice ? '⏳' : '🖨️'}</span>
                          {isPrintingInvoice ? 'Printing...' : 'Print Invoice'}
                        </button>
                      )}
                      
                      {/* Only show status buttons if payment is completed */}
                      {order.payment_status === 'completed' && (
                        <>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'in_progress')}
                              disabled={updatingOrders.has(order.id)}
                              className={`px-3 py-1 text-xs rounded transition flex items-center gap-1 ${
                                updatingOrders.has(order.id)
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {updatingOrders.has(order.id) ? (
                                <>
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                  Updating...
                                </>
                              ) : (
                                'Accept Order'
                              )}
                            </button>
                          )}
                          {order.status === 'in_progress' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              disabled={updatingOrders.has(order.id)}
                              className={`px-3 py-1 text-xs rounded transition flex items-center gap-1 ${
                                updatingOrders.has(order.id)
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {updatingOrders.has(order.id) ? (
                                <>
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                  Updating...
                                </>
                              ) : (
                                'Mark Ready'
                              )}
                            </button>
                          )}
                          {order.status === 'completed' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'served')}
                              disabled={updatingOrders.has(order.id)}
                              className={`px-3 py-1 text-xs rounded transition flex items-center gap-1 ${
                                updatingOrders.has(order.id)
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-gray-600 text-white hover:bg-gray-700'
                              }`}
                            >
                              {updatingOrders.has(order.id) ? (
                                <>
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                  Updating...
                                </>
                              ) : (
                                'Mark Served'
                              )}
                            </button>
                          )}
                        </>
                      )} 
                     
                      {/* Show payment status message for unpaid orders */}
                      {(order.payment_status === 'pending' || order.payment_status === 'verifying') && (
                        <div className="flex items-center gap-2">
                          <motion.div 
                            className="w-2 h-2 bg-yellow-500 rounded-full"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <span className="text-xs text-yellow-700 font-medium">
                            {order.payment_status === 'pending' ? 'Awaiting Payment' : 'Verifying Payment'}
                          </span>
                        </div>
                      )}
                      
                      {order.payment_status === 'failed' && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-xs text-red-700 font-medium">Payment Failed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        </div>

        {/* Online Orders Section */}
        <div className="bg-white rounded-xl shadow p-6 border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  🚚 Online Orders ({orders.filter(order => order.order_type === 'online').length})
                </h2>
                <p className="text-sm text-gray-500">Delivery orders</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isConnected && (
                <span className="flex items-center gap-1 text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  <motion.div 
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  Real-time
                </span>
              )}
            </div>
          </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading online orders...</p>
          </div>
        ) : orders.filter(order => order.order_type === 'online').length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Online Orders</h3>
            <p className="text-gray-600">Delivery orders will appear here when customers place them</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
            {orders
              .filter(order => order.order_type === 'online')
              .map((order, index) => {
                const isNewOrder = order.status === 'pending' && order.payment_status === 'completed';
                const orderAge = Date.now() - new Date(order.created_at).getTime();
                const isRecentOrder = orderAge < 60000;
                
                return (
                  <motion.div
                    key={order.id}
                    data-order-id={order.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      borderColor: isNewOrder ? '#a855f7' : '#e5e7eb'
                    }}
                    transition={{ delay: index * 0.05 }}
                    className={`border rounded-lg p-4 hover:shadow-md transition-all duration-300 relative ${
                      isNewOrder ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
                    } ${isRecentOrder ? 'ring-2 ring-purple-200 ring-opacity-50' : ''}`}
                  >
                    {isNewOrder && (
                      <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                        NEW!
                      </div>
                    )}
                    
                    {isRecentOrder && (
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="font-mono font-bold text-purple-600 cursor-pointer hover:text-purple-800 transition"
                             onClick={() => {
                               setSelectedOrderId(order.id);
                               setShowOrderDetails(true);
                             }}
                             title="Click to view details">
                          #{order.unique_order_id}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatTime(order.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.payment_status === 'verifying' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.payment_status === 'completed' 
                            ? `PAID${order.payment_method ? ` (${order.payment_method === 'cash' ? 'Cash' : 'Online'})` : ''}` 
                            : order.payment_status === 'pending' ? 'PENDING' :
                              order.payment_status === 'verifying' ? 'VERIFYING' :
                              order.payment_status === 'not_configured' ? 'NOT_CONFIGURED' :
                              'FAILED'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-gray-600">{order.customer_phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Delivery Address</p>
                        <div className="bg-purple-100 px-3 py-2 rounded-lg">
                          <p className="font-medium text-purple-900 text-sm">📍 {order.customer_address}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-bold text-lg text-green-600">₹{order.total_amount.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Items ({order.items?.length || 0})</p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-1">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{item.dish_name} x{item.quantity}</span>
                                <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No items found</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {order.payment_status === 'completed' && (
                          <>
                            {order.status === 'pending' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'in_progress')}
                                disabled={updatingOrders.has(order.id)}
                                className={`px-3 py-1 text-xs rounded transition flex items-center gap-1 ${
                                  updatingOrders.has(order.id)
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                }`}
                              >
                                {updatingOrders.has(order.id) ? (
                                  <>
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                    Updating...
                                  </>
                                ) : (
                                  'Start Preparing'
                                )}
                              </button>
                            )}
                            
                            {order.status === 'in_progress' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                disabled={updatingOrders.has(order.id)}
                                className={`px-3 py-1 text-xs rounded transition flex items-center gap-1 ${
                                  updatingOrders.has(order.id)
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                              >
                                {updatingOrders.has(order.id) ? (
                                  <>
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                    Updating...
                                  </>
                                ) : (
                                  'Mark Ready'
                                )}
                              </button>
                            )}
                            
                            {order.status === 'completed' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'served')}
                                disabled={updatingOrders.has(order.id)}
                                className={`px-3 py-1 text-xs rounded transition flex items-center gap-1 ${
                                  updatingOrders.has(order.id)
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-orange-600 text-white hover:bg-orange-700'
                                }`}
                              >
                                {updatingOrders.has(order.id) ? (
                                  <>
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                    Updating...
                                  </>
                                ) : (
                                  'Mark Delivered'
                                )}
                              </button>
                            )}
                          </>
                        )} 
                       
                        {(order.payment_status === 'pending' || order.payment_status === 'verifying') && (
                          <div className="flex items-center gap-2">
                            <motion.div 
                              className="w-2 h-2 bg-yellow-500 rounded-full"
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            <span className="text-xs text-yellow-700 font-medium">
                              {order.payment_status === 'pending' ? 'Awaiting Payment' : 'Verifying Payment'}
                            </span>
                          </div>
                        )}
                        
                        {order.payment_status === 'failed' && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-xs text-red-700 font-medium">Payment Failed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrderId && (
        <OrderDetailsModal
          isOpen={showOrderDetails}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
        />
      )}

      {/* Add Order Modal */}
      {showAddOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Create Manual Order</h2>
              <button
                onClick={() => setShowAddOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Payment Waiting State */}
              {waitingForPayment && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Waiting for Payment</h3>
                  <p className="text-gray-600 mb-4">
                    Payment gateway opened in new tab. Please complete the payment to confirm the order.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 text-blue-700">
                      <span className="text-2xl">💳</span>
                      <span className="font-medium">Payment in Progress</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-2">
                      Order ID: {paymentOrderId}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>• Complete payment in the new tab</p>
                    <p>• This window will update automatically</p>
                    <p>• Do not close this window until payment is complete</p>
                  </div>
                  <button
                    onClick={() => {
                      setWaitingForPayment(false);
                      setPaymentOrderId(null);
                      setIsCreatingOrder(false); // Reset the creating order state
                      if (paymentWindow) {
                        paymentWindow.close();
                        setPaymentWindow(null);
                      }
                    }}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Cancel Payment
                  </button>
                </div>
              )}

              {/* Regular Form Content - Hidden during payment waiting */}
              {!waitingForPayment && (
                <>
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={manualOrder.customerName}
                    onChange={(e) => setManualOrder(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={manualOrder.customerPhone}
                    onChange={(e) => setManualOrder(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Table Number *
                  </label>
                  <input
                    type="text"
                    value={manualOrder.tableNumber}
                    onChange={(e) => setManualOrder(prev => ({ ...prev, tableNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter table number"
                  />
                </div>
              </div>

              {/* Customer Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={manualOrder.customerNote}
                  onChange={(e) => setManualOrder(prev => ({ ...prev, customerNote: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Any special requests or dietary preferences? (e.g., less spicy, no onions, extra sauce)"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Let the kitchen know how the customer wants their food prepared (max 500 characters)
                </p>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setManualOrder(prev => ({ ...prev, paymentMethod: 'cash' }))}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                      manualOrder.paymentMethod === 'cash'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-3xl">💵</span>
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium text-gray-900">Cash Payment</h3>
                      <p className="text-sm text-gray-600 mt-1">Customer pays in cash</p>
                      {manualOrder.paymentMethod === 'cash' && (
                        <div className="mt-2 flex items-center justify-center">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-xs text-purple-600 ml-1 font-medium">Selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div
                    onClick={() => setManualOrder(prev => ({ ...prev, paymentMethod: 'online' }))}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                      manualOrder.paymentMethod === 'online'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-3xl">💳</span>
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium text-gray-900">Online Payment</h3>
                      <p className="text-sm text-gray-600 mt-1">UPI, Card, or Digital wallet</p>
                      {manualOrder.paymentMethod === 'online' && (
                        <div className="mt-2 flex items-center justify-center">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-xs text-purple-600 ml-1 font-medium">Selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Payment Method Info */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  {manualOrder.paymentMethod === 'cash' ? (
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✅</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Cash Payment Selected</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Order will be marked as paid immediately. Collect cash from customer when serving.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">ℹ️</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Online Payment Selected</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Customer will need to complete payment online. A 2% payment gateway charge will be added to the total. Order will be pending until payment is confirmed.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Menu Items Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Menu Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                  {menuItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">₹{item.price.toFixed(2)}</p>
                          {item.dish_type && (
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                              {item.dish_type}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeItemFromManualOrder(item.id)}
                            className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                            disabled={!manualOrder.items.find(orderItem => orderItem.menuItem.id === item.id)}
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">
                            {manualOrder.items.find(orderItem => orderItem.menuItem.id === item.id)?.quantity || 0}
                          </span>
                          <button
                            onClick={() => addItemToManualOrder(item)}
                            className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              {manualOrder.items.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    {manualOrder.items.map((item) => (
                      <div key={item.menuItem.id} className="flex justify-between text-sm">
                        <span>{item.menuItem.name} x{item.quantity}</span>
                        <span>₹{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>₹{getManualOrderSubtotal().toFixed(2)}</span>
                      </div>
                      {manualOrder.paymentMethod === 'online' && getManualOrderGatewayCharge() > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Payment Gateway Charge (2%):</span>
                          <span>₹{getManualOrderGatewayCharge().toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold pt-1 border-t">
                        <span>Total:</span>
                        <span>₹{getManualOrderTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>Payment Method:</span>
                        <span className="flex items-center gap-1">
                          {manualOrder.paymentMethod === 'cash' ? (
                            <>
                              <span>💵</span>
                              <span>Cash</span>
                            </>
                          ) : (
                            <>
                              <span>💳</span>
                              <span>Online</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
                </>
              )} {/* Close the conditional div for regular form content */}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              {waitingForPayment ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-blue-600">
                    <motion.div 
                      className="w-2 h-2 bg-blue-600 rounded-full"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-sm font-medium">Waiting for payment confirmation...</span>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowAddOrderModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createManualOrder}
                    disabled={isCreatingOrder || !manualOrder.customerName || !manualOrder.customerPhone || !manualOrder.tableNumber || manualOrder.items.length === 0}
                    className={`px-6 py-2 text-white rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
                      manualOrder.paymentMethod === 'cash' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isCreatingOrder ? (
                      manualOrder.paymentMethod === 'cash' ? 'Creating Order...' : 'Processing Payment...'
                    ) : (
                      manualOrder.paymentMethod === 'cash' ? 'Create Order (Cash)' : 'Create Order & Pay Online'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}