'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  MapPin,
  Phone,
  Mail,
  Users,
  Calendar,
  Tag,
  User,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Edit2,
  Save,
  XIcon,
  Key,
  Copy,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

interface RestaurantDetails {
  id: string
  name: string
  slug: string
  owner_name: string
  phone_number: string
  email: string
  address: string
  cuisine_tags: string
  seating_capacity: number | null
  status: 'active' | 'inactive'
  restaurant_username: string
  webhook_configured: boolean
  webhook_url: string | null
  created_at: string
  updated_at: string
}

interface RestaurantDetailsModalProps {
  restaurantId: string | null
  isOpen: boolean
  onClose: () => void
  onStatusUpdate?: (id: string, status: 'active' | 'inactive') => void
}

export default function RestaurantDetailsModal({
  restaurantId,
  isOpen,
  onClose,
  onStatusUpdate
}: RestaurantDetailsModalProps) {
  const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [editMode, setEditMode] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<RestaurantDetails>>({})
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [generatingCredentials, setGeneratingCredentials] = useState(false)
  const [newCredentials, setNewCredentials] = useState<{username: string, password: string} | null>(null)
  const [credentialsCopied, setCredentialsCopied] = useState<{username: boolean, password: boolean}>({username: false, password: false})
  const [configuringWebhook, setConfiguringWebhook] = useState(false)
  const [webhookStatus, setWebhookStatus] = useState<{configured: boolean, url?: string}>({configured: false})

  useEffect(() => {
    if (isOpen && restaurantId) {
      // Reset all credential-related state when opening a different restaurant
      setNewCredentials(null)
      setCredentialsCopied({username: false, password: false})
      setEditMode(null)
      setEditValues({})
      setSuccessMessage(null)
      fetchRestaurantDetails()
    }
  }, [isOpen, restaurantId])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNewCredentials(null)
      setCredentialsCopied({username: false, password: false})
      setEditMode(null)
      setEditValues({})
      setSuccessMessage(null)
      setRestaurant(null)
    }
  }, [isOpen])

  const fetchRestaurantDetails = async () => {
    if (!restaurantId) return

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRestaurant(data.restaurant)
        // Set webhook status from restaurant data
        setWebhookStatus({
          configured: data.restaurant.webhook_configured || false,
          url: data.restaurant.webhook_url
        })
      } else {
        console.error('Failed to fetch restaurant details')
      }
    } catch (error) {
      console.error('Error fetching restaurant details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async () => {
    if (!restaurant) return

    setUpdating(true)
    try {
      const newStatus = restaurant.status === 'active' ? 'inactive' : 'active'
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/admin/restaurants/${restaurant.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setRestaurant(prev => prev ? { ...prev, status: newStatus } : null)
        onStatusUpdate?.(restaurant.id, newStatus)
      } else {
        console.error('Failed to update restaurant status')
      }
    } catch (error) {
      console.error('Error updating restaurant status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleEdit = (field: string) => {
    if (!restaurant) return
    setEditMode(field)
    setEditValues({ [field]: restaurant[field as keyof RestaurantDetails] })
  }

  const handleCancelEdit = () => {
    setEditMode(null)
    setEditValues({})
  }

  const handleSaveEdit = async () => {
    if (!restaurant || !editMode) return

    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editValues),
      })

      if (response.ok) {
        const data = await response.json()
        setRestaurant(data.restaurant)
        setEditMode(null)
        setEditValues({})
        setSuccessMessage('Restaurant updated successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        console.error('Failed to update restaurant')
      }
    } catch (error) {
      console.error('Error updating restaurant:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateCredentials = async () => {
    if (!restaurant) return

    setGeneratingCredentials(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/admin/restaurants/${restaurant.id}/credentials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNewCredentials({
          username: data.username,
          password: data.password
        })
        // Reset copied state for new credentials
        setCredentialsCopied({username: false, password: false})
        // Update the restaurant data with new username
        setRestaurant(prev => prev ? { ...prev, restaurant_username: data.username } : null)
        setSuccessMessage('New manager credentials generated successfully!')
        setTimeout(() => setSuccessMessage(null), 5000)
      } else {
        console.error('Failed to generate credentials')
      }
    } catch (error) {
      console.error('Error generating credentials:', error)
    } finally {
      setGeneratingCredentials(false)
    }
  }

  const copyToClipboard = (text: string, type?: 'username' | 'password') => {
    navigator.clipboard.writeText(text)
    setSuccessMessage('Copied to clipboard!')
    setTimeout(() => setSuccessMessage(null), 2000)
    
    // If copying new credentials, mark them as copied
    if (type && newCredentials) {
      setCredentialsCopied(prev => ({
        ...prev,
        [type]: true
      }))
    }
  }

  const configureWebhook = async () => {
    if (!restaurant) return
    
    setConfiguringWebhook(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/admin/restaurants/${restaurant.id}/webhook-config`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setWebhookStatus({
          configured: true,
          url: data.webhook_url
        })
        setSuccessMessage('Webhook configured successfully! Real-time payment updates are now enabled.')
        setTimeout(() => setSuccessMessage(null), 5000)
      } else {
        const errorData = await response.json()
        console.error('Failed to configure webhook:', errorData)
        setSuccessMessage(`Failed to configure webhook: ${errorData.error}`)
        setTimeout(() => setSuccessMessage(null), 5000)
      }
    } catch (error) {
      console.error('Error configuring webhook:', error)
      setSuccessMessage('Error configuring webhook. Please try again.')
      setTimeout(() => setSuccessMessage(null), 5000)
    } finally {
      setConfiguringWebhook(false)
    }
  }

  const renderEditableField = (
    field: keyof RestaurantDetails,
    label: string,
    icon: React.ReactNode,
    type: 'text' | 'email' | 'tel' | 'number' | 'textarea' = 'text'
  ) => {
    if (!restaurant) return null

    const isEditing = editMode === field
    const value = restaurant[field]

    return (
      <div className="flex items-center justify-between text-sm text-gray-600 group">
        <div className="flex items-center flex-1">
          {icon}
          <span className="mr-2"><strong>{label}:</strong></span>
          {isEditing ? (
            type === 'textarea' ? (
              <textarea
                value={editValues[field] as string || ''}
                onChange={(e) => setEditValues(prev => ({ ...prev, [field]: e.target.value }))}
                className="flex-1 px-2 py-1 border rounded text-sm"
                rows={2}
                autoFocus
              />
            ) : (
              <input
                type={type}
                value={editValues[field] as string || ''}
                onChange={(e) => setEditValues(prev => ({ 
                  ...prev, 
                  [field]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value 
                }))}
                className="flex-1 px-2 py-1 border rounded text-sm"
                autoFocus
              />
            )
          ) : (
            <span className="flex-1">
              {field === 'seating_capacity' 
                ? `${value || 'Not specified'} seats`
                : value || 'Not specified'
              }
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSaveEdit}
                disabled={saving}
                className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEdit}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEdit(field)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Restaurant Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mx-6 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                {successMessage}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading restaurant details...</span>
              </div>
            ) : restaurant ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center flex-1 group">
                      <Building className="h-5 w-5 mr-2 text-gray-600" />
                      {editMode === 'name' ? (
                        <input
                          type="text"
                          value={editValues.name || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                          className="text-lg font-medium text-gray-900 bg-white border rounded px-2 py-1 flex-1"
                          autoFocus
                        />
                      ) : (
                        <h3 className="text-lg font-medium text-gray-900 flex-1">{restaurant.name}</h3>
                      )}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        {editMode === 'name' ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveEdit}
                              disabled={saving}
                              className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                            >
                              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            >
                              <XIcon className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit('name')}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        restaurant.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {restaurant.status === 'active' ? (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        {restaurant.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        onClick={handleStatusToggle}
                        disabled={updating}
                        size="sm"
                        variant={restaurant.status === 'active' ? 'destructive' : 'default'}
                      >
                        {updating ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : null}
                        {restaurant.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Restaurant ID:</strong> {restaurant.id}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 group">
                    <div className="flex items-center flex-1">
                      <span className="mr-2"><strong>URL Slug:</strong></span>
                      {editMode === 'slug' ? (
                        <input
                          type="text"
                          value={editValues.slug || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, slug: e.target.value }))}
                          className="flex-1 px-2 py-1 border rounded text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="flex-1">/{restaurant.slug}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editMode === 'slug' ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                          >
                            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                          >
                            <XIcon className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit('slug')}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-600" />
                    Owner Information
                  </h4>
                  <div className="space-y-3">
                    {renderEditableField('owner_name', 'Name', <User className="h-4 w-4 mr-2 text-gray-400" />)}
                    {renderEditableField('phone_number', 'Phone', <Phone className="h-4 w-4 mr-2 text-gray-400" />, 'tel')}
                    {renderEditableField('email', 'Email', <Mail className="h-4 w-4 mr-2 text-gray-400" />, 'email')}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-600" />
                    Location
                  </h4>
                  <div className="bg-gray-50 p-3 rounded group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {editMode === 'address' ? (
                          <textarea
                            value={editValues.address || ''}
                            onChange={(e) => setEditValues(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full px-2 py-1 border rounded text-sm"
                            rows={3}
                            autoFocus
                          />
                        ) : (
                          <div className="text-sm text-gray-600">
                            {restaurant.address || 'No address provided'}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        {editMode === 'address' ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveEdit}
                              disabled={saving}
                              className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                            >
                              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            >
                              <XIcon className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit('address')}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Restaurant Details */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Restaurant Details</h4>
                  <div className="space-y-3">
                    {renderEditableField('cuisine_tags', 'Cuisine', <Tag className="h-4 w-4 mr-2 text-gray-400" />)}
                    {renderEditableField('seating_capacity', 'Seating', <Users className="h-4 w-4 mr-2 text-gray-400" />, 'number')}
                  </div>
                </div>

                {/* Manager Access */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900 flex items-center">
                      <Key className="h-4 w-4 mr-2 text-gray-600" />
                      Manager Access
                    </h4>
                    <Button
                      onClick={handleGenerateCredentials}
                      disabled={generatingCredentials}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      {generatingCredentials ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      Generate New
                    </Button>
                  </div>

                  {/* Show New Credentials if just generated */}
                  {newCredentials ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">New Credentials Generated</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-white p-2 rounded border">
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Username:</span>
                              {credentialsCopied.username ? (
                                <span className="ml-2 text-gray-500 italic">*** Copied and Hidden ***</span>
                              ) : (
                                <span className="ml-2 font-mono text-gray-900">{newCredentials.username}</span>
                              )}
                            </div>
                            {!credentialsCopied.username && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(newCredentials.username, 'username')}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                            {credentialsCopied.username && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between bg-white p-2 rounded border">
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Password:</span>
                              {credentialsCopied.password ? (
                                <span className="ml-2 text-gray-500 italic">*** Copied and Hidden ***</span>
                              ) : (
                                <span className="ml-2 font-mono text-gray-900">{newCredentials.password}</span>
                              )}
                            </div>
                            {!credentialsCopied.password && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(newCredentials.password, 'password')}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                            {credentialsCopied.password && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-green-700">
                          {credentialsCopied.username && credentialsCopied.password ? (
                            <div className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Both credentials have been copied and are now hidden for security.
                            </div>
                          ) : (
                            <div>
                              ⚠️ Copy these credentials securely. They will be hidden after copying and cannot be retrieved again.
                              {(credentialsCopied.username || credentialsCopied.password) && (
                                <div className="mt-1 text-xs">
                                  {credentialsCopied.username && !credentialsCopied.password && "Username copied. Don't forget to copy the password."}
                                  {!credentialsCopied.username && credentialsCopied.password && "Password copied. Don't forget to copy the username."}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Login Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Login URL:</span>
                            <span className="ml-2 text-blue-600">{process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login</span>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`, '_blank')}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Manager can log in using their credentials at this URL to access the restaurant portal.
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                        <div className="text-xs text-yellow-800">
                          <strong>Instructions for Manager:</strong>
                          <ul className="mt-1 ml-4 list-disc space-y-1">
                            <li>Use the provided username and password to log in</li>
                            <li>Access the restaurant management portal</li>
                            <li>Manage menu items, orders, and settings</li>
                            <li>Change password after first login (recommended)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Clean Default View - matches your image */
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-gray-700">Current Username:</span>
                          <span className="ml-2 font-mono text-gray-900">{restaurant.restaurant_username || 'not_set'}</span>
                        </div>
                        {restaurant.restaurant_username && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(restaurant.restaurant_username!)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <span className="font-medium text-gray-700">Password:</span>
                        <span className="ml-2 text-gray-500">Hidden for security</span>
                      </div>
                      
                      <div className="text-sm text-blue-600">
                        Generate new credentials to get a fresh username and password.
                      </div>
                    </div>
                  )}
                </div>

                {/* Webhook Configuration */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900 flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2 text-gray-600" />
                      Payment Webhooks
                    </h4>
                    <Button
                      onClick={configureWebhook}
                      disabled={configuringWebhook || webhookStatus.configured}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      {configuringWebhook ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : webhookStatus.configured ? (
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      {webhookStatus.configured ? 'Configured' : 'Configure'}
                    </Button>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    webhookStatus.configured 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      {webhookStatus.configured ? (
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 text-yellow-600 mr-2" />
                      )}
                      <span className={`text-sm font-medium ${
                        webhookStatus.configured ? 'text-green-800' : 'text-yellow-800'
                      }`}>
                        {webhookStatus.configured ? 'Webhooks Configured' : 'Webhooks Not Configured'}
                      </span>
                    </div>
                    
                    {webhookStatus.configured ? (
                      <div className="space-y-2">
                        <div className="text-xs text-green-700">
                          ✅ Real-time payment updates are enabled
                        </div>
                        <div className="text-xs text-green-700">
                          ✅ Automatic order status updates
                        </div>
                        <div className="text-xs text-green-700">
                          ✅ No manual payment verification needed
                        </div>
                        {webhookStatus.url && (
                          <div className="text-xs text-gray-600 mt-2">
                            <strong>Webhook URL:</strong> {webhookStatus.url}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs text-yellow-700">
                          ⚠️ Manual payment verification required
                        </div>
                        <div className="text-xs text-yellow-700">
                          ⚠️ Delayed order status updates
                        </div>
                        <div className="text-xs text-yellow-700">
                          ⚠️ Multiple API requests for payment status
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          Configure webhooks to enable real-time payment updates and improve performance.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-600" />
                    Timeline
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span><strong>Created:</strong> {new Date(restaurant.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span><strong>Updated:</strong> {new Date(restaurant.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500">Failed to load restaurant details</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t bg-gray-50">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}