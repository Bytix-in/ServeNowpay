// This is the separate sections implementation for orders
// Replace the orders display section in page.tsx with this code

{/* Dine-In Orders Section */}
<div className="max-w-4xl bg-white rounded-xl shadow p-8 border mx-auto mb-8">
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          🍽️ Dine-In Orders ({orders.filter(order => order.order_type === 'dine_in' || !order.order_type).length})
        </h2>
        <p className="text-sm text-gray-500">Restaurant table orders</p>
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      {isConnected && (
        <span className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          <motion.div 
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          Real-time
        </span>
      )}
    </div>
  </div>

  {loading ? (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Loading dine-in orders...</p>
    </div>
  ) : orders.filter(order => order.order_type === 'dine_in' || !order.order_type).length === 0 ? (
    <div className="flex flex-col items-center justify-center py-12">
      <span className="text-6xl mb-4">🍽️</span>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Dine-In Orders</h3>
      <p className="text-gray-600">Table orders will appear here when customers place them</p>
    </div>
  ) : (
    <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
      {orders
        .filter(order => order.order_type === 'dine_in' || !order.order_type)
        .map((order, index) => (
          <motion.div
            key={order.id}
            className="border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all bg-blue-50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="font-mono font-bold text-blue-600 cursor-pointer"
                     onClick={() => {
                       setSelectedOrderId(order.id);
                       setShowOrderDetails(true);
                     }}>
                  #{order.unique_order_id}
                </div>
                <div className="text-sm text-gray-600">
                  {formatTime(order.created_at)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{order.customer_name}</p>
                <p className="text-sm text-gray-600">{order.customer_phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Table</p>
                <div className="bg-blue-200 px-3 py-1 rounded-full inline-block">
                  <p className="font-bold text-blue-900">Table {order.table_number}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-bold text-lg text-green-600">₹{order.total_amount.toFixed(2)}</p>
              </div>
            </div>

            {/* Order management buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {order.payment_status === 'completed' && (
                  <>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'in_progress')}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'in_progress' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700 transition"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'completed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'served')}
                        className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-700 transition"
                      >
                        Mark Served
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
    </div>
  )}
</div>

{/* Online Orders Section */}
<div className="max-w-4xl bg-white rounded-xl shadow p-8 border mx-auto">
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          🚚 Online Orders ({orders.filter(order => order.order_type === 'online').length})
        </h2>
        <p className="text-sm text-gray-500">Delivery orders</p>
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      {isConnected && (
        <span className="flex items-center gap-1 text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
          <motion.div 
            className="w-2 h-2 bg-purple-500 rounded-full"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          Real-time
        </span>
      )}
    </div>
  </div>

  {loading ? (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
      <p className="text-gray-600">Loading online orders...</p>
    </div>
  ) : orders.filter(order => order.order_type === 'online').length === 0 ? (
    <div className="flex flex-col items-center justify-center py-12">
      <span className="text-6xl mb-4">🚚</span>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Online Orders</h3>
      <p className="text-gray-600">Delivery orders will appear here when customers place them</p>
    </div>
  ) : (
    <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
      {orders
        .filter(order => order.order_type === 'online')
        .map((order, index) => (
          <motion.div
            key={order.id}
            className="border border-purple-200 rounded-lg p-4 hover:shadow-md transition-all bg-purple-50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="font-mono font-bold text-purple-600 cursor-pointer"
                     onClick={() => {
                       setSelectedOrderId(order.id);
                       setShowOrderDetails(true);
                     }}>
                  #{order.unique_order_id}
                </div>
                <div className="text-sm text-gray-600">
                  {formatTime(order.created_at)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{order.customer_name}</p>
                <p className="text-sm text-gray-600">{order.customer_phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivery Address</p>
                <div className="bg-purple-200 px-3 py-2 rounded-lg">
                  <p className="font-medium text-purple-900 text-sm">📍 {order.customer_address}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-bold text-lg text-green-600">₹{order.total_amount.toFixed(2)}</p>
              </div>
            </div>

            {/* Order management buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {order.payment_status === 'completed' && (
                  <>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'in_progress')}
                        className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-700 transition"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'in_progress' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700 transition"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'completed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'served')}
                        className="px-3 py-1 bg-orange-600 text-white text-xs rounded-full hover:bg-orange-700 transition"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
    </div>
  )}
</div>