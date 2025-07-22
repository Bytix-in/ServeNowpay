const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qlvrvlrrqerzemmujyva.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdnJ2bHJycWVyemVtbXVqeXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODM1NTUsImV4cCI6MjA2ODY1OTU1NX0.iKkbtTChuT11VvXwUy8lMC9JIxd4ve6GD7CDPmzjeH8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testOrderCreation() {
  console.log('Testing order creation...')
  
  try {
    // Get demo restaurant ID
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', 'mycafe')
      .single()
    
    if (restaurantError) {
      console.error('Error getting restaurant:', restaurantError)
      return
    }
    
    console.log('Demo restaurant ID:', restaurant.id)
    
    // Test order creation
    const testOrder = {
      restaurant_id: restaurant.id,
      customer_name: 'Test Customer',
      customer_phone: '1234567890',
      table_number: '5',
      items: [
        {
          dish_id: '1',
          dish_name: 'Test Dish',
          quantity: 2,
          price: 100,
          total: 200
        }
      ],
      total_amount: 200,
      status: 'pending'
    }
    
    console.log('Creating test order...')
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([testOrder])
      .select()
      .single()
    
    if (orderError) {
      console.error('Order creation error:', orderError)
      console.log('Error details:', {
        code: orderError.code,
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint
      })
      return
    }
    
    console.log('✅ Order created successfully:', order.id)
    
    // Clean up - delete the test order
    await supabase
      .from('orders')
      .delete()
      .eq('id', order.id)
    
    console.log('Test order cleaned up')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testOrderCreation()