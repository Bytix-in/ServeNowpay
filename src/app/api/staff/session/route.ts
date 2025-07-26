import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Update staff login status
export async function POST(request: NextRequest) {
  try {
    const { staff_id, action, session_token } = await request.json();

    if (!staff_id || !action) {
      return NextResponse.json(
        { error: 'Staff ID and action are required' },
        { status: 400 }
      );
    }

    let updateData: any = {};

    if (action === 'login') {
      updateData = {
        last_login_at: new Date().toISOString(),
        session_token: session_token || crypto.randomUUID(),
        is_online: true
      };
    } else if (action === 'logout') {
      updateData = {
        session_token: null,
        is_online: false
      };
    }

    const { data, error } = await supabase
      .from('staff')
      .update(updateData)
      .eq('id', staff_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating staff session:', error);
      return NextResponse.json(
        { error: 'Failed to update staff session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error in staff session API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get staff online status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurant_id = searchParams.get('restaurant_id');

    if (!restaurant_id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('staff')
      .select('id, name, is_online, last_login_at')
      .eq('restaurant_id', restaurant_id);

    if (error) {
      console.error('Error fetching staff status:', error);
      return NextResponse.json(
        { error: 'Failed to fetch staff status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error in staff session API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}