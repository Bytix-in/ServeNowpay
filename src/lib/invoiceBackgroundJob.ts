import { supabase } from '@/lib/supabase'
import { generateInvoicePDF, validateOrderData } from '@/lib/generateInvoicePDF'
import { generateSimpleInvoiceHTML } from '@/lib/generateInvoiceFallback'

/**
 * Background job to generate invoices for completed orders
 * This can be run as a cron job or scheduled task
 */
export class InvoiceBackgroundJob {
  private isRunning = false
  private lastRun: Date | null = null

  /**
   * Process all orders that need invoice generation
   */
  async processInvoices(options: {
    batchSize?: number
    maxRetries?: number
    delayBetweenBatches?: number
  } = {}) {
    const {
      batchSize = 10,
      maxRetries = 3,
      delayBetweenBatches = 1000
    } = options

    if (this.isRunning) {
      console.log('Invoice background job is already running')
      return { success: false, message: 'Job already running' }
    }

    this.isRunning = true
    this.lastRun = new Date()

    try {
      console.log('Starting invoice background job...')

      let totalProcessed = 0
      let totalSuccessful = 0
      let totalFailed = 0
      let hasMoreOrders = true

      while (hasMoreOrders) {
        // Fetch orders that need invoice generation
        const { data: orders, error: ordersError } = await supabase
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
            restaurants (
              name,
              address,
              phone_number,
              email
            )
          `)
          .eq('payment_status', 'completed')
          .or('invoice_generated.is.null,invoice_generated.eq.false')
          .limit(batchSize)

        if (ordersError) {
          throw ordersError
        }

        if (!orders || orders.length === 0) {
          hasMoreOrders = false
          break
        }

        console.log(`Processing batch of ${orders.length} orders...`)

        // Process each order in the batch
        for (const order of orders) {
          let retries = 0
          let success = false

          while (retries < maxRetries && !success) {
            try {
              await this.generateInvoiceForOrder(order)
              success = true
              totalSuccessful++
            } catch (error) {
              retries++
              console.error(`Error generating invoice for order ${order.id} (attempt ${retries}):`, error)
              
              if (retries >= maxRetries) {
                totalFailed++
                // Log failed order for manual review
                await this.logFailedInvoice(order.id, error)
              } else {
                // Wait before retry
                await this.delay(1000 * retries)
              }
            }
          }

          totalProcessed++
        }

        // If we got fewer orders than batch size, we're done
        if (orders.length < batchSize) {
          hasMoreOrders = false
        } else {
          // Delay between batches to avoid overwhelming the system
          await this.delay(delayBetweenBatches)
        }
      }

      const result = {
        success: true,
        message: 'Invoice background job completed',
        totalProcessed,
        totalSuccessful,
        totalFailed,
        startTime: this.lastRun,
        endTime: new Date()
      }

      console.log('Invoice background job completed:', result)
      return result

    } catch (error) {
      console.error('Error in invoice background job:', error)
      return {
        success: false,
        message: 'Invoice background job failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Generate invoice for a single order
   */
  private async generateInvoiceForOrder(order: any): Promise<void> {
    // Validate order data
    if (!validateOrderData(order)) {
      throw new Error('Invalid order data')
    }

    let base64PDF: string

    try {
      // Try to generate PDF first
      base64PDF = await generateInvoicePDF(order, {
        returnBase64: true,
        format: 'A4'
      }) as string
      console.log(`PDF invoice generated for order: ${order.id}`)
    } catch (pdfError) {
      console.log(`PDF generation failed for order ${order.id}, using fallback HTML`)
      // Use fallback HTML method
      const fallbackHTML = generateSimpleInvoiceHTML(order)
      base64PDF = Buffer.from(fallbackHTML, 'utf8').toString('base64')
      console.log(`Fallback HTML invoice generated for order: ${order.id}`)
    }

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

    console.log(`Invoice saved successfully for order: ${order.id}`)
  }

  /**
   * Log failed invoice generation for manual review
   */
  private async logFailedInvoice(orderId: string, error: any): Promise<void> {
    try {
      await supabase
        .from('invoice_generation_failures')
        .insert({
          order_id: orderId,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          failed_at: new Date().toISOString(),
          retry_count: 3
        })
    } catch (logError) {
      console.error('Failed to log invoice generation failure:', logError)
    }
  }

  /**
   * Utility function to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun
    }
  }

  /**
   * Get orders that need invoice generation
   */
  async getOrdersNeedingInvoices(limit = 100) {
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
export const invoiceBackgroundJob = new InvoiceBackgroundJob()

// Export function for API routes
export async function runInvoiceBackgroundJob(options?: any) {
  return await invoiceBackgroundJob.processInvoices(options)
}