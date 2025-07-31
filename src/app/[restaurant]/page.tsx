"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import WelcomeScreen from "@/components/customer/WelcomeScreen";
import { motion } from "framer-motion";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone_number?: string;
  cuisine_tags?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  dish_type: string;
  image_url?: string;
  image_data?: string;
  preparation_time?: number;
  ingredients?: string;
  tags?: string;
}

export default function CustomerMenuPage() {
  const params = useParams();
  const restaurantSlug = params.restaurant as string;
  
  const [showWelcome, setShowWelcome] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch restaurant and menu data
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        // Fetch restaurant info
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', restaurantSlug)
          .single();

        if (restaurantError) throw restaurantError;
        setRestaurant(restaurantData);

        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantData.id)
          .order('dish_type', { ascending: true })
          .order('name', { ascending: true });

        if (menuError) throw menuError;
        setMenuItems(menuData || []);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load restaurant data');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantSlug) {
      fetchRestaurantData();
    }
  }, [restaurantSlug]);

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    const category = item.dish_type || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center px-6">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Restaurant Not Found</h1>
          <p className="text-red-100 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-red-700 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show welcome screen first
  if (showWelcome) {
    return (
      <WelcomeScreen
        restaurantName={restaurant?.name}
        restaurantSlug={restaurantSlug}
        onGetStarted={handleGetStarted}
      />
    );
  }

  // Show menu after welcome screen
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-sm border-b sticky top-0 z-50"
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{restaurant?.name}</h1>
              {restaurant?.cuisine_tags && (
                <p className="text-gray-600 text-sm">{restaurant.cuisine_tags}</p>
              )}
            </div>
            <button
              onClick={() => setShowWelcome(true)}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              ← Back to Welcome
            </button>
          </div>
        </div>
      </motion.div>

      {/* Restaurant Info */}
      {(restaurant?.address || restaurant?.phone_number) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
        >
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex flex-wrap gap-6">
              {restaurant.address && (
                <div className="flex items-center gap-2">
                  <span className="text-purple-200">📍</span>
                  <span className="text-sm">{restaurant.address}</span>
                </div>
              )}
              {restaurant.phone_number && (
                <div className="flex items-center gap-2">
                  <span className="text-purple-200">📞</span>
                  <span className="text-sm">{restaurant.phone_number}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Menu Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {menuItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Menu Coming Soon</h2>
            <p className="text-gray-600">This restaurant is still setting up their menu.</p>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedMenuItems).map(([category, items], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + categoryIndex * 0.1, duration: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-purple-200">
                  {category}
                </h2>
                <div className="grid gap-6">
                  {items.map((item, itemIndex) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + categoryIndex * 0.1 + itemIndex * 0.05 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 mb-3 leading-relaxed">
                            {item.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            {item.preparation_time && (
                              <div className="flex items-center gap-1">
                                <span>⏱️</span>
                                <span>{item.preparation_time} mins</span>
                              </div>
                            )}
                            {item.ingredients && (
                              <div className="flex items-center gap-1">
                                <span>🥘</span>
                                <span>{item.ingredients}</span>
                              </div>
                            )}
                          </div>
                          
                          {item.tags && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {item.tags.split(',').map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-6 text-right">
                          <div className="text-2xl font-bold text-purple-600 mb-2">
                            {formatCurrency(item.price)}
                          </div>
                          <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition">
                            Add to Order
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="bg-gray-900 text-white py-8 mt-16"
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            Powered by <span className="text-purple-400 font-semibold">ServeNow</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}