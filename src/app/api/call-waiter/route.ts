import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Waiter call request body:', body);
    
    const { restaurant_id, customer_name, table_number, customer_phone, message } = body;

    // Validate required fields
    if (!restaurant_id || !customer_name || !table_number) {
      console.log('Missing required fields:', { restaurant_id, customer_name, table_number });
      return NextResponse.json(
        { error: 'Missing required fields: restaurant_id, customer_name, table_number' },
        { status: 400 }
      );
    }

    // Generate a unique call ID
    const generateCallId = () => {
      const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const callId = generateCallId();

    // Create waiter call record
    const waiterCall = {
      id: callId,
      restaurant_id,
      customer_name,
      table_number,
      customer_phone: customer_phone || null,
      message: message || 'Customer is requesting assistance',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Attempting to insert waiter call:', waiterCall);

    // Insert into database
    const { data, error } = await supabase
      .from('waiter_calls')
      .insert([waiterCall])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      return NextResponse.json(
        { error: `Failed to create waiter call: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Waiter call created successfully:', data);

    return NextResponse.json({
      success: true,
      call_id: callId,
      message: 'Waiter call created successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurant_id = searchParams.get('restaurant_id');

    if (!restaurant_id) {
      return NextResponse.json(
        { error: 'Missing restaurant_id parameter' },
        { status: 400 }
      );
    }

    // Fetch pending waiter calls for the restaurant
    const { data, error } = await supabase
      .from('waiter_calls')
      .select('*')
      .eq('restaurant_id', restaurant_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch waiter calls' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      calls: data || []
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { call_id, status } = body;

    if (!call_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: call_id, status' },
        { status: 400 }
      );
    }

    // Update waiter call status
    const { data, error } = await supabase
      .from('waiter_calls')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', call_id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update waiter call' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Waiter call updated successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}