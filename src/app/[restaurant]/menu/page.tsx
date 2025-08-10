'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import WelcomeScreen from '@/components/customer/WelcomeScreen'
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
  Search,
  Home
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
  online_ordering_enabled: boolean | null
}

type CartItem = {
  dish: MenuItem
  quantity: number
}

type CustomerInfo = {
  name: string
  phone: string
  tableNumber: string
  address: string
}

export default function PublicMenuPage() {
  const params = useParams()
  const router = useRouter()
  const restaurantSlug = params.restaurant as string
  
  const [showWelcome, setShowWelcome] = useState(true)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [dishes, setDishes] = useState<MenuItem[]>([])
  const [filteredDishes, setFilteredDishes] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [orderType, setOrderType] = useState<'dine_in' | 'online'>('dine_in')
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    tableNumber: '',
    address: ''
  })
  const [orderLoading, setOrderLoading] = useState(false)
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null)
  const [showDishDetails, setShowDishDetails] = useState(false)
  const [cashPaymentEnabled, setCashPaymentEnabled] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online')

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
          .select('id, name, slug, online_ordering_enabled')
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

  // Get icon for category based on dish type
  const getCategoryIcon = (category: string): string => {
    const categoryLower = category.toLowerCase();
    
    // Common food category icons
    const iconMap: { [key: string]: string } = {
      // Main dishes
      'main': '🍽️',
      'mains': '🍽️',
      'main course': '🍽️',
      'entree': '🍽️',
      'entrees': '🍽️',
      
      // Appetizers
      'appetizer': '🥗',
      'appetizers': '🥗',
      'starter': '🥗',
      'starters': '🥗',
      'snacks': '🥨',
      'snack': '🥨',
      
      // Beverages
      'beverage': '🥤',
      'beverages': '🥤',
      'drinks': '🥤',
      'drink': '🥤',
      'juice': '🧃',
      'juices': '🧃',
      'coffee': '☕',
      'tea': '🍵',
      'smoothie': '🥤',
      'smoothies': '🥤',
      
      // Desserts
      'dessert': '🍰',
      'desserts': '🍰',
      'sweet': '🍭',
      'sweets': '🍭',
      'cake': '🎂',
      'cakes': '🎂',
      'ice cream': '🍦',
      'pastry': '🥧',
      'pastries': '🥧',
      
      // Specific foods
      'pizza': '🍕',
      'pizzas': '🍕',
      'burger': '🍔',
      'burgers': '🍔',
      'pasta': '🍝',
      'noodles': '🍜',
      'rice': '🍚',
      'biryani': '🍛',
      'curry': '🍛',
      'curries': '🍛',
      'soup': '🍲',
      'soups': '🍲',
      'salad': '🥗',
      'salads': '🥗',
      'sandwich': '🥪',
      'sandwiches': '🥪',
      'wrap': '🌯',
      'wraps': '🌯',
      'taco': '🌮',
      'tacos': '🌮',
      'sushi': '🍣',
      'ramen': '🍜',
      'dumplings': '🥟',
      'bread': '🍞',
      'eggs': '🥚',
      'egg': '🥚',
      'chicken': '🍗',
      'meat': '🥩',
      'seafood': '🦐',
      'fish': '🐟',
      'vegetarian': '🥬',
      'vegan': '🌱',
      'healthy': '🥗',
      'spicy': '🌶️',
      'chinese': '🥢',
      'indian': '🍛',
      'italian': '🍝',
      'mexican': '🌮',
      'japanese': '🍣',
      'thai': '🍜',
      'continental': '🍽️',
      'fast food': '🍔',
      'street food': '🌭',
      'breakfast': '🍳',
      'lunch': '🍽️',
      'dinner': '🍽️'
    };
    
    // Return specific icon if found, otherwise return a generic food icon
    return iconMap[categoryLower] || '🍴';
  };



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



  const handleGetStarted = () => {
    setShowWelcome(false)
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
          table_number: orderType === 'dine_in' ? customerInfo.tableNumber : null,
          customer_address: orderType === 'online' ? customerInfo.address : null,
          order_type: orderType,
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
      setCustomerInfo({ name: '', phone: '', tableNumber: '', address: '' })

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
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 via-violet-800 to-pink-900 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-purple-900/30"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading restaurant...</p>
        </div>
      </div>
    )
  }

  // Show welcome screen first
  if (showWelcome && restaurant) {
    return (
      <WelcomeScreen
        restaurantName={restaurant.name}
        restaurantSlug={restaurantSlug}
        onGetStarted={handleGetStarted}
      />
    )
  }

  // Error state
  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 via-violet-800 to-pink-900 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-purple-900/30"></div>
        <div className="text-center relative z-10">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Restaurant Not Found</h1>
          <p className="text-white/80 mb-4">
            {error || 'The restaurant you are looking for does not exist.'}
          </p>
          <p className="text-sm text-white/60">
            Please check the URL and try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative pb-20">
      {/* Modern Header Section */}
      <div className="bg-white px-4 py-6 sticky top-0 z-40 border-b border-gray-200 shadow-sm">
        {/* Header with Menu title and profile */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-purple-700">Menu</h1>
          <motion.div 
            className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-200 transition-colors"
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/auth/user-login')}
          >
            <User className="w-6 h-6 text-purple-700" />
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Dynamic Category Icons */}
        <div className="flex gap-4 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* All Category */}
          <motion.div
            className="flex flex-col items-center cursor-pointer flex-shrink-0"
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('all')}
          >
            <div className={`w-16 h-16 ${selectedCategory === 'all' ? 'bg-purple-600' : 'bg-gray-100 border border-gray-200'} rounded-2xl flex items-center justify-center mb-2 shadow-sm`}>
              <span className="text-2xl">🍽️</span>
            </div>
            <span className={`text-sm font-medium ${selectedCategory === 'all' ? 'text-purple-600 font-semibold' : 'text-gray-600'}`}>
              All
            </span>
          </motion.div>

          {/* Dynamic Categories from Dishes */}
          {getCategories().filter(cat => cat !== 'all').map((category) => {
            const categoryIcon = getCategoryIcon(category);
            const isActive = selectedCategory === category.toLowerCase();
            
            return (
              <motion.div
                key={category}
                className="flex flex-col items-center cursor-pointer flex-shrink-0"
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.toLowerCase())}
              >
                <div className={`w-16 h-16 ${isActive ? 'bg-purple-600' : 'bg-gray-100 border border-gray-200'} rounded-2xl flex items-center justify-center mb-2 shadow-sm`}>
                  <span className="text-2xl">{categoryIcon}</span>
                </div>
                <span className={`text-sm font-medium ${isActive ? 'text-purple-600 font-semibold' : 'text-gray-600'} capitalize`}>
                  {category}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Menu Content */}
      <div className="px-4 pb-8 relative z-10">
        {/* Promotions Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Promotions</h2>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Offer 1 - Free Fries */}
            <motion.div
              className="bg-purple-600 rounded-2xl p-6 relative overflow-hidden shadow-lg border border-purple-200 flex-shrink-0 w-80"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-white/90 text-sm mb-1">Today's Offer</p>
                  <h3 className="text-white font-bold text-lg mb-1">Free box of fries</h3>
                  <p className="text-white/90 text-sm">on all orders above ₹350</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🍟</span>
                </div>
              </div>
            </motion.div>

            {/* Offer 2 - Discount */}
            <motion.div
              className="bg-purple-600 rounded-2xl p-6 relative overflow-hidden shadow-lg border border-purple-200 flex-shrink-0 w-80"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-white/90 text-sm mb-1">Weekend Special</p>
                  <h3 className="text-white font-bold text-lg mb-1">20% OFF</h3>
                  <p className="text-white/90 text-sm">on all beverages</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🥤</span>
                </div>
              </div>
            </motion.div>

            {/* Offer 3 - Combo Deal */}
            <motion.div
              className="bg-purple-600 rounded-2xl p-6 relative overflow-hidden shadow-lg border border-purple-200 flex-shrink-0 w-80"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-white/90 text-sm mb-1">Combo Deal</p>
                  <h3 className="text-white font-bold text-lg mb-1">Buy 2 Get 1</h3>
                  <p className="text-white/90 text-sm">on selected desserts</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🍰</span>
                </div>
              </div>
            </motion.div>

            {/* Offer 4 - Happy Hour */}
            <motion.div
              className="bg-purple-600 rounded-2xl p-6 relative overflow-hidden shadow-lg border border-purple-200 flex-shrink-0 w-80"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-white/90 text-sm mb-1">Happy Hour</p>
                  <h3 className="text-white font-bold text-lg mb-1">50% OFF</h3>
                  <p className="text-white/90 text-sm">4PM - 6PM daily</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏰</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Popular Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Popular</h2>
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
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredDishes.slice(0, 6).map((dish, index) => (
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
                    y: -4,
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  className="bg-white rounded-2xl p-4 relative overflow-hidden border border-gray-200 shadow-md cursor-pointer hover:shadow-lg hover:border-purple-200 transition-all duration-200"
                  onClick={() => {
                    setSelectedDish(dish)
                    setShowDishDetails(true)
                  }}
                >
                  {/* Dish Image */}
                  <div className="w-full h-32 mb-3 relative">
                    {dish.image_url ? (
                      <img
                        src={dish.image_url}
                        alt={dish.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                        <Utensils className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Dish Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight">
                      {dish.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-600 font-bold text-lg">
                        ₹{dish.price}
                      </span>
                      
                      {/* Add Button */}
                      {getCartItemQuantity(dish.id) === 0 ? (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            addToCart(dish)
                          }}
                          className="w-8 h-8 bg-purple-600 rounded-full shadow-md flex items-center justify-center"
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </motion.button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFromCart(dish.id)
                            }}
                            className="w-6 h-6 bg-purple-600 rounded-full shadow-md flex items-center justify-center"
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus className="w-3 h-3 text-white" />
                          </motion.button>
                          <span className="font-bold text-sm min-w-[1.5rem] text-center text-gray-900">
                            {getCartItemQuantity(dish.id)}
                          </span>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              addToCart(dish)
                            }}
                            className="w-6 h-6 bg-purple-600 rounded-full shadow-md flex items-center justify-center"
                            whileTap={{ scale: 0.9 }}
                          >
                            <Plus className="w-3 h-3 text-white" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        </div>

        {/* Enhanced Floating Go to Cart Button */}
        {getCartItemCount() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-20 left-4 right-4 z-40"
          >
            <motion.button
              onClick={() => setShowCart(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-2xl shadow-xl flex items-center justify-between font-semibold border border-purple-500"
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ShoppingCart className="w-5 h-5" />
                </motion.div>
                <div className="flex flex-col items-start">
                  <span className="text-lg">Go to Cart</span>
                  <span className="text-sm text-purple-200">{getCartItemCount()} items added</span>
                </div>
              </div>
              <div className="flex items-center bg-white/20 px-3 py-2 rounded-xl">
                <IndianRupee className="w-5 h-5" />
                <span className="text-lg font-bold">{getCartTotal().toFixed(2)}</span>
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 shadow-lg">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <motion.button
              className="flex flex-col items-center p-2"
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-6 h-6 text-purple-600" />
            </motion.button>
            
            <motion.button
              className="flex flex-col items-center p-2"
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-6 h-6 text-gray-400" />
            </motion.button>
            
            <motion.button
              className="flex flex-col items-center p-2 relative"
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart className="w-6 h-6 text-gray-400" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center shadow-lg font-bold">
                  {getCartItemCount()}
                </span>
              )}
            </motion.button>
            
            <motion.button
              className="flex flex-col items-center p-2"
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth/user-login')}
            >
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 hover:bg-purple-100 hover:border-purple-200 transition-colors">
                <User className="w-4 h-4 text-gray-600 hover:text-purple-600 transition-colors" />
              </div>
            </motion.button>
          </div>
        </div>
      </div>



      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:mx-4 rounded-t-lg sm:rounded-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* Cart Header - Fixed */}
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
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

            {/* Scrollable Cart Items */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative">
              {/* Scroll indicator gradients */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
              
              <div className="p-4">
              {cart.map((item) => (
                <div key={item.dish.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.dish.name}</h3>
                    <div className="flex items-center text-purple-600 text-sm">
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
            </div>

            {/* Cart Footer - Fixed */}
            <div className="p-4 border-t bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <div className="flex items-center text-purple-600 font-bold text-xl">
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
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
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
          <div className="bg-white w-full sm:max-w-md sm:mx-4 rounded-t-lg sm:rounded-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* Checkout Header - Fixed */}
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative">
              {/* Scroll indicator gradient */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
              
              {/* Customer Info Form */}
              <div className="p-4 space-y-6">
              {/* Order Type Selection - Always show, but disable online if not enabled */}
              <div>
                <Label className="text-base font-semibold text-gray-900 mb-3 block">Choose Order Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    onClick={() => setOrderType('dine_in')}
                    className={`py-4 px-4 rounded-xl border-2 transition-all ${
                      orderType === 'dine_in'
                        ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-md'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        orderType === 'dine_in' ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        <Utensils className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-semibold block">Dine In</span>
                        <span className="text-xs text-gray-500">Eat at restaurant</span>
                      </div>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => restaurant?.online_ordering_enabled && setOrderType('online')}
                    disabled={!restaurant?.online_ordering_enabled}
                    className={`py-4 px-4 rounded-xl border-2 transition-all ${
                      !restaurant?.online_ordering_enabled
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : orderType === 'online'
                        ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-md'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                    whileTap={restaurant?.online_ordering_enabled ? { scale: 0.98 } : {}}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        !restaurant?.online_ordering_enabled
                          ? 'bg-gray-100'
                          : orderType === 'online' 
                          ? 'bg-purple-100' 
                          : 'bg-gray-100'
                      }`}>
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-semibold block">Order Online</span>
                        <span className="text-xs text-gray-500">
                          {restaurant?.online_ordering_enabled ? 'Home delivery' : 'Not available'}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                </div>
                
                {!restaurant?.online_ordering_enabled && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      <span className="font-medium">Online ordering is currently unavailable.</span> 
                      Please choose dine-in option.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="customerName" className="text-base font-medium text-gray-900">
                  Your Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="Enter your full name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-2 py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0"
                />
              </div>

              <div>
                <Label htmlFor="customerPhone" className="text-base font-medium text-gray-900">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="Enter your 10-digit phone number"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-2 py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0"
                />
              </div>

              {/* Conditional Field - Table Number or Address */}
              {orderType === 'dine_in' ? (
                <div>
                  <Label htmlFor="tableNumber" className="text-base font-medium text-gray-900">
                    Table Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tableNumber"
                    type="text"
                    placeholder="e.g., Table 5, A1, etc."
                    value={customerInfo.tableNumber}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, tableNumber: e.target.value }))}
                    className="mt-2 py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Please enter your table number as shown on your table
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="customerAddress" className="text-base font-medium text-gray-900">
                    Delivery Address <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="customerAddress"
                    placeholder="Enter your complete delivery address with landmarks"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="mt-2 w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 resize-none"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Include house number, street, area, and nearby landmarks
                  </p>
                </div>
              )}

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
                  <div className="flex items-center text-purple-600">
                    <IndianRupee className="w-4 h-4" />
                    <span>{getCartTotal().toFixed(2)}</span>
                  </div>
                </div>
                </div>
              </div>
            </div>

            {/* Checkout Footer - Fixed */}
            <div className="p-4 border-t bg-gray-50 flex-shrink-0">
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
                  disabled={
                    !customerInfo.name || 
                    !customerInfo.phone || 
                    (orderType === 'dine_in' && !customerInfo.tableNumber) ||
                    (orderType === 'online' && !customerInfo.address) ||
                    orderLoading
                  }
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
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
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-full shadow-md">
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