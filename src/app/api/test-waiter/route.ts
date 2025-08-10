import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST WAITER CALL API ===');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    // Test database connection first
    const { data: testData, error: testError } = await supabase
      .from('restaurants')
      .select('id')
      .limit(1);
      
    if (testError) {
      console.error('Database connection test failed:', testError);
      return NextResponse.json({
        error: 'Database connection failed',
        details: testError.message
      }, { status: 500 });
    }
    
    console.log('Database connection OK');
    
    // Test if waiter_calls table exists
    const { data: tableTest, error: tableError } = await supabase
      .from('waiter_calls')
      .select('*')
      .limit(1);
      
    if (tableError) {
      console.error('Waiter calls table test failed:', tableError);
      return NextResponse.json({
        error: 'Waiter calls table issue',
        details: tableError.message
      }, { status: 500 });
    }
    
    console.log('Waiter calls table exists');
    
    // Try to insert a test record
    const testRecord = {
      id: 'TEST01',
      restaurant_id: body.restaurant_id,
      customer_name: body.customer_name || 'Test Customer',
      table_number: body.table_number || 'T1',
      customer_phone: body.customer_phone || null,
      message: body.message || 'Test message',
      status: 'pending'
    };
    
    console.log('Attempting to insert:', testRecord);
    
    const { data, error } = await supabase
      .from('waiter_calls')
      .insert([testRecord])
      .select()
      .single();
      
    if (error) {
      console.error('Insert failed:', error);
      return NextResponse.json({
        error: 'Insert failed',
        details: error.message,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }
    
    console.log('Insert successful:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Test waiter call created',
      data: data
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}