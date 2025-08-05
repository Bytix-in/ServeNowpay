import { supabase } from '@/lib/supabase'

/**
 * Handle payment status updates with pure dynamic invoice system
 * No invoice storage - invoices are generated on-demand when needed
 */
export class PaymentStatusHandler {
  
  /**
   * Update payment status and ensure order items are migrated for invoice generation
   */
  async updatePaymentStatus(
    orderId: string, 
    newStatus: string, 
    options: {
      migrateOrderItems?: boolean
      webhookSource?: string
    } = {}
  ) {
    const { migrateOrderItems = true, webhookSource } = options

    try {


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
          restaurants (
            name,
            address,
            phone_number,
            email,
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
        invoiceReady: false,
        orderItemsMigrated: false
      }

      // If payment is completed, ensure order items are migrated for invoice generation
      if (newStatus === 'completed' && migrateOrderItems) {
        try {
          const migrationResult = await this.ensureOrderItemsMigrated(updatedOrder)
          result.orderItemsMigrated = migrationResult.migrated
          result.invoiceReady = migrationResult.invoiceReady
        } catch (migrationError) {
          // Don't fail the payment update if migration fails
          result.orderItemsMigrated = false
          result.invoiceReady = false
        }
      }

      // Log the update
      await this.logPaymentStatusUpdate(orderId, newStatus, webhookSource, result)

      return result

    } catch (error) {
      throw error
    }
  }

  /**
   * Ensure order items are migrated to order_items table for dynamic invoice generation
   */
  private async ensureOrderItemsMigrated(order: any) {
    try {
      // Check if order items already exist in order_items table
      const { data: existingItems, error: checkError } = await supabase
        .from('order_items')
        .select('id')
        .eq('order_id', order.id)
        .limit(1)

      if (checkError) {
        throw new Error(`Failed to check existing order items: ${checkError.message}`)
      }

      // If items already exist, order is ready for invoice generation
      if (existingItems && existingItems.length > 0) {

        return { 
          migrated: true, 
          invoiceReady: true
        }
      }

      // Migrate items from JSONB to order_items table
      if (order.items && Array.isArray(order.items) && order.items.length > 0) {

        const orderItemsToInsert = order.items.map((item: any) => ({
          order_id: order.id,
          dish_name: item.dish_name || item.name || 'Unknown Item',
          dish_description: item.description || item.dish_description,
          quantity: item.quantity || 1,
          unit_price: item.price || item.unit_price || 0,
          total_price: item.total || item.total_price || (item.price * item.quantity) || 0,
          dish_type: item.dish_type
        }))

        const { error: insertError } = await supabase
          .from('order_items')
          .insert(orderItemsToInsert)

        if (insertError) {
          throw new Error(`Failed to migrate order items: ${insertError.message}`)
        }
        
        return { 
          migrated: true, 
          invoiceReady: true
        }
      }

      // No items to migrate
      return { 
        migrated: false, 
        invoiceReady: false,
        error: 'No order items found' 
      }

    } catch (error) {
      throw error
    }
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
   * Get orders with completed payments that are ready for dynamic invoice generation
   */
  async getCompletedOrdersReadyForInvoice(limit = 50) {
    const { data: orders, error } = await supabase
      .from('orders_ready_for_invoice')
      .select('*')
      .limit(limit)

    if (error) {
      throw error
    }

    return orders || []
  }

  /**
   * Migrate all orders with JSONB items to order_items table
   */
  async migrateAllOrderItems(limit = 100) {
    try {

      // Get orders with JSONB items but no migrated order_items
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, items')
        .not('items', 'is', null)
        .limit(limit)

      if (ordersError) {
        throw ordersError
      }

      if (!orders || orders.length === 0) {
        return {
          success: true,
          message: 'No orders found needing migration',
          processed: 0,
          migrated: 0
        }
      }

      let processed = 0
      let migrated = 0
      const results = []

      for (const order of orders) {
        try {
          // Check if already migrated
          const { data: existingItems } = await supabase
            .from('order_items')
            .select('id')
            .eq('order_id', order.id)
            .limit(1)

          if (existingItems && existingItems.length > 0) {
            results.push({
              orderId: order.id,
              status: 'already_migrated',
              itemCount: 0
            })
            processed++
            continue
          }

          // Migrate items
          if (order.items && Array.isArray(order.items) && order.items.length > 0) {
            const orderItemsToInsert = order.items.map((item: any) => ({
              order_id: order.id,
              dish_name: item.dish_name || item.name || 'Unknown Item',
              dish_description: item.description || item.dish_description,
              quantity: item.quantity || 1,
              unit_price: item.price || item.unit_price || 0,
              total_price: item.total || item.total_price || (item.price * item.quantity) || 0,
              dish_type: item.dish_type
            }))

            const { error: insertError } = await supabase
              .from('order_items')
              .insert(orderItemsToInsert)

            if (insertError) {
              throw insertError
            }

            results.push({
              orderId: order.id,
              status: 'migrated',
              itemCount: orderItemsToInsert.length
            })
            migrated++
          } else {
            results.push({
              orderId: order.id,
              status: 'no_items',
              itemCount: 0
            })
          }

          processed++

        } catch (error) {
          results.push({
            orderId: order.id,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          processed++
        }
      }

      return {
        success: true,
        message: `Migration completed: ${processed} processed, ${migrated} migrated`,
        processed,
        migrated,
        results
      }

    } catch (error) {
      throw error
    }
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