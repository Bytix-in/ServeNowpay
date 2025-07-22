const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qlvrvlrrqerzemmujyva.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdnJ2bHJycWVyemVtbXVqeXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODM1NTUsImV4cCI6MjA2ODY1OTU1NX0.iKkbtTChuT11VvXwUy8lMC9JIxd4ve6GD7CDPmzjeH8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabase() {
  console.log('Testing database connection...')
  
  try {
    // Test fetching restaurant
    console.log('1. Fetching demo restaurant...')
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', 'mycafe')
      .single()
    
    if (restaurantError) {
      console.error('Restaurant fetch error:', restaurantError)
      return
    }
    
    console.log('Restaurant found:', restaurant)
    
    // Test fetching menu items
    console.log('2. Fetching menu items...')
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurant.id)
    
    if (menuError) {
      console.error('Menu items fetch error:', menuError)
      return
    }
    
    console.log('Menu items found:', menuItems.length)
    
    // Test adding a menu item
    console.log('3. Testing menu item insert...')
    const testItem = {
      restaurant_id: restaurant.id,
      name: 'Test Dish',
      price: 99.99,
      description: 'This is a test dish',
      preparation_time: 10
    }
    
    const { data: newItem, error: insertError } = await supabase
      .from('menu_items')
      .insert([testItem])
      .select('*')
    
    if (insertError) {
      console.error('Insert error:', insertError)
      return
    }
    
    console.log('Successfully inserted test item:', newItem)
    
    // Clean up - delete the test item
    console.log('4. Cleaning up test item...')
    const { error: deleteError } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', newItem[0].id)
    
    if (deleteError) {
      console.error('Delete error:', deleteError)
    } else {
      console.log('Test item cleaned up successfully')
    }
    
    console.log('✅ All database tests passed!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  }
}

testDatabase()