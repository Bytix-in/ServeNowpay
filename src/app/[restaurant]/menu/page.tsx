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
  Heart,
  Search,
  Filter,
  ChefHat,
  Sparkles,
  Eye,
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
  
  const [showWelcome, setShowWelcome] = useState(true)
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

  // Get icon for category based on dish type
  const getCategoryIcon = (category: string): string => {
    const categoryLower = category.toLowerCase()
    
    // Common food category icons
    const iconMap: { [key: string]: string } = {
      'main': '🍽️',
      'appetizer': '🥗',
      'beverage': '🥤',
      'dessert': '🍰',
      'pizza': '🍕',
      'burger': '🍔',
      'pasta': '🍝',
      'chinese': '🥢',
      'indian': '🍛',
      'italian': '🍝'
    }
    
    return iconMap[categoryLower] || '🍴'
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

  const handleGetStarted = () => {
    setShowWelcome(false)
  }

  // Simplified order placement function
  const placeOrder = async () => {
    alert('Order functionality will be implemented')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 via-violet-800 to-pink-900 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-purple-900/30"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white text-base sm:text-lg">Loading restaurant...</p>
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
        <div className="text-center relative z-10 px-4">
          <div className="text-4xl sm:text-6xl mb-4">🍽️</div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-lg">Restaurant Not Found</h1>
          <p className="text-white/80 mb-4 text-sm sm:text-base">
            {error || 'The restaurant you are looking for does not exist.'}
          </p>
          <p className="text-xs sm:text-sm text-white/60">
            Please check the URL and try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative pb-20">
      {/* Modern Header Section */}
      <div className="bg-white px-3 sm:px-4 py-4 sm:py-6 sticky top-0 z-40 border-b border-gray-200 shadow-sm">
        {/* Header with Menu title and profile */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-700">Menu</h1>
          <motion.div 
            className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-200 transition-colors"
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/auth/user-login')}
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700" />
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 sm:pl-12 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
          />
        </div>

        {/* Dynamic Category Icons */}
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 mb-4 sm:mb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* All Category */}
          <motion.div
            className="flex flex-col items-center cursor-pointer flex-shrink-0"
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('all')}
          >
            <div className={`w-12 h-12 sm:w-16 sm:h-16 ${selectedCategory === 'all' ? 'bg-purple-600' : 'bg-gray-100 border border-gray-200'} rounded-2xl flex items-center justify-center mb-1 sm:mb-2 shadow-sm`}>
              <span className="text-lg sm:text-2xl">🍽️</span>
            </div>
            <span className={`text-xs sm:text-sm font-medium ${selectedCategory === 'all' ? 'text-purple-600 font-semibold' : 'text-gray-600'}`}>
              All
            </span>
          </motion.div>

          {/* Dynamic Categories from Dishes */}
          {getCategories().filter(cat => cat !== 'all').map((category) => {
            const categoryIcon = getCategoryIcon(category)
            const isActive = selectedCategory === category.toLowerCase()
            
            return (
              <motion.div
                key={category}
                className="flex flex-col items-center cursor-pointer flex-shrink-0"
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.toLowerCase())}
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 ${isActive ? 'bg-purple-600' : 'bg-gray-100 border border-gray-200'} rounded-2xl flex items-center justify-center mb-1 sm:mb-2 shadow-sm`}>
                  <span className="text-lg sm:text-2xl">{categoryIcon}</span>
                </div>
                <span className={`text-xs sm:text-sm font-medium ${isActive ? 'text-purple-600 font-semibold' : 'text-gray-600'} capitalize`}>
                  {category}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Menu Content */}
      <div className="px-3 sm:px-4 pb-8 relative z-10">
        {/* Popular Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Popular</h2>
          {dishes.length === 0 ? (
            // Empty state
            <motion.div 
              className="text-center py-12 sm:py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                className="text-4xl sm:text-6xl mb-4"
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
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                Menu Coming Soon
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                This restaurant hasn't added any dishes to their menu yet.
              </p>
            </motion.div>
          ) : filteredDishes.length === 0 ? (
            // No results state
            <motion.div 
              className="text-center py-12 sm:py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-4xl sm:text-6xl mb-4">🔍</div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                No dishes found
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Try adjusting your search or filter criteria
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            // Dishes Grid
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
                    className="bg-white rounded-2xl p-3 sm:p-4 relative overflow-hidden border border-gray-200 shadow-md cursor-pointer hover:shadow-lg hover:border-purple-200 transition-all duration-200"
                    onClick={() => {
                      setSelectedDish(dish)
                      setShowDishDetails(true)
                    }}
                  >
                    {/* Dish Image */}
                    <div className="w-full h-24 sm:h-32 mb-2 sm:mb-3 relative">
                      {dish.image_url ? (
                        <img
                          src={dish.image_url}
                          alt={dish.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                          <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Dish Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-lg mb-1 leading-tight">
                        {dish.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-600 font-bold text-sm sm:text-lg">
                          ₹{dish.price}
                        </span>
                        
                        {/* Add Button */}
                        {getCartItemQuantity(dish.id) === 0 ? (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              addToCart(dish)
                            }}
                            className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 rounded-full shadow-md flex items-center justify-center"
                            whileTap={{ scale: 0.95 }}
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </motion.button>
                        ) : (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeFromCart(dish.id)
                              }}
                              className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 rounded-full shadow-md flex items-center justify-center"
                              whileTap={{ scale: 0.9 }}
                            >
                              <Minus className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                            </motion.button>
                            <span className="font-bold text-xs sm:text-sm min-w-[1rem] sm:min-w-[1.5rem] text-center text-gray-900">
                              {getCartItemQuantity(dish.id)}
                            </span>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                addToCart(dish)
                              }}
                              className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 rounded-full shadow-md flex items-center justify-center"
                              whileTap={{ scale: 0.9 }}
                            >
                              <Plus className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
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

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 sm:px-4 py-2 sm:py-3 z-50 shadow-lg">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <motion.button
              className="flex flex-col items-center p-1 sm:p-2"
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </motion.button>
            
            <motion.button
              className="flex flex-col items-center p-1 sm:p-2"
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </motion.button>
            
            <motion.button
              className="flex flex-col items-center p-1 sm:p-2 relative"
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              {getCartItemCount() > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{getCartItemCount()}</span>
                </div>
              )}
            </motion.button>
            
            <motion.button
              className="flex flex-col items-center p-1 sm:p-2"
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Cart Modal - Simplified */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:mx-4 rounded-t-lg sm:rounded-lg max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Cart</h3>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.dish.id} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{item.dish.name}</h4>
                        <p className="text-sm text-gray-500">₹{item.dish.price} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item.dish.id)}
                          className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item.dish)}
                          className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Total: ₹{getCartTotal()}</span>
                    </div>
                    <Button
                      onClick={() => setShowCheckout(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dish Details Modal - Simplified */}
      {showDishDetails && selectedDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedDish.name}</h3>
              <button
                onClick={() => setShowDishDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {selectedDish.image_url && (
                <img
                  src={selectedDish.image_url}
                  alt={selectedDish.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Price</h4>
                  <p className="text-2xl font-bold text-purple-600">₹{selectedDish.price}</p>
                </div>
                {selectedDish.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                    <p className="text-gray-800">{selectedDish.description}</p>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => setShowDishDetails(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      addToCart(selectedDish)
                      setShowDishDetails(false)
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}