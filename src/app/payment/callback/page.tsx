'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function PaymentCallback() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const orderId = searchParams.get('order_id')
      const orderStatus = searchParams.get('order_status')
      const paymentStatus = searchParams.get('payment_status')
      const cfPaymentId = searchParams.get('cf_payment_id')

      if (!orderId) {
        router.push('/payment/failure?reason=missing_order_id')
        return
      }

      // Check payment status from URL parameters
      if (paymentStatus === 'SUCCESS' || orderStatus === 'PAID') {
        router.push(`/payment/success?order_id=${orderId}&from_payment=true`)
      } else if (paymentStatus === 'FAILED' || orderStatus === 'FAILED') {
        const reason = searchParams.get('reason') || 'payment_failed'
        router.push(`/payment/failure?order_id=${orderId}&reason=${reason}`)
      } else {
        // If status is unclear, wait for webhook to update and then check
        setTimeout(async () => {
          try {
            const response = await fetch(`/api/orders/${orderId}`)
            const data = await response.json()
            
            if (data.success && data.order) {
              if (data.order.payment_status === 'completed') {
                router.push(`/payment/success?order_id=${orderId}&from_payment=true`)
              } else if (data.order.payment_status === 'failed') {
                router.push(`/payment/failure?order_id=${orderId}&reason=payment_failed`)
              } else {
                // Still pending after waiting - assume success and let success page handle it
                router.push(`/payment/success?order_id=${orderId}&from_payment=true`)
              }
            } else {
              router.push(`/payment/failure?order_id=${orderId}&reason=order_not_found`)
            }
          } catch (error) {
            // On error, assume success and let success page handle verification
            router.push(`/payment/success?order_id=${orderId}&from_payment=true`)
          }
        }, 3000) // Wait 3 seconds for webhook to process
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment...</h2>
        <p className="text-gray-600">Please wait while we verify your payment status.</p>
      </div>
    </div>
  )
}