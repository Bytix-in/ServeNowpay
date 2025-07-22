const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qlvrvlrrqerzemmujyva.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdnJ2bHJycWVyemVtbXVqeXZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MzU1NSwiZXhwIjoyMDY4NjU5NTU1fQ.vHgnum06sodAs4iVAabkEL5ef-_7TI2wmqb5W3eee4s'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('Setting up database...')
  
  try {
    // Check if payment_settings table exists by trying to query it
    console.log('Checking if payment tables exist...')
    const { data: paymentCheck, error: paymentCheckError } = await supabase
      .from('payment_settings')
      .select('id')
      .limit(1)
    
    if (paymentCheckError && paymentCheckError.code === '42P01') {
      console.log('Payment tables do not exist. Please run the database-setup.sql file manually.')
      console.log('You can run it using a PostgreSQL client or through Supabase SQL editor.')
    } else {
      console.log('Payment tables exist')
    }

    // First, let's check if demo restaurant exists
    const { data: existingRestaurant, error: checkError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', 'mycafe')
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking restaurant:', checkError)
      return
    }
    
    let demoRestaurantId
    
    if (!existingRestaurant) {
      console.log('Creating demo restaurant...')
      
      // Insert demo restaurant
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .insert([
          {
            name: 'Demo Restaurant',
            slug: 'mycafe',
            owner_id: null
          }
        ])
        .select()
        .single()
      
      if (restaurantError) {
        console.error('Error creating restaurant:', restaurantError)
        return
      } else {
        console.log('Demo restaurant created:', restaurant)
        demoRestaurantId = restaurant.id
      }
    } else {
      console.log('Demo restaurant already exists:', existingRestaurant)
      demoRestaurantId = existingRestaurant.id
    }
    
    // Check if demo menu items exist
    const { data: existingMenuItems, error: menuCheckError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', demoRestaurantId)
    
    if (menuCheckError) {
      console.error('Error checking menu items:', menuCheckError)
    }
    
    if (!existingMenuItems || existingMenuItems.length === 0) {
      console.log('Creating demo menu items...')
      
      // Insert demo menu items without specifying IDs (let database generate them)
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .insert([
          {
            restaurant_id: demoRestaurantId,
            name: 'Butter Chicken',
            price: 299.00,
            description: 'Creamy tomato-based curry with tender chicken pieces',
            preparation_time: 20
          },
          {
            restaurant_id: demoRestaurantId,
            name: 'Biryani',
            price: 249.00,
            description: 'Fragrant basmati rice with spiced meat and vegetables',
            preparation_time: 30
          },
          {
            restaurant_id: demoRestaurantId,
            name: 'Naan Bread',
            price: 49.00,
            description: 'Fresh baked Indian flatbread',
            preparation_time: 5
          }
        ])
        .select()
      
      if (menuError) {
        console.error('Error creating menu items:', menuError)
      } else {
        console.log('Demo menu items created:', menuItems)
      }
    } else {
      console.log('Demo menu items already exist:', existingMenuItems.length, 'items')
    }
    
    console.log('Database setup completed successfully!')
    
  } catch (error) {
    console.error('Database setup failed:', error)
  }
}

setupDatabase()