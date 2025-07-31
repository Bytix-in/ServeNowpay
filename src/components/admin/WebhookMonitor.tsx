'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

interface WebhookEvent {
  id: string
  order_id: string
  payment_status: string
  payment_gateway_response: any
  updated_at: string
  customer_name: string
  total_amount: number
}

interface WebhookStats {
  total_webhooks: number
  successful_webhooks: number
  failed_webhooks: number
  last_webhook_time: string | null
}

export default function WebhookMonitor() {
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [stats, setStats] = useState<WebhookStats>({
    total_webhooks: 0,
    successful_webhooks: 0,
    failed_webhooks: 0,
    last_webhook_time: null
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchWebhookEvents()
    
    // Set up real-time subscription for new webhook events
    const subscription = supabase
      .channel('webhook-monitor')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: 'payment_gateway_response=not.is.null'
        },
        (payload) => {
          console.log('New webhook event detected:', payload)
          fetchWebhookEvents() // Refresh the list
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchWebhookEvents = async () => {
    try {
      setRefreshing(true)
      
      // Fetch recent orders with webhook responses
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, payment_status, payment_gateway_response, updated_at, customer_name, total_amount')
        .not('payment_gateway_response', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(20)

      if (error) throw error

      setEvents(orders || [])

      // Calculate stats
      const total = orders?.length || 0
      const successful = orders?.filter(o => o.payment_status === 'completed').length || 0
      const failed = orders?.filter(o => o.payment_status === 'failed').length || 0
      const lastWebhook = orders?.[0]?.updated_at || null

      setStats({
        total_webhooks: total,
        successful_webhooks: successful,
        failed_webhooks: failed,
        last_webhook_time: lastWebhook
      })

    } catch (error) {
      console.error('Error fetching webhook events:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const testWebhook = async (orderId: string) => {
    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: 'PAID' })
      })

      if (response.ok) {
        console.log('Test webhook sent successfully')
        setTimeout(fetchWebhookEvents, 1000) // Refresh after 1 second
      }
    } catch (error) {
      console.error('Error sending test webhook:', error)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
      case 'verifying':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading webhook events...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Webhook Monitor</h3>
          </div>
          <Button
            onClick={fetchWebhookEvents}
            disabled={refreshing}
            size="sm"
            variant="outline"
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 border-b bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total_webhooks}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.successful_webhooks}</div>
            <div className="text-sm text-gray-600">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed_webhooks}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">
              {stats.last_webhook_time ? formatTime(stats.last_webhook_time) : 'Never'}
            </div>
            <div className="text-sm text-gray-600">Last Event</div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="p-6">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No webhook events found. Webhooks will appear here when payments are processed.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(event.payment_status)}
                  <div>
                    <div className="font-medium text-gray-900">
                      {event.customer_name} - ₹{event.total_amount}
                    </div>
                    <div className="text-sm text-gray-600">
                      Order: {event.id.slice(-8)} • {formatTime(event.updated_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.payment_status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : event.payment_status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {event.payment_status}
                  </span>
                  <Button
                    onClick={() => testWebhook(event.id)}
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                  >
                    Test
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}