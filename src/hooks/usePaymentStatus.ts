import { useState, useEffect } from 'react'
import { useRestaurant } from './useRestaurant'

type PaymentStatus = {
  hasCredentials: boolean
  isEnabled: boolean
  environment: 'sandbox' | 'production'
  requiresSetup: boolean
}

export function usePaymentStatus() {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { restaurant } = useRestaurant()

  const fetchPaymentStatus = async () => {
    if (!restaurant?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/restaurant/payment-status?restaurant_id=${restaurant.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment status')
      }

      const result = await response.json()
      
      if (result.success) {
        setPaymentStatus(result.data)
      } else {
        throw new Error(result.error || 'Unknown error')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      console.error('Error fetching payment status:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentStatus()
  }, [restaurant?.id])

  const refreshPaymentStatus = async () => {
    if (restaurant?.id) {
      await fetchPaymentStatus()
    }
  }

  return { 
    paymentStatus, 
    loading, 
    error, 
    refreshPaymentStatus,
    hasCredentials: paymentStatus?.hasCredentials || false,
    isEnabled: paymentStatus?.isEnabled || false,
    requiresSetup: paymentStatus?.requiresSetup || true
  }
}