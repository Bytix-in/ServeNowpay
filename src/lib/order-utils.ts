import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export interface OrderLookupResult {
  found: boolean
  order?: any
  suggestions?: any[]
  error?: string
  searchMethod?: string
}

export interface OrderValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validates if an order ID has the correct UUID format
 */
export function validateOrderIdFormat(orderId: string): OrderValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check if it's a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  
  if (!orderId) {
    errors.push('Order ID is required')
  } else if (typeof orderId !== 'string') {
    errors.push('Order ID must be a string')
  } else if (orderId.length !== 36) {
    errors.push(`Order ID must be 36 characters long, got ${orderId.length}`)
  } else if (!uuidRegex.test(orderId)) {
    errors.push('Order ID must be a valid UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)')
  }

  // Check for common issues
  if (orderId && orderId.includes(' ')) {
    warnings.push('Order ID contains spaces')
  }
  
  if (orderId && orderId !== orderId.trim()) {
    warnings.push('Order ID has leading or trailing whitespace')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Comprehensive order lookup with multiple fallback strategies
 */
export async function findOrder(orderId: string): Promise<OrderLookupResult> {
  try {
    const cleanOrderId = orderId.trim()
    
    const validation = validateOrderIdFormat(cleanOrderId)
    if (!validation.isValid) {
      return {
        found: false,
        error: `Invalid order ID format: ${validation.errors.join(', ')}`,
        suggestions: []
      }
    }

    const { data: directMatch, error: directError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', cleanOrderId)
      .single()

    if (directMatch && !directError) {
      return {
        found: true,
        order: directMatch,
        searchMethod: 'direct'
      }
    }

    const { data: caseInsensitiveMatch, error: caseError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .ilike('id', cleanOrderId)
      .single()

    if (caseInsensitiveMatch && !caseError) {
      return {
        found: true,
        order: caseInsensitiveMatch,
        searchMethod: 'case_insensitive'
      }
    }

    const suggestions = await findSimilarOrders(cleanOrderId)

    return {
      found: false,
      error: `Order not found: ${cleanOrderId}`,
      suggestions,
      searchMethod: 'not_found'
    }

  } catch (error) {
    return {
      found: false,
      error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      suggestions: []
    }
  }
}

/**
 * Find orders with similar IDs using multiple strategies
 */
export async function findSimilarOrders(orderId: string, limit: number = 5): Promise<any[]> {
  try {
    const suggestions: any[] = []
    
    const parts = orderId.split('-')
    for (const part of parts) {
      if (part.length >= 4) {
        const { data, error } = await supabaseAdmin
          .from('orders')
          .select('id, customer_name, created_at, status, payment_status, total_amount')
          .ilike('id', `%${part}%`)
          .limit(3)

        if (!error && data) {
          suggestions.push(...data.map(order => ({
            ...order,
            similarity_reason: `Partial match on segment: ${part}`
          })))
        }
      }
    }

    const { data: recentOrders, error: recentError } = await supabaseAdmin
      .from('orders')
      .select('id, customer_name, created_at, status, payment_status, total_amount')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!recentError && recentOrders) {
      const similarOrders = recentOrders
        .map(order => ({
          ...order,
          similarity_score: calculateStringSimilarity(orderId, order.id),
          similarity_reason: 'String similarity match'
        }))
        .filter(order => order.similarity_score > 0.6)
        .sort((a, b) => b.similarity_score - a.similarity_score)

      suggestions.push(...similarOrders.slice(0, 3))
    }

    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.id === suggestion.id)
      )
      .slice(0, limit)

    return uniqueSuggestions

  } catch (error) {
    return []
  }
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null))

  for (let i = 0; i <= len1; i++) matrix[0][i] = i
  for (let j = 0; j <= len2; j++) matrix[j][0] = j

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      )
    }
  }

  const distance = matrix[len2][len1]
  const maxLen = Math.max(len1, len2)
  return (maxLen - distance) / maxLen
}

/**
 * Get order by payment gateway order ID
 */
export async function findOrderByGatewayId(gatewayOrderId: string): Promise<OrderLookupResult> {
  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('payment_gateway_order_id', gatewayOrderId)
      .single()

    if (order && !error) {
      return {
        found: true,
        order,
        searchMethod: 'gateway_id'
      }
    }

    return {
      found: false,
      error: `No order found with gateway ID: ${gatewayOrderId}`,
      suggestions: []
    }

  } catch (error) {
    return {
      found: false,
      error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      suggestions: []
    }
  }
}

/**
 * Enhanced order creation with better ID generation and validation
 */
export async function createOrderWithValidation(orderData: any): Promise<{ success: boolean; order?: any; error?: string }> {
  try {
    const requiredFields = ['restaurant_id', 'customer_name', 'customer_phone', 'table_number', 'items', 'total_amount']
    const missingFields = requiredFields.filter(field => !orderData[field])
    
    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }
    }

    const enhancedOrderData = {
      ...orderData,
      status: orderData.status || 'pending',
      payment_status: orderData.payment_status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([enhancedOrderData])
      .select()
      .single()

    if (orderError) {
      return {
        success: false,
        error: `Failed to create order: ${orderError.message}`
      }
    }

    return {
      success: true,
      order
    }

  } catch (error) {
    return {
      success: false,
      error: `Order creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}