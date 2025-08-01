import { supabase } from '@/lib/supabase'
import { generateInvoicePDF, validateOrderData } from '@/lib/generateInvoicePDF'

/**
 * Handle payment status updates and trigger invoice generation
 */
export class PaymentStatusHandler {
  
  /**
   * Update payment status and generate invoice if completed
   */
  async updatePaymentStatus(
    orderId: string, 
    newStatus: string, 
    options: {
      generateInvoice?: boolean
      webhookSource?: string
    } = {}
  ) {
    const { generateInvoice = true, webhookSource } = options

    try {
      console.log(`Updating payment status for order ${orderId} to ${newStatus}`)

      // Update the payment status
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
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
          invoice_generated,
          invoice_base64,
          restaurants (
            name,
            address,
            phone,
            gst_number
          )
        `)
        .single()

      if (updateError) {
        throw new Error(`Failed to update payment status: ${updateError.message}`)
      }

      const result = {
        success: true,
        orderId,
        oldStatus: 'unknown',
        newStatus,
        paymentUpdated: true,
        invoiceGenerated: false,
        invoiceAlreadyExists: false
      }

      // If payment is completed and invoice generation is enabled
      if (newStatus === 'completed' && generateInvoice) {
        try {
          const invoiceResult = await this.generateInvoiceForCompletedPayment(updatedOrder)
          result.invoiceGenerated = invoiceResult.generated
          result.invoiceAlreadyExists = invoiceResult.alreadyExists
        } catch (invoiceError) {
          console.error('Invoice generation failed:', invoiceError)
          // Don't fail the payment update if invoice generation fails
          result.invoiceGenerated = false
        }
      }

      // Log the update
      await this.logPaymentStatusUpdate(orderId, newStatus, webhookSource, result)

      return result

    } catch (error) {
      console.error('Error updating payment status:', error)
      throw error
    }
  }

  /**
   * Generate invoice for completed payment
   */
  private async generateInvoiceForCompletedPayment(order: any) {
    // Check if invoice already exists
    if (order.invoice_generated && order.invoice_base64) {
      console.log(`Invoice already exists for order ${order.id}`)
      return { generated: false, alreadyExists: true }
    }

    // Validate order data
    if (!validateOrderData(order)) {
      throw new Error('Invalid order data for invoice generation')
    }

    console.log(`Generating invoice for completed payment: ${order.id}`)

    // Generate PDF as base64
    const base64PDF = await generateInvoicePDF(order, {
      returnBase64: true,
      format: 'A4'
    }) as string

    // Update the order with the generated invoice
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        invoice_base64: base64PDF,
        invoice_generated: true,
        invoice_generated_at: new Date().toISOString()
      })
      .eq('id', order.id)

    if (updateError) {
      throw new Error(`Failed to save invoice: ${updateError.message}`)
    }

    console.log(`Invoice generated successfully for order: ${order.id}`)
    return { generated: true, alreadyExists: false }
  }

  /**
   * Log payment status updates for audit trail
   */
  private async logPaymentStatusUpdate(
    orderId: string, 
    newStatus: string, 
    source?: string,
    result?: any
  ) {
    try {
      await supabase
        .from('payment_status_logs')
        .insert({
          order_id: orderId,
          new_status: newStatus,
          source: source || 'manual',
          result: result,
          logged_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Failed to log payment status update:', error)
      // Don't throw error as this is just logging
    }
  }

  /**
   * Batch update payment statuses
   */
  async batchUpdatePaymentStatus(
    updates: Array<{
      orderId: string
      newStatus: string
      webhookSource?: string
    }>,
    options: { generateInvoices?: boolean } = {}
  ) {
    const { generateInvoices = true } = options
    const results = []

    for (const update of updates) {
      try {
        const result = await this.updatePaymentStatus(
          update.orderId, 
          update.newStatus, 
          {
            generateInvoice: generateInvoices,
            webhookSource: update.webhookSource
          }
        )
        results.push(result)
      } catch (error) {
        results.push({
          success: false,
          orderId: update.orderId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return {
      success: true,
      totalProcessed: updates.length,
      results
    }
  }

  /**
   * Get orders with completed payments but no invoices
   */
  async getCompletedOrdersWithoutInvoices(limit = 50) {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        unique_order_id,
        customer_name,
        total_amount,
        payment_status,
        created_at,
        invoice_generated,
        restaurants (name)
      `)
      .eq('payment_status', 'completed')
      .or('invoice_generated.is.null,invoice_generated.eq.false')
      .limit(limit)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return orders || []
  }
}

// Export singleton instance
export const paymentStatusHandler = new PaymentStatusHandler()

// Convenience function for API routes
export async function handlePaymentStatusUpdate(
  orderId: string, 
  newStatus: string, 
  options?: any
) {
  return await paymentStatusHandler.updatePaymentStatus(orderId, newStatus, options)
}