const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qlvrvlrrqerzemmujyva.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdnJ2bHJycWVyemVtbXVqeXZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MzU1NSwiZXhwIjoyMDY4NjU5NTU1fQ.vHgnum06sodAs4iVAabkEL5ef-_7TI2wmqb5W3eee4s'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createPaymentTables() {
  console.log('Creating payment tables...')
  
  try {
    // Try to create payment_settings table by inserting a test record
    console.log('1. Testing payment_settings table...')
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('id')
        .limit(1)
      
      if (error && error.code === '42P01') {
        console.log('Payment_settings table does not exist')
        console.log('Please create the tables manually using the Supabase SQL Editor:')
        console.log('Go to your Supabase dashboard → SQL Editor → New Query')
        console.log('Copy and paste the contents of database-setup.sql')
        console.log('Run the query to create all payment tables')
        return
      } else {
        console.log('Payment_settings table exists')
      }
    } catch (err) {
      console.log('Error checking payment_settings table:', err.message)
    }

    // Try to create transactions table by inserting a test record
    console.log('2. Testing transactions table...')
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id')
        .limit(1)
      
      if (error && error.code === '42P01') {
        console.log('Transactions table does not exist')
        return
      } else {
        console.log('Transactions table exists')
      }
    } catch (err) {
      console.log('Error checking transactions table:', err.message)
    }

    console.log('✅ Payment tables are ready!')
    
  } catch (error) {
    console.error('❌ Error checking payment tables:', error)
    console.log('\n📋 Manual Setup Instructions:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Create a new query')
    console.log('4. Copy the SQL from database-setup.sql')
    console.log('5. Run the query to create payment tables')
  }
}

createPaymentTables()