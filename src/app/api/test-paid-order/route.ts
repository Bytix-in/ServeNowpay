// Test API endpoint to simulate a paid order notification
// This is for testing the notification system

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { restaurantId } = await request.json();

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    // Generate a test order with completed payment
    const testOrder = {
      restaurant_id: restaurantId,
      customer_name: 'Test Customer',
      customer_phone: '9999999999',
      table_number: 'T1',
      items: [
        {
          dish_id: 'test-dish',
          dish_name: 'Test Dish',
          quantity: 1,
          price: 299.99,
          total: 299.99
        }
      ],
      total_amount: 299.99,
      status: 'pending',
      payment_status: 'completed', // This will trigger the notification
      unique_order_id: `TEST${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert the test order into the database
    const { data, error } = await supabase
      .from('orders')
      .insert([testOrder])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create test order' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test paid order created successfully',
      order: data
    });

  } catch (error) {
    console.error('Test paid order error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}