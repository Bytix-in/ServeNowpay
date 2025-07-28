'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  IndianRupee, 
  Utensils, 
  Plus, 
  Minus, 
  ShoppingCart, 
  X, 
  User,
  Star,
  Heart,
  Search,
  Filter,
  ChefHat,
  Sparkles,
  Eye
} from 'lucide-react'
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
  const router = useRouter()
  const restaurantSlug = params.restaurant as string
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [dishes, setDishes] = useState<MenuItem[]>([])
  const [filteredDishes, setFilteredDishes] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  
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
     const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null)
  const [showDishDetails, setShowDishDetails] = useState(false)

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
        setFilteredDishes(menuData || [])
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

  // Filter dishes based on search and category
  useEffect(() => {
    let filtered = dishes

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(dish => 
        dish.dish_type?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    setFilteredDishes(filtered)
  }, [dishes, searchQuery, selectedCategory])

  // Get unique categories
  const getCategories = (): string[] => {
    const categories = dishes
      .map(dish => dish.dish_type)
      .filter((type): type is string => Boolean(type))
    return ['all', ...Array.from(new Set(categories))]
  }

  // Toggle favorite
  const toggleFavorite = (dishId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(dishId)) {
        newFavorites.delete(dishId)
      } else {
        newFavorites.add(dishId)
      }
      return newFavorites
    })
  }

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

  const viewDishDetails = (dish: MenuItem) => {
    setSelectedDish(dish)
    setShowDishDetails(true)
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
        console.error('Payment creation failed:', errorData)
        
        // Show more specific error messages
        if (errorData.error?.includes('Payment not configured')) {
          throw new Error('Payment system is not set up for this restaurant. Please contact the restaurant.')
        } else if (errorData.error?.includes('credentials')) {
          throw new Error('Payment processing is temporarily unavailable. Please try again later.')
        } else {
          throw new Error(errorData.error || errorData.details || 'Failed to create payment')
        }
      }

      const paymentData = await response.json()

      // Check if payment processing is configured
      if (paymentData.payment_configured === false) {
        // No payment processing - show success message and redirect
        alert(paymentData.message || 'Order placed successfully! The restaurant will contact you for payment.')
        window.location.href = paymentData.redirect_url
        return
      } else if (paymentData.payment_session_id) {
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Modern Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-md shadow-lg border-b border-orange-100 sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {restaurant.name}
                </h1>
                <p className="text-xs text-gray-500">Digital Menu</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={() => router.push('/profile')}
                variant="outline"
                size="sm"
                className="bg-white/50 hover:bg-white/80 border-orange-200 hover:border-orange-300 text-orange-700 hover:text-orange-800 transition-all duration-300"
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            </motion.div>
          </div>

          {/* Hero Section */}
          <motion.div 
            className="text-center py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mb-4 shadow-lg"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Delicious Menu
            </h2>
            <p className="text-gray-600">Discover our carefully crafted dishes</p>
          </motion.div>

          {/* Search and Filter Bar */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/70 border-orange-200 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 bg-white/70 border border-orange-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none appearance-none cursor-pointer"
              >
                {getCategories().map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Menu Content */}
      <div className="container mx-auto px-4 py-8">
        {dishes.length === 0 ? (
          // Empty state
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="text-6xl mb-4"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              📋
            </motion.div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Menu Coming Soon
            </h2>
            <p className="text-gray-600">
              This restaurant hasn't added any dishes to their menu yet.
            </p>
          </motion.div>
        ) : filteredDishes.length === 0 ? (
          // No results state
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No dishes found
            </h2>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          // Dishes Grid
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="grid gap-6 md:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <AnimatePresence mode="popLayout">
                {filteredDishes.map((dish, index) => (
                  <motion.div
                    key={dish.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ 
                      duration: 0.4,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300 overflow-hidden group"
                  >
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {/* Dish Image */}
                        <motion.div 
                          className="flex-shrink-0 relative"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {dish.image_url ? (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shadow-md">
                              <img
                                src={dish.image_url}
                                alt={dish.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center shadow-md">
                              <Utensils className="w-10 h-10 sm:w-12 sm:h-12 text-orange-600" />
                            </div>
                          )}
                          
                          {/* Favorite Button */}
                          <motion.button
                            onClick={() => toggleFavorite(dish.id)}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Heart 
                              className={`w-4 h-4 ${
                                favorites.has(dish.id) 
                                  ? 'text-red-500 fill-red-500' 
                                  : 'text-gray-400'
                              }`} 
                            />
                          </motion.button>
                        </motion.div>

                        {/* Dish Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                                {dish.name}
                              </h3>
                              {dish.dish_type && (
                                <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                  {dish.dish_type}
                                </span>
                              )}
                            </div>
                            <motion.div 
                              className="flex items-center bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg sm:text-xl px-3 py-1 rounded-full shadow-md"
                              whileHover={{ scale: 1.05 }}
                            >
                              <IndianRupee className="w-4 h-4" />
                              <span>{dish.price.toFixed(2)}</span>
                            </motion.div>
                          </div>

                          <p className="text-gray-600 text-sm sm:text-base mb-4 leading-relaxed">
                            {dish.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center text-gray-500 text-sm">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{dish.preparation_time}min</span>
                              </div>
                              <div className="flex items-center text-yellow-500 text-sm">
                                <Star className="w-4 h-4 mr-1 fill-current" />
                                <span>4.5</span>
                              </div>
                            </div>

                            {/* Add to Cart Controls */}
                            <div className="flex items-center gap-2">
                              {getCartItemQuantity(dish.id) === 0 ? (
                                <div className="flex gap-2">
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      onClick={() => viewDishDetails(dish)}
                                      size="sm"
                                      variant="outline"
                                      className="border-orange-300 hover:bg-orange-50 text-orange-700"
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </Button>
                                  </motion.div>
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      onClick={() => addToCart(dish)}
                                      size="sm"
                                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md"
                                    >
                                      <Plus className="w-4 h-4 mr-1" />
                                      Add
                                    </Button>
                                  </motion.div>
                                </div>
                              ) : (
                                <motion.div 
                                  className="flex items-center gap-2"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                  <motion.div whileTap={{ scale: 0.9 }}>
                                    <Button
                                      onClick={() => removeFromCart(dish.id)}
                                      size="sm"
                                      variant="outline"
                                      className="p-1 h-8 w-8 border-orange-300 hover:bg-orange-50"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </Button>
                                  </motion.div>
                                  <motion.span 
                                    className="font-bold text-gray-900 min-w-[2rem] text-center bg-orange-100 px-2 py-1 rounded-lg"
                                    key={getCartItemQuantity(dish.id)}
                                    initial={{ scale: 1.2 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {getCartItemQuantity(dish.id)}
                                  </motion.span>
                                  <motion.div whileTap={{ scale: 0.9 }}>
                                    <Button
                                      onClick={() => addToCart(dish)}
                                      size="sm"
                                      variant="outline"
                                      className="p-1 h-8 w-8 border-orange-300 hover:bg-orange-50"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </motion.div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* Modern Footer */}
        <motion.div 
          className="text-center mt-16 pt-8 border-t border-orange-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-orange-500" />
            </motion.div>
            <p className="text-gray-600 text-sm">
              Powered by <span className="font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">ServeNow</span>
            </p>
          </div>
          <p className="text-xs text-gray-400">Digital dining experience reimagined</p>
        </motion.div>
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            className="fixed bottom-6 right-6 z-50"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{ 
                y: [0, -5, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Button
                onClick={() => setShowCart(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full p-4 shadow-2xl relative"
              >
                <ShoppingCart className="w-6 h-6" />
                <motion.span 
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg"
                  key={getCartItemCount()}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {getCartItemCount()}
                </motion.span>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Dish Details Modal */}
      {showDishDetails && selectedDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Dish Details</h2>
              <Button
                onClick={() => setShowDishDetails(false)}
                variant="outline"
                size="sm"
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Dish Image */}
            <div className="relative w-full h-48 overflow-hidden">
              {selectedDish.image_url ? (
                <img
                  src={selectedDish.image_url}
                  alt={selectedDish.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                  <Utensils className="w-16 h-16 text-orange-600" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full shadow-md">
                  <IndianRupee className="w-3 h-3 inline-block mr-1" />
                  {selectedDish.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Dish Content */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedDish.name}</h3>
                {selectedDish.dish_type && (
                  <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    {selectedDish.dish_type}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{selectedDish.preparation_time} min</span>
                </div>
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  <span>4.5</span>
                </div>
              </div>

              <div className="border-t border-b py-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                <p className="text-gray-800">{selectedDish.description}</p>
              </div>

              {selectedDish.ingredients && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Ingredients</h4>
                  <p className="text-gray-800">{selectedDish.ingredients}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setShowDishDetails(false)}
                  variant="outline"
                  className="flex-1 border-orange-300 text-orange-700"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    addToCart(selectedDish)
                    setShowDishDetails(false)
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}