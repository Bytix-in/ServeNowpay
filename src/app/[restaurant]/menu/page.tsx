'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Clock, IndianRupee, Utensils, Plus, Minus, ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { supabase } from '@/lib/supabase'
import type { MenuItem } from '@/schemas/menu'

type Restaurant = {
  id: string
  name: string
  slug: string
}

type CartItem = {
  dish: MenuItem
  quantity: number
}

type CustomerInfo = {
  name: string
  phone: string
  tableNumber: string
}

export default function PublicMenuPage() {
  const params = useParams()
  const restaurantSlug = params.restaurant as string
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [dishes, setDishes] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    tableNumber: ''
  })
  const [orderLoading, setOrderLoading] = useState(false)

  // Fetch restaurant and menu data
  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('Looking for restaurant with slug:', restaurantSlug)

        // First, fetch the restaurant by slug
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id, name, slug')
          .eq('slug', restaurantSlug)
          .single()

        console.log('Restaurant query result:', { restaurantData, restaurantError })

        if (restaurantError) {
          throw new Error(`Database error: ${restaurantError.message}`)
        }

        if (!restaurantData) {
          throw new Error('Restaurant not found')
        }

        setRestaurant(restaurantData)

        // Then, fetch the menu items for this restaurant
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantData.id)
          .order('name')

        console.log('Menu items query result:', { menuData, menuError })

        if (menuError) {
          throw new Error('Failed to load menu items')
        }

        setDishes(menuData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching restaurant data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (restaurantSlug) {
      fetchRestaurantAndMenu()
    }
  }, [restaurantSlug])

  // Cart functions
  const addToCart = (dish: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.dish.id === dish.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { dish, quantity: 1 }]
    })
  }

  const removeFromCart = (dishId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.dish.id === dishId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.dish.id === dishId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      }
      return prevCart.filter(item => item.dish.id !== dishId)
    })
  }

  const getCartItemQuantity = (dishId: string) => {
    const item = cart.find(item => item.dish.id === dishId)
    return item ? item.quantity : 0
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.dish.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const clearCart = () => {
    setCart([])
    setShowCart(false)
    setShowCheckout(false)
  }

  // Order placement function with payment integration
  const placeOrder = async () => {
    if (!restaurant || cart.length === 0) return

    try {
      setOrderLoading(true)

      // Create payment order
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          table_number: customerInfo.tableNumber,
          items: cart.map(item => ({
            dish_id: item.dish.id,
            dish_name: item.dish.name,
            quantity: item.quantity,
            price: item.dish.price,
            total: item.dish.price * item.quantity
          })),
          total_amount: getCartTotal()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment')
      }

      const paymentData = await response.json()

      // Check if payment processing is configured
      if (paymentData.payment_session_id) {
        // Initialize Cashfree Checkout
        if (typeof window !== 'undefined' && (window as any).Cashfree) {
          console.log('Initializing Cashfree checkout in mode:', paymentData.environment);
          console.log('Payment session ID:', paymentData.payment_session_id);
          
          const cashfree = (window as any).Cashfree({
            mode: paymentData.environment === 'production' ? 'production' : 'sandbox'
          })

          const checkoutOptions = {
            paymentSessionId: paymentData.payment_session_id,
            returnUrl: `${window.location.origin}/payment/success?order_id=${paymentData.order_id}`,
            // Add these options for better compatibility
            components: ["order-details", "card", "upi", "netbanking", "app", "creditcardemi"],
            style: {
              backgroundColor: "#ffffff",
              color: "#11385b",
              fontSize: "14px",
              errorColor: "#ff0000",
              theme: "light" // or "dark"
            }
          }

          cashfree.checkout(checkoutOptions).then((result: any) => {
            if (result.error) {
              console.error('Payment failed:', result.error)
              alert('Payment failed. Please try again.')
            }
          })
        } else {
          // Fallback: redirect to payment page
          window.location.href = `/payment?session_id=${paymentData.payment_session_id}&order_id=${paymentData.order_id}`
        }
      } else if (paymentData.redirect_url) {
        // No payment processing configured - redirect to success page
        alert(paymentData.message || 'Order placed successfully!')
        window.location.href = paymentData.redirect_url
      } else {
        // Standard success case
        alert('Order placed successfully!')
        window.location.href = `/payment/success?order_id=${paymentData.order_id}`
      }

      // Clear cart after initiating payment
      clearCart()
      setCustomerInfo({ name: '', phone: '', tableNumber: '' })

    } catch (err) {
      console.error('Error placing order:', err)
      alert(err instanceof Error ? err.message : 'Failed to place order. Please try again.')
    } finally {
      setOrderLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || 'The restaurant you are looking for does not exist.'}
          </p>
          <p className="text-sm text-gray-500">
            Please check the URL and try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🍽️</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {restaurant.name}
            </h1>
            <p className="text-gray-600 text-lg">Menu</p>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="container mx-auto px-4 py-8">
        {dishes.length === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Menu Coming Soon
            </h2>
            <p className="text-gray-600">
              This restaurant hasn't added any dishes to their menu yet.
            </p>
          </div>
        ) : (
          // Dishes Grid
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6 md:gap-8">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Dish Image/Emoji Placeholder */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Utensils className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />
                        </div>
                      </div>

                      {/* Dish Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                            {dish.name}
                          </h3>
                          <div className="flex items-center text-green-600 font-bold text-lg sm:text-xl">
                            <IndianRupee className="w-5 h-5" />
                            <span>{dish.price.toFixed(2)}</span>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm sm:text-base mb-4 leading-relaxed">
                          {dish.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-500 text-sm">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{dish.preparation_time} minutes prep time</span>
                          </div>

                          {/* Add to Cart Controls */}
                          <div className="flex items-center gap-2">
                            {getCartItemQuantity(dish.id) === 0 ? (
                              <Button
                                onClick={() => addToCart(dish)}
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => removeFromCart(dish.id)}
                                  size="sm"
                                  variant="outline"
                                  className="p-1 h-8 w-8"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="font-medium text-gray-900 min-w-[2rem] text-center">
                                  {getCartItemQuantity(dish.id)}
                                </span>
                                <Button
                                  onClick={() => addToCart(dish)}
                                  size="sm"
                                  variant="outline"
                                  className="p-1 h-8 w-8"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Powered by <span className="font-semibold">ServeNow</span>
          </p>
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setShowCart(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full p-4 shadow-lg relative"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {getCartItemCount()}
            </span>
          </Button>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:mx-4 rounded-t-lg sm:rounded-lg max-h-[90vh] overflow-hidden">
            {/* Cart Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Your Order</h2>
              <Button
                onClick={() => setShowCart(false)}
                variant="outline"
                size="sm"
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 max-h-96">
              {cart.map((item) => (
                <div key={item.dish.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.dish.name}</h3>
                    <div className="flex items-center text-green-600 text-sm">
                      <IndianRupee className="w-4 h-4" />
                      <span>{item.dish.price.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => removeFromCart(item.dish.id)}
                      size="sm"
                      variant="outline"
                      className="p-1 h-8 w-8"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-medium text-gray-900 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <Button
                      onClick={() => addToCart(item.dish)}
                      size="sm"
                      variant="outline"
                      className="p-1 h-8 w-8"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <div className="flex items-center text-green-600 font-bold text-xl">
                  <IndianRupee className="w-5 h-5" />
                  <span>{getCartTotal().toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="flex-1"
                >
                  Clear Cart
                </Button>
                <Button
                  onClick={() => {
                    setShowCart(false)
                    setShowCheckout(true)
                  }}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:mx-4 rounded-t-lg sm:rounded-lg max-h-[90vh] overflow-hidden">
            {/* Checkout Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Order Details</h2>
              <Button
                onClick={() => setShowCheckout(false)}
                variant="outline"
                size="sm"
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Customer Info Form */}
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="customerName">Your Name</Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="Enter your name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="tableNumber">Table Number</Label>
                <Input
                  id="tableNumber"
                  type="text"
                  placeholder="Enter table number"
                  value={customerInfo.tableNumber}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, tableNumber: e.target.value }))}
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-medium mb-2">Order Summary</h3>
                {cart.map((item) => (
                  <div key={item.dish.id} className="flex justify-between text-sm mb-1">
                    <span>{item.dish.name} x{item.quantity}</span>
                    <div className="flex items-center">
                      <IndianRupee className="w-3 h-3" />
                      <span>{(item.dish.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <div className="flex items-center text-green-600">
                    <IndianRupee className="w-4 h-4" />
                    <span>{getCartTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowCheckout(false)
                    setShowCart(true)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Cart
                </Button>
                <Button
                  onClick={placeOrder}
                  disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.tableNumber || orderLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {orderLoading ? 'Placing Order...' : 'Place Order'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}