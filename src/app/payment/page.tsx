"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Loading component for Suspense boundary
function PaymentLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Payment</h2>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );
}

// Main payment component
function PaymentContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const environment = searchParams.get('environment');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || !orderId) {
      setError('Missing payment session information');
      setLoading(false);
      return;
    }

    // Load Cashfree SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    
    script.onload = () => {
      initializePayment();
    };
    
    script.onerror = () => {
      setError('Failed to load payment gateway');
      setLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [sessionId, orderId, environment]);

  const initializePayment = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).Cashfree) {
        const cashfree = new (window as any).Cashfree({
          mode: environment === 'production' ? 'production' : 'sandbox'
        });

        const checkoutOptions = {
          paymentSessionId: sessionId,
          redirectTarget: '_self'
        };

        setLoading(false);

        // Initialize payment
        await cashfree.checkout(checkoutOptions);
        
      } else {
        throw new Error('Cashfree SDK not loaded');
      }
    } catch (error) {
      console.error('Payment initialization failed:', error);
      setError('Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    initializePayment();
  };

  const handleClose = () => {
    window.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing Payment</h2>
          <p className="text-gray-600">Please wait while we set up your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-blue-500 text-6xl mb-4">💳</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Gateway</h2>
        <p className="text-gray-600">Complete your payment to confirm the order</p>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentContent />
    </Suspense>
  );
}