"use client";

import React, { useEffect, useState } from 'react';
import { InvoiceTemplate, InvoiceData } from './InvoiceTemplate';
import { useInvoiceGenerator } from '@/hooks/useInvoiceGenerator';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  customerPhone: string;
}

export default function InvoiceModal({ isOpen, onClose, orderId, customerPhone }: InvoiceModalProps) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const {
    invoiceRef,
    isGenerating,
    error: generatorError,
    generatePDF,
    handlePrint,
    clearError
  } = useInvoiceGenerator({
    onSuccess: () => {
      console.log('Invoice generated successfully');
    },
    onError: (error) => {
      console.error('Invoice generation error:', error);
    }
  });

  // Fetch invoice data when modal opens
  useEffect(() => {
    if (isOpen && orderId && customerPhone) {
      fetchInvoiceData();
    }
  }, [isOpen, orderId, customerPhone]);

  const fetchInvoiceData = async () => {
    setLoading(true);
    setFetchError(null);
    clearError();

    try {
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
      setInvoiceData(result.data.invoiceData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load invoice';
      setFetchError(errorMessage);
      console.error('Error fetching invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintClick = () => {
    if (invoiceData) {
      handlePrint();
    }
  };

  const handleDownloadPDF = () => {
    if (invoiceData) {
      generatePDF(invoiceData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Invoice Preview</h2>
            <p className="text-purple-100 text-sm">
              {invoiceData ? `Order #${invoiceData.unique_order_id}` : 'Loading...'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {invoiceData && (
              <>
                <button
                  onClick={handlePrintClick}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>🖨️</span>
                  {isGenerating ? 'Printing...' : 'Print'}
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>📄</span>
                  {isGenerating ? 'Generating...' : 'Download PDF'}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-purple-500 transition"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-600">Loading invoice data...</p>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 font-semibold mb-2">Failed to Load Invoice</p>
              <p className="text-gray-600 text-center mb-4">{fetchError}</p>
              <button
                onClick={fetchInvoiceData}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : generatorError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-6">
              <div className="flex items-center gap-2">
                <span className="text-red-600">❌</span>
                <span className="text-red-800 font-medium">Generation Error</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{generatorError}</p>
              <button
                onClick={clearError}
                className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
              >
                Dismiss
              </button>
            </div>
          ) : invoiceData ? (
            <div className="p-6">
              <InvoiceTemplate ref={invoiceRef} data={invoiceData} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <p className="text-gray-600">No invoice data available</p>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
              <p className="text-gray-700 font-medium">Generating invoice...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}