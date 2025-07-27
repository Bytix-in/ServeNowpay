'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('Processing...')

  const sessionId = searchParams.get('session_id')
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    if (sessionId && orderId) {
      initializePayment()
    } else {
      setStatus('Invalid payment session')
      setTimeout(() => {
        router.push('/')
      }, 3000)
    }
  }, [sessionId, orderId])

  const initializePayment = () => {
    if (typeof window !== 'undefined' && (window as any).Cashfree) {
      setStatus('Initializing payment...')
      
      const cashfree = (window as any).Cashfree({
        mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
      })

      const checkoutOptions = {
        paymentSessionId: sessionId,
        returnUrl: `${window.location.origin}/payment/success?order_id=${orderId}`,
      }

      cashfree.checkout(checkoutOptions).then((result: any) => {
        if (result.error) {
          console.error('Payment failed:', result.error)
          router.push(`/payment/failure?order_id=${orderId}&reason=payment_failed`)
        }
      }).catch((error: any) => {
        console.error('Payment error:', error)
        router.push(`/payment/failure?order_id=${orderId}&reason=network_error`)
      })
    } else {
      setStatus('Payment system not available')
      setTimeout(() => {
        router.push(`/payment/failure?order_id=${orderId}&reason=system_error`)
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h1>
        <p className="text-gray-600">{status}</p>
        <p className="text-sm text-gray-500 mt-4">Please do not close this window...</p>
      </div>
    </div>
  )
}