// Test the create-payment API directly
async function testCreatePaymentAPI() {
  console.log('Testing create-payment API directly...')
  
  const testData = {
    restaurant_id: '09d73065-1329-4c65-bc20-77960709f5fa', // Demo restaurant ID
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
    total_amount: 200
  }
  
  try {
    const response = await fetch('http://localhost:3001/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    
    console.log('API Response Status:', response.status)
    console.log('API Response:', result)
    
    if (response.ok) {
      console.log('✅ API call successful!')
      if (result.redirect_url) {
        console.log('Redirect URL:', result.redirect_url)
      }
    } else {
      console.log('❌ API call failed')
      console.log('Error details:', result.details)
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message)
  }
}

testCreatePaymentAPI()