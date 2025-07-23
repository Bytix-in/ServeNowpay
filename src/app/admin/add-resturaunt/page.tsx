'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users,
  Settings,
  BarChart3,
  Shield,
  CreditCard,
  Database,
  Activity,
  Loader2,
  LogOut,
  LayoutGrid,
  PlusCircle,
  Store,
  MapPin,
  ArrowLeft,
  Upload,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getCurrentUserWithRole, signOut, type User } from '@/lib/auth'
import { useEffect } from 'react'

// Define restaurant type
type Restaurant = {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'pending' | 'inactive';
  onboardedDate: string;
  owner: string;
}

export default function AddRestaurant() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    owner: '',
    email: '',
    phone: '',
    description: '',
    cuisine: '',
    openingHours: '',
  })
  
  const [formStep, setFormStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUserWithRole()
        
        if (!currentUser || currentUser.role !== 'admin') {
          router.push('/auth/login')
          return
        }
        
        setUser(currentUser)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const nextStep = () => {
    setFormStep(prev => prev + 1)
  }

  const prevStep = () => {
    setFormStep(prev => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Here you would typically send the data to your backend
      console.log('Submitting restaurant data:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Redirect to dashboard after successful submission
      router.push('/admin')
    } catch (error) {
      console.error('Error submitting restaurant:', error)
      setIsSubmitting(false)
    }
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render the page if user is not authenticated
  if (!user) {
    return null
  }

  // Navigation items for the sidebar
  const navItems = [
    { name: 'Dashboard', icon: LayoutGrid, href: '/admin', active: false },
    { name: 'Add Restaurant', icon: PlusCircle, href: '/admin/add-restaurant', active: true },
    { name: 'Analytics', icon: BarChart3, href: '/admin/analytics', active: false },
    { name: 'Settings', icon: Settings, href: '/admin/settings', active: false },
  ]

  // Quick actions for the sidebar
  const sidebarQuickActions = [
    { name: 'New Restaurant', icon: PlusCircle, href: '/admin/add-restaurant' },
  ]

  return (
    <>
        {/* Header */}
        <header className="border-b bg-card">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push('/admin')}
                  className="mr-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold">Add Restaurant</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    formStep >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    1
                  </div>
                  <div className={`h-1 w-12 ${
                    formStep >= 2 ? 'bg-black' : 'bg-gray-200'
                  }`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    formStep >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    2
                  </div>
                  <div className={`h-1 w-12 ${
                    formStep >= 3 ? 'bg-black' : 'bg-gray-200'
                  }`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    formStep >= 3 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    3
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Step {formStep} of 3
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className={formStep >= 1 ? 'text-black font-medium' : 'text-gray-500'}>Basic Info</span>
                <span className={formStep >= 2 ? 'text-black font-medium' : 'text-gray-500'}>Details</span>
                <span className={formStep >= 3 ? 'text-black font-medium' : 'text-gray-500'}>Confirmation</span>
              </div>
            </div>

            {/* Form */}
            <motion.div
              key={formStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="bg-white rounded-lg border shadow-sm p-6">
                {formStep === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Restaurant Basic Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Restaurant Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter restaurant name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                          Location *
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="City, State"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">
                          Owner Name *
                        </label>
                        <input
                          type="text"
                          id="owner"
                          name="owner"
                          value={formData.owner}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Full name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                  </div>
                )}

                {formStep === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Restaurant Details</h2>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Brief description of the restaurant"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">
                          Cuisine Type
                        </label>
                        <select
                          id="cuisine"
                          name="cuisine"
                          value={formData.cuisine}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select cuisine type</option>
                          <option value="italian">Italian</option>
                          <option value="mexican">Mexican</option>
                          <option value="chinese">Chinese</option>
                          <option value="indian">Indian</option>
                          <option value="japanese">Japanese</option>
                          <option value="american">American</option>
                          <option value="mediterranean">Mediterranean</option>
                          <option value="thai">Thai</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="openingHours" className="block text-sm font-medium text-gray-700 mb-1">
                          Opening Hours
                        </label>
                        <input
                          type="text"
                          id="openingHours"
                          name="openingHours"
                          value={formData.openingHours}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g. Mon-Fri: 9AM-10PM, Sat-Sun: 10AM-11PM"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Restaurant Logo
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <Upload className="h-6 w-6 text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          Drag and drop your logo here, or click to browse
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG or SVG (max. 2MB)
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/png, image/jpeg, image/svg+xml"
                        />
                        <Button variant="outline" size="sm" className="mt-4">
                          Upload Logo
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {formStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold mb-4">Review & Confirm</h2>
                    
                    <div className="bg-gray-50 rounded-md p-4">
                      <h3 className="font-medium mb-3">Restaurant Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Restaurant Name</p>
                          <p className="font-medium">{formData.name || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            {formData.location || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Owner</p>
                          <p className="font-medium">{formData.owner || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Contact Email</p>
                          <p className="font-medium">{formData.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Contact Phone</p>
                          <p className="font-medium">{formData.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Cuisine Type</p>
                          <p className="font-medium capitalize">{formData.cuisine || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Opening Hours</p>
                          <p className="font-medium flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            {formData.openingHours || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      
                      {formData.description && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">Description</p>
                          <p className="text-sm mt-1">{formData.description}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-blue-50 rounded-md p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Store className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">Ready to onboard</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              By clicking "Complete Onboarding", this restaurant will be added to the ServeNow platform.
                              You can edit restaurant details later from the dashboard.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  {formStep > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={prevStep}
                      disabled={isSubmitting}
                    >
                      Previous
                    </Button>
                  )}
                  
                  {formStep < 3 ? (
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      className="ml-auto"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button 
                      type="submit"
                      className="ml-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Complete Onboarding'
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </div>
    </>
  )
}