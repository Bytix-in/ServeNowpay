'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard, Settings, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useRestaurant } from '@/hooks/useRestaurant'
import { supabase } from '@/lib/supabase'

const paymentSettingsSchema = z.object({
  cashfree_client_id: z.string().min(1, 'Client ID is required'),
  cashfree_client_secret: z.string().min(1, 'Client Secret is required'),
  cashfree_environment: z.enum(['sandbox', 'production']).default('sandbox')
})

type PaymentSettingsFormValues = z.infer<typeof paymentSettingsSchema>

type PaymentSettings = {
  id?: string
  restaurant_id: string
  cashfree_client_id: string | null
  cashfree_environment: string
  is_payment_enabled: boolean
}

export default function PaymentSettingsPage() {
  const [showSecret, setShowSecret] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null)

  const { restaurant, loading: restaurantLoading } = useRestaurant()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PaymentSettingsFormValues>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      cashfree_client_id: '',
      cashfree_client_secret: '',
      cashfree_environment: 'sandbox'
    }
  })

  // Load existing payment settings
  useEffect(() => {
    if (!restaurant?.id) return

    const loadPaymentSettings = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('payment_settings')
          .select('*')
          .eq('restaurant_id', restaurant.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading payment settings:', error)
          return
        }

        if (data) {
          setPaymentSettings(data)
          reset({
            cashfree_client_id: data.cashfree_client_id || '',
            cashfree_client_secret: '', // Don't populate secret for security
            cashfree_environment: data.cashfree_environment as 'sandbox' | 'production'
          })
        }
      } catch (error) {
        console.error('Error loading payment settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPaymentSettings()
  }, [restaurant?.id, reset])

  const onSubmit = async (data: PaymentSettingsFormValues) => {
    if (!restaurant?.id) return

    try {
      setSaving(true)

      // Call API to save payment settings (we'll create this API route)
      const response = await fetch('/api/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          ...data
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save payment settings')
      }

      const result = await response.json()
      setPaymentSettings(result.data)
      
      alert('Payment settings saved successfully!')
      
      // Clear the secret field for security
      reset({
        ...data,
        cashfree_client_secret: ''
      })

    } catch (error) {
      console.error('Error saving payment settings:', error)
      alert('Failed to save payment settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    if (!paymentSettings?.cashfree_client_id) {
      alert('Please save your payment settings first')
      return
    }

    try {
      setTestingConnection(true)
      setConnectionStatus(null)

      const response = await fetch('/api/test-payment-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurant?.id
        })
      })

      const result = await response.json()

      if (result.success) {
        setConnectionStatus('success')
      } else {
        setConnectionStatus('error')
      }

    } catch (error) {
      console.error('Error testing connection:', error)
      setConnectionStatus('error')
    } finally {
      setTestingConnection(false)
    }
  }

  const togglePaymentStatus = async () => {
    if (!paymentSettings?.id) return

    try {
      const newStatus = !paymentSettings.is_payment_enabled

      const { error } = await supabase
        .from('payment_settings')
        .update({ 
          is_payment_enabled: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentSettings.id)

      if (error) throw error

      setPaymentSettings(prev => prev ? { ...prev, is_payment_enabled: newStatus } : null)
      
      alert(`Payments ${newStatus ? 'enabled' : 'disabled'} successfully!`)

    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Failed to update payment status')
    }
  }

  if (restaurantLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <CreditCard className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Payment Settings</h1>
        </div>

        {/* Payment Status Card */}
        {paymentSettings && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Payment Status</h3>
                <p className="text-gray-600">
                  Payments are currently {paymentSettings.is_payment_enabled ? 'enabled' : 'disabled'} for your restaurant
                </p>
              </div>
              <div className="flex items-center gap-3">
                {paymentSettings.is_payment_enabled ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                <Button
                  onClick={togglePaymentStatus}
                  variant={paymentSettings.is_payment_enabled ? "outline" : "default"}
                  size="sm"
                >
                  {paymentSettings.is_payment_enabled ? 'Disable' : 'Enable'} Payments
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Cashfree Configuration */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Cashfree Configuration</h2>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-blue-900 mb-2">How to get your Cashfree credentials:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Sign up at <a href="https://www.cashfree.com" target="_blank" rel="noopener noreferrer" className="underline">cashfree.com</a></li>
              <li>2. Complete your KYC verification</li>
              <li>3. Go to Developers → API Keys in your Cashfree dashboard</li>
              <li>4. Copy your Client ID and Client Secret</li>
              <li>5. Start with Sandbox mode for testing</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Environment Selection */}
            <div>
              <Label htmlFor="cashfree_environment">Environment</Label>
              <select
                id="cashfree_environment"
                {...register('cashfree_environment')}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sandbox">Sandbox (Testing)</option>
                <option value="production">Production (Live)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Use Sandbox for testing, Production for live transactions
              </p>
            </div>

            {/* Client ID */}
            <div>
              <Label htmlFor="cashfree_client_id">Cashfree Client ID</Label>
              <Input
                id="cashfree_client_id"
                type="text"
                placeholder="Enter your Cashfree Client ID"
                {...register('cashfree_client_id')}
                className={errors.cashfree_client_id ? 'border-red-500' : ''}
              />
              {errors.cashfree_client_id && (
                <p className="text-red-500 text-sm mt-1">{errors.cashfree_client_id.message}</p>
              )}
            </div>

            {/* Client Secret */}
            <div>
              <Label htmlFor="cashfree_client_secret">Cashfree Client Secret</Label>
              <div className="relative">
                <Input
                  id="cashfree_client_secret"
                  type={showSecret ? 'text' : 'password'}
                  placeholder="Enter your Cashfree Client Secret"
                  {...register('cashfree_client_secret')}
                  className={errors.cashfree_client_secret ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.cashfree_client_secret && (
                <p className="text-red-500 text-sm mt-1">{errors.cashfree_client_secret.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Your secret is encrypted and stored securely
              </p>
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              disabled={isSubmitting || saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Save Payment Settings'}
            </Button>
          </form>

          {/* Test Connection */}
          {paymentSettings?.cashfree_client_id && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Test Connection</h3>
                  <p className="text-sm text-gray-600">Verify your Cashfree credentials</p>
                </div>
                <div className="flex items-center gap-3">
                  {connectionStatus === 'success' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Connected</span>
                    </div>
                  )}
                  {connectionStatus === 'error' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">Failed</span>
                    </div>
                  )}
                  <Button
                    onClick={testConnection}
                    disabled={testingConnection}
                    variant="outline"
                    size="sm"
                  >
                    {testingConnection ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}