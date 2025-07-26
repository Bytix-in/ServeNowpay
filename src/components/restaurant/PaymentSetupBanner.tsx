'use client'

import { AlertTriangle, CreditCard, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePaymentStatus } from '@/hooks/usePaymentStatus'
import Link from 'next/link'

export function PaymentSetupBanner() {
  const { requiresSetup, loading } = usePaymentStatus()

  if (loading || !requiresSetup) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800">Payment Setup Required</h3>
            <p className="text-sm text-yellow-700">
              Configure your Cashfree credentials to start accepting payments from customers.
            </p>
          </div>
        </div>
        <Link href="/restaurant/payments">
          <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
            <CreditCard className="w-4 h-4 mr-2" />
            Setup Payments
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

export function PaymentDisabledBanner() {
  const { hasCredentials, isEnabled, loading } = usePaymentStatus()

  if (loading || !hasCredentials || isEnabled) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-800">Payments Disabled</h3>
            <p className="text-sm text-blue-700">
              Your payment credentials are configured but payments are currently disabled.
            </p>
          </div>
        </div>
        <Link href="/restaurant/payments">
          <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
            Enable Payments
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}