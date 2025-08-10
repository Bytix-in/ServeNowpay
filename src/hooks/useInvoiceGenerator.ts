"use client";

import { useCallback, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InvoiceData } from '@/components/invoice/InvoiceTemplate';

export interface UseInvoiceGeneratorOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useInvoiceGenerator = (options: UseInvoiceGeneratorOptions = {}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Custom print function without react-to-print
  const handlePrint = useCallback(() => {
    if (!invoiceRef.current) {
      const errorMessage = 'Invoice template not ready for printing';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window. Please allow popups.');
      }

      // Get the HTML content from the invoice ref
      const invoiceContent = invoiceRef.current.innerHTML;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              
              @page {
                size: A4;
                margin: 20mm;
              }
              
              @media print {
                body {
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
              }
              
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
              
              /* Comprehensive Tailwind CSS classes for React component */
              .bg-white { background-color: #ffffff; }
              .bg-gray-50 { background-color: #f9fafb; }
              .bg-gray-100 { background-color: #f3f4f6; }
              .bg-purple-600 { background-color: #8b5cf6; }
              .bg-green-500 { background-color: #10b981; }
              .bg-yellow-500 { background-color: #f59e0b; }
              .bg-red-500 { background-color: #ef4444; }
              .bg-gray-500 { background-color: #6b7280; }
              
              .text-white { color: #ffffff; }
              .text-gray-600 { color: #4b5563; }
              .text-gray-700 { color: #374151; }
              .text-gray-800 { color: #1f2937; }
              .text-purple-600 { color: #8b5cf6; }
              .text-green-600 { color: #10b981; }
              .text-yellow-600 { color: #f59e0b; }
              .text-red-600 { color: #ef4444; }
              
              .font-sans { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
              .font-bold { font-weight: 700; }
              .font-semibold { font-weight: 600; }
              .font-medium { font-weight: 500; }
              
              .text-xs { font-size: 0.75rem; }
              .text-sm { font-size: 0.875rem; }
              .text-base { font-size: 1rem; }
              .text-lg { font-size: 1.125rem; }
              .text-xl { font-size: 1.25rem; }
              .text-2xl { font-size: 1.5rem; }
              .text-3xl { font-size: 1.875rem; }
              .text-4xl { font-size: 2.25rem; }
              
              .p-2 { padding: 0.5rem; }
              .p-4 { padding: 1rem; }
              .p-6 { padding: 1.5rem; }
              .p-8 { padding: 2rem; }
              .px-4 { padding-left: 1rem; padding-right: 1rem; }
              .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
              .pb-2 { padding-bottom: 0.5rem; }
              .pb-6 { padding-bottom: 1.5rem; }
              
              .m-2 { margin: 0.5rem; }
              .m-4 { margin: 1rem; }
              .mb-2 { margin-bottom: 0.5rem; }
              .mb-4 { margin-bottom: 1rem; }
              .mb-6 { margin-bottom: 1.5rem; }
              .mb-8 { margin-bottom: 2rem; }
              .mt-4 { margin-top: 1rem; }
              .mt-6 { margin-top: 1.5rem; }
              
              .max-w-4xl { max-width: 56rem; }
              .mx-auto { margin-left: auto; margin-right: auto; }
              
              .rounded-lg { border-radius: 0.5rem; }
              .rounded-full { border-radius: 9999px; }
              
              .border { border-width: 1px; border-color: #e5e7eb; }
              .border-b-2 { border-bottom-width: 2px; border-bottom-color: #e5e7eb; }
              .border-b-4 { border-bottom-width: 4px; }
              .border-purple-600 { border-color: #8b5cf6; }
              .border-gray-200 { border-color: #e5e7eb; }
              
              .grid { display: grid; }
              .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
              .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
              .gap-4 { gap: 1rem; }
              .gap-6 { gap: 1.5rem; }
              .gap-8 { gap: 2rem; }
              
              .flex { display: flex; }
              .justify-center { justify-content: center; }
              .justify-between { justify-content: space-between; }
              .items-center { align-items: center; }
              
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              
              .space-y-2 > * + * { margin-top: 0.5rem; }
              .space-y-4 > * + * { margin-top: 1rem; }
              
              .w-full { width: 100%; }
              .h-full { height: 100%; }
              
              /* Responsive design */
              @media (min-width: 768px) {
                .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
              }
            </style>
          </head>
          <body>
            ${invoiceContent}
          </body>
        </html>
      `);

      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          setIsGenerating(false);
          options.onSuccess?.();
        }, 500);
      };

    } catch (error) {
      setIsGenerating(false);
      const errorMessage = `Print failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      options.onError?.(errorMessage);
    }
  }, [options]);

  // Generate PDF using jsPDF and html2canvas
  const generatePDF = useCallback(async (invoiceData: InvoiceData) => {
    if (!invoiceRef.current) {
      const errorMessage = 'Invoice template not ready';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: invoiceRef.current.scrollWidth,
        height: invoiceRef.current.scrollHeight
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      pdf.save(`invoice-${invoiceData.unique_order_id}.pdf`);
      
      setIsGenerating(false);
      options.onSuccess?.();
    } catch (error) {
      setIsGenerating(false);
      const errorMessage = `PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      options.onError?.(errorMessage);
    }
  }, [options]);

  // Fetch invoice data from API
  const fetchInvoiceData = useCallback(async (orderId: string, customerPhone: string): Promise<InvoiceData> => {
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
    return result.data.invoiceData;
  }, []);

  // Generate invoice with data fetching and dynamic template creation
  const generateInvoice = useCallback(async (
    orderId: string, 
    customerPhone: string, 
    type: 'print' | 'pdf' = 'print'
  ) => {
    setIsGenerating(true);
    setError(null);

    try {
      const invoiceData = await fetchInvoiceData(orderId, customerPhone);
      
      if (type === 'pdf') {
        // For PDF, we need to create a temporary DOM element
        await generatePDFWithData(invoiceData);
      } else {
        // For print, we need to create a temporary DOM element
        await printWithData(invoiceData);
      }
    } catch (error) {
      setIsGenerating(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate invoice';
      setError(errorMessage);
      options.onError?.(errorMessage);
    }
  }, [fetchInvoiceData, options]);

  // Print with dynamically created invoice template
  const printWithData = useCallback(async (invoiceData: InvoiceData) => {
    try {
      // Validate invoice data
      if (!invoiceData) {
        throw new Error('Invoice data is missing');
      }

      // Create a temporary div to hold the invoice template
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      
      // Generate HTML with error handling
      const htmlContent = generateInvoiceHTML(invoiceData);
      tempDiv.innerHTML = htmlContent;
      
      document.body.appendChild(tempDiv);

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        document.body.removeChild(tempDiv);
        throw new Error('Could not open print window. Please allow popups.');
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice - ${invoiceData.unique_order_id || 'Unknown'}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 8px;
            }
            .invoice-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #8b5cf6;
              padding-bottom: 20px;
            }
            .invoice-title {
              font-size: 36px;
              font-weight: bold;
              color: #8b5cf6;
              margin-bottom: 10px;
            }
            .order-id {
              font-size: 18px;
              color: #6b7280;
              margin-bottom: 20px;
            }
            .status-badges {
              display: flex;
              justify-content: center;
              gap: 10px;
              margin-bottom: 20px;
            }
            .status-badge {
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-pending { background-color: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
            .status-completed { background-color: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
            .status-failed { background-color: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
            .details-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .details-column {
              flex: 1;
            }
            .details-column h3 {
              color: #8b5cf6;
              font-size: 18px;
              margin-bottom: 15px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 5px;
            }
            .detail-row {
              display: flex;
              margin-bottom: 8px;
            }
            .detail-label {
              font-weight: bold;
              color: #374151;
              min-width: 80px;
            }
            .detail-value {
              color: #6b7280;
            }
            .items-section {
              margin-bottom: 30px;
            }
            .items-section h3 {
              color: #8b5cf6;
              font-size: 18px;
              margin-bottom: 15px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .items-table th {
              background-color: #8b5cf6;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
            }
            .items-table td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
            }
            .items-table tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .total-section {
              text-align: right;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 2px solid #8b5cf6;
            }
            .total-amount {
              font-size: 24px;
              font-weight: bold;
              color: #8b5cf6;
            }
          </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);

      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          document.body.removeChild(tempDiv);
          setIsGenerating(false);
          options.onSuccess?.();
        }, 500);
      };

    } catch (error) {
      setIsGenerating(false);
      const errorMessage = `Print failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw error;
    }
  }, [options]);

  // Generate PDF with dynamically created invoice template
  const generatePDFWithData = useCallback(async (invoiceData: InvoiceData) => {
    let tempDiv: HTMLDivElement | null = null;
    
    try {
      // Validate invoice data
      if (!invoiceData) {
        throw new Error('Invoice data is missing');
      }

      // Create a temporary div to hold the invoice template
      tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '800px';
      
      // Generate HTML with error handling
      const htmlContent = generateInvoiceHTML(invoiceData);
      tempDiv.innerHTML = htmlContent;
      
      document.body.appendChild(tempDiv);
      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 800,
        height: tempDiv.scrollHeight
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      pdf.save(`invoice-${invoiceData.unique_order_id || 'unknown'}.pdf`);
      
      setIsGenerating(false);
      options.onSuccess?.();
    } catch (error) {
      setIsGenerating(false);
      const errorMessage = `PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      // Clean up
      if (tempDiv && document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
    }
  }, [options]);

  // Generate HTML for invoice template using the same rich format as the main invoice generator
  const generateInvoiceHTML = (invoiceData: InvoiceData): string => {
    // Validate invoice data
    if (!invoiceData) {
      throw new Error('Invoice data is required');
    }

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
        `;

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
  };

  return {
    invoiceRef,
    isGenerating,
    error,
    generateInvoice,
    generatePDF,
    handlePrint,
    clearError: () => setError(null)
  };
};